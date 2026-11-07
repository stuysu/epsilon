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
    // a catalog row this entry may be a reworded copy of
    renameCandidate: { id: number; title: string } | null;
    renameSettled: boolean;
    tagsChosenByHand: boolean;
    deadlineChosenByHand: boolean;
};

export type ReviewPatch = EntryPatch &
    Partial<Pick<ReviewEntry, "existingId" | "renameSettled">>;

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

const linkKey = (link: string) => {
    try {
        const url = new URL(link);
        const path = url.pathname.replace(/\/+$/, "");
        return path
            ? `${url.hostname.replace(/^www\./, "")}${path}`.toLowerCase()
            : null;
    } catch {
        return null;
    }
};

const IGNORED_WORDS = /^(the|of|and|for|a|an|in|at|to|\d{4})$/;
const titleWords = (title: string) =>
    new Set(
        (title.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
            (word) => !IGNORED_WORDS.test(word),
        ),
    );

// words used by many titles, such as "University", count for little
const similarity = (
    a: Set<string>,
    b: Set<string>,
    weight: (word: string) => number,
) => {
    let shared = 0;
    let total = 0;
    new Set([...a, ...b]).forEach((word) => {
        total += weight(word);
        if (a.has(word) && b.has(word)) shared += weight(word);
    });
    return total ? shared / total : 0;
};

// pairs unmatched entries with rows that look like reworded copies
export const findRenames = (
    entries: ParsedEntry[],
    existing: Opportunity[],
    everyListing: { title: string; links: string[] }[],
) => {
    const wordCounts = new Map<string, number>();
    everyListing.forEach(({ title }) =>
        titleWords(title).forEach((word) =>
            wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1),
        ),
    );
    const weight = (word: string) => 1 / (wordCounts.get(word) ?? 1);

    const linkCounts = new Map<string, number>();
    everyListing.forEach(({ links }) =>
        new Set(links.map(linkKey)).forEach((key) => {
            if (key) linkCounts.set(key, (linkCounts.get(key) ?? 0) + 1);
        }),
    );
    const uniqueLinks = (links: string[]) =>
        links
            .map(linkKey)
            .filter((key): key is string => linkCounts.get(key ?? "") === 2);

    const pairs = entries.flatMap((entry) => {
        const entryLinks = uniqueLinks(entry.links);
        const entryWords = titleWords(entry.title);
        return existing.flatMap((opportunity) => {
            const sharedLink = uniqueLinks(opportunity.links).some((key) =>
                entryLinks.includes(key),
            );
            const titleScore = similarity(
                entryWords,
                titleWords(opportunity.title),
                weight,
            );
            const sameCategory = opportunity.categories.some((c) =>
                entry.categories.includes(c.name),
            );
            if (titleScore < (sharedLink ? 0.1 : 0.5)) return [];
            // one organization often uses a link for several programs
            const sure =
                (sharedLink && titleScore >= 0.3) ||
                (sameCategory && titleScore >= 0.75);
            const score =
                Number(sharedLink) + titleScore + (sameCategory ? 0.25 : 0);
            return [{ entry, opportunity, sure, score }];
        });
    });

    const renames = new Map<
        ParsedEntry,
        { opportunity: Opportunity; sure: boolean }
    >();
    const taken = new Set<number>();
    pairs
        .sort((a, b) => b.score - a.score)
        .forEach(({ entry, opportunity, sure }) => {
            if (renames.has(entry) || taken.has(opportunity.id)) return;
            renames.set(entry, { opportunity, sure });
            taken.add(opportunity.id);
        });
    return renames;
};

// title is the match key, so ids and saved lists carry over week to week
export const buildReview = (
    entries: ParsedEntry[],
    existing: Opportunity[],
): ReviewEntry[] => {
    const byKey = new Map(existing.map((o) => [o.title_key, o]));
    const matches = entries.map((entry) => byKey.get(entry.titleKey));
    const matchedIds = new Set(matches.map((match) => match?.id));
    const renames = findRenames(
        entries.filter((entry, i) => entry.include && !matches[i]),
        existing.filter((o) => !matchedIds.has(o.id)),
        [...entries, ...existing],
    );

    return entries.map((entry, i) => {
        const rename = renames.get(entry);
        const match =
            matches[i] ?? (rename?.sure ? rename.opportunity : undefined);
        return {
            ...entry,
            ...describeChange(entry, match),
            existingId: match?.id ?? null,
            renameCandidate: rename
                ? { id: rename.opportunity.id, title: rename.opportunity.title }
                : null,
            renameSettled: false,
            tagsChosenByHand: false,
            deadlineChosenByHand: false,
        };
    });
};

// an entry whose title is fixed to match a row becomes an update of it
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

// only a Long issue can suggest archiving
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
        | "preferredTags"
        | "links"
        | "categories"
        | "include"
    >
>;

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
        next.preferredTags = eligibility.preferredTags;
        next.eligibilityUnclear = eligibility.unclear;
    }
    // choosing tags by hand settles an unclear eligibility sentence
    if ("eligibilityTags" in patch || "preferredTags" in patch) {
        next.eligibilityUnclear = false;
        if ("tagsChosenByHand" in next) next.tagsChosenByHand = true;
    }

    next.warnings = getEntryWarnings(next);
    return next;
};

export const findPublishProblems = (
    entries: (ParsedEntry & { existingId?: number | null })[],
    categories: OpportunityCategory[],
    existing: Opportunity[] = [],
) => {
    const problems: string[] = [];
    const included = entries.filter((entry) => entry.include);
    const seen = new Set<string>();
    const updatedIds = new Set<number>();
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

        if (entry.existingId != null) {
            if (updatedIds.has(entry.existingId)) {
                const row = existing.find((o) => o.id === entry.existingId);
                problems.push(
                    `Two entries update "${row?.title ?? entry.title}". Unlink one of them.`,
                );
            }
            updatedIds.add(entry.existingId);
        }

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
            preferred_eligibility_ids: idsFor(
                entry.preferredTags.filter(
                    (tag) => !entry.eligibilityTags.includes(tag),
                ),
                eligibilities,
            ),
        }));
};
