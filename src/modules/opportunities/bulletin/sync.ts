import type {
    Opportunity,
    OpportunityCategory,
    OpportunityEligibility,
} from "../types";
import {
    getTitleKey,
    parseCost,
    parseDeadline,
    parseEligibilityTags,
} from "./normalize";
import { BulletinMeta, getEntryWarnings, ParsedEntry } from "./parse";

export type EntryChange = "new" | "changed" | "unchanged";

export type ReviewEntry = ParsedEntry & {
    change: EntryChange;
    changedFields: string[];
    // the catalog row this entry updates, kept even if its title is edited
    existingId: number | null;
    // tags picked in review are kept when the eligibility wording is edited
    tagsChosenByHand: boolean;
    // and so is a deadline date picked in review
    deadlineChosenByHand: boolean;
};

const sameList = (a: string[], b: string[]) =>
    a.length === b.length &&
    [...a].sort().join("|") === [...b].sort().join("|");

const getChangedFields = (entry: ParsedEntry, existing: Opportunity) => {
    const comparisons: [string, boolean][] = [
        ["Title", entry.title === existing.title],
        ["Description", entry.description === existing.description],
        ["Dates", entry.dateText === existing.date_text],
        ["Location", entry.location === existing.location],
        ["Cost", entry.costText === existing.cost_text],
        [
            "Deadline",
            entry.deadlineText === existing.deadline_text &&
                entry.deadline === existing.deadline,
        ],
        ["Eligibility", entry.eligibilityText === existing.eligibility_text],
        ["Links", sameList(entry.links, existing.links)],
        [
            "Categories",
            sameList(
                entry.categories,
                existing.categories.map((category) => category.name),
            ),
        ],
    ];
    return comparisons.filter(([, same]) => !same).map(([name]) => name);
};

// Sorts a parsed bulletin against the current catalog. Titles are the match key,
// so an opportunity keeps its id, and students' saved lists, week to week.
const describeChange = (entry: ParsedEntry, match: Opportunity | undefined) => {
    if (!match) return { change: "new" as const, changedFields: [] };
    const changedFields = getChangedFields(entry, match);
    return {
        change: changedFields.length
            ? ("changed" as const)
            : ("unchanged" as const),
        changedFields,
    };
};

export const buildReview = (
    entries: ParsedEntry[],
    existing: Opportunity[],
): ReviewEntry[] => {
    const byKey = new Map(existing.map((o) => [o.title_key, o]));

    return entries.map((entry) => {
        const match = byKey.get(entry.titleKey);
        return {
            ...entry,
            ...describeChange(entry, match),
            existingId: match?.id ?? null,
            tagsChosenByHand: false,
            deadlineChosenByHand: false,
        };
    });
};

// An entry read as new whose title an admin fixes to match a catalog row
// becomes an update of that row, unless another entry already updates it.
export const adoptExistingMatch = (
    entry: ReviewEntry,
    existing: Opportunity[],
    entries: ReviewEntry[],
): ReviewEntry => {
    if (entry.existingId !== null) return entry;
    const match = existing.find((o) => o.title_key === entry.titleKey);
    const claimed = entries.some(
        (other) => other !== entry && other.existingId === match?.id,
    );
    return match && !claimed ? { ...entry, existingId: match.id } : entry;
};

// Compares an edited entry with the catalog row it updates.
export const refreshChange = (
    entry: ReviewEntry,
    existing: Opportunity[],
): ReviewEntry => ({
    ...entry,
    ...describeChange(
        entry,
        existing.find((o) => o.id === entry.existingId),
    ),
});

// Only a Long bulletin lists every opportunity. The Short one leaving something
// out means nothing, so it can never suggest archiving.
export const findNoLongerListed = (
    entries: (Pick<ParsedEntry, "titleKey" | "include"> & {
        existingId?: number | null;
    })[],
    existing: Opportunity[],
    meta: BulletinMeta,
) => {
    if (!meta.isLong) return [];
    const included = entries.filter((e) => e.include);
    const listedKeys = new Set(included.map((e) => e.titleKey));
    // a renamed entry still lists the row it updates
    const listedIds = new Set(included.map((e) => e.existingId));
    return existing.filter(
        (o) =>
            !o.archived && !listedKeys.has(o.title_key) && !listedIds.has(o.id),
    );
};

export type EntryPatch = Partial<
    Pick<
        ParsedEntry,
        | "title"
        | "description"
        | "dateText"
        | "location"
        | "costText"
        | "deadline"
        | "deadlineText"
        | "eligibilityText"
        | "eligibilityTags"
        | "links"
        | "categories"
        | "include"
    >
>;

// Keeps derived values in step with whatever text an admin corrects.
export const applyEntryPatch = <
    T extends ParsedEntry & {
        tagsChosenByHand?: boolean;
        deadlineChosenByHand?: boolean;
    },
>(
    entry: T,
    patch: EntryPatch,
    publishedOn: string,
): T => {
    const next = { ...entry, ...patch };

    if ("title" in patch) next.titleKey = getTitleKey(next.title);
    if ("costText" in patch) {
        const cost = parseCost(next.costText);
        next.costMin = cost.min;
        next.costMax = cost.max;
    }
    if ("deadlineText" in patch && !next.deadlineChosenByHand) {
        next.deadline = parseDeadline(next.deadlineText, publishedOn);
    }
    if ("deadline" in patch && !("deadlineText" in patch)) {
        if ("deadlineChosenByHand" in next) next.deadlineChosenByHand = true;
    }
    if ("eligibilityText" in patch && !next.tagsChosenByHand) {
        const eligibility = parseEligibilityTags(next.eligibilityText);
        next.eligibilityTags = eligibility.tags;
        next.eligibilityUnclear = eligibility.unclear;
    }
    // choosing tags by hand settles an unclear eligibility sentence
    if ("eligibilityTags" in patch) {
        next.eligibilityUnclear = false;
        if ("tagsChosenByHand" in next) next.tagsChosenByHand = true;
    }

    next.warnings = getEntryWarnings(next);
    return next;
};

// Problems that would make publishing fail or lose a listing.
export const findPublishProblems = (
    entries: (ParsedEntry & { existingId?: number | null })[],
    categories: OpportunityCategory[],
    existing: Opportunity[] = [],
) => {
    const problems: string[] = [];
    const included = entries.filter((entry) => entry.include);
    const seen = new Set<string>();
    const known = new Set(categories.map((category) => category.name));
    const existingByKey = new Map(existing.map((o) => [o.title_key, o]));

    included.forEach((entry) => {
        const other = existingByKey.get(entry.titleKey);
        if (!entry.titleKey) {
            problems.push("An included opportunity has no title.");
        } else if (seen.has(entry.titleKey)) {
            problems.push(`"${entry.title}" is listed twice.`);
        } else if (other && other.id !== (entry.existingId ?? null)) {
            // publishing would overwrite that other opportunity
            problems.push(
                `"${entry.title}" has the same title as another opportunity.`,
            );
        }
        seen.add(entry.titleKey);

        if (!entry.categories.some((name) => known.has(name))) {
            problems.push(`"${entry.title}" needs a category.`);
        }
    });
    return problems;
};

const nullIfEmpty = (value: string | null) => value?.trim() || null;

export const toImportEntries = (
    entries: (ParsedEntry & { existingId?: number | null })[],
    categories: OpportunityCategory[],
    eligibilities: OpportunityEligibility[],
) => {
    const idsFor = (names: string[], options: { id: number; name: string }[]) =>
        options.filter((o) => names.includes(o.name)).map((o) => o.id);

    return entries
        .filter((entry) => entry.include)
        .map((entry) => ({
            id: entry.existingId ?? null,
            title: entry.title.trim(),
            title_key: entry.titleKey,
            description: entry.description,
            date_text: nullIfEmpty(entry.dateText),
            location: nullIfEmpty(entry.location),
            cost_text: nullIfEmpty(entry.costText),
            cost_min: entry.costMin,
            cost_max: entry.costMax,
            deadline: entry.deadline,
            deadline_text: nullIfEmpty(entry.deadlineText),
            eligibility_text: nullIfEmpty(entry.eligibilityText),
            links: entry.links,
            bulletin_label: entry.label,
            category_ids: idsFor(entry.categories, categories),
            eligibility_ids: idsFor(entry.eligibilityTags, eligibilities),
        }));
};
