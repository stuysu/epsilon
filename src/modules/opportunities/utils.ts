import dayjs from "dayjs";
import { toNewYork } from "../../utils/NewYorkTime";
import { isRollingText, MS_PER_DAY } from "./bulletin/normalize";
import {
    Opportunity,
    OpportunityCategory,
    OpportunityEligibility,
    OpportunityFilters,
    OpportunityStatus,
} from "./types";

export const DEFAULT_FILTERS: OpportunityFilters = {
    query: "",
    statuses: [],
    deadlines: [],
    categoryIds: [],
    eligibilityIds: [],
    showIneligible: true,
    costRange: null,
    sort: "deadline",
};

const URGENT_DAYS = 14;
const SHORT_DEADLINE_TEXT = 24;

// Deadlines end at 23:59:59 Eastern, so compare against the date in New York.
export const getTodayEastern = (now?: Date) =>
    toNewYork(now).format("YYYY-MM-DD");

export const pluralize = (count: number, one: string, many: string) =>
    `${count} ${count === 1 ? one : many}`;

export const toggleValue = <T>(values: T[], value: T) =>
    values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value];

const daysUntil = (deadline: string, today: string) =>
    (Date.parse(deadline) - Date.parse(today)) / MS_PER_DAY;

export const isArchived = (opportunity: Opportunity, today: string) =>
    opportunity.archived ||
    (opportunity.deadline !== null && opportunity.deadline < today);

// Only grade can be checked automatically. Epsilon does not store group-based
// traits such as financial need, so those remain filters students choose.
export const isIneligible = (opportunity: Opportunity, grade: number) => {
    if (grade < 9 || grade > 12) return false;
    const grades = opportunity.eligibilities.flatMap((e) =>
        e.grade === null ? [] : [e.grade],
    );
    return grades.length > 0 && !grades.includes(grade);
};

export const getCostLabel = ({ cost_text }: Opportunity) =>
    cost_text ?? "Check description";

// dates here are plain calendar days, such as "2026-11-07"
export const formatDate = (date: string, { withYear = false } = {}) =>
    dayjs(date).format(withYear ? "MMMM D, YYYY" : "MMMM D");

export const getStatus = (
    opportunity: Opportunity,
    grade: number,
    today: string,
): OpportunityStatus => {
    const neutral = (label: string, icon: string): OpportunityStatus => ({
        label,
        icon,
        tone: "neutral",
        struck: false,
    });

    if (isIneligible(opportunity, grade)) {
        return {
            label: "Ineligible",
            icon: "bx-x-circle",
            tone: "danger",
            struck: true,
        };
    }
    if (isArchived(opportunity, today)) {
        return {
            label: "Archived",
            icon: "bx-archive",
            tone: "neutral",
            struck: true,
        };
    }
    if (opportunity.deadline) {
        return {
            label: `Apply by ${formatDate(opportunity.deadline)}`,
            icon: "bx-time-five",
            tone:
                daysUntil(opportunity.deadline, today) <= URGENT_DAYS
                    ? "urgent"
                    : "neutral",
            struck: false,
        };
    }
    if (isRollingText(opportunity.deadline_text)) {
        return neutral("Rolling Basis", "bx-trending-up");
    }
    const text = opportunity.deadline_text;
    return neutral(
        text && text.length <= SHORT_DEADLINE_TEXT
            ? `Deadline: ${text}`
            : "Check deadline",
        "bx-info-circle",
    );
};

const matchesCategories = (
    opportunity: Opportunity,
    categoryIds: number[],
    categories: OpportunityCategory[],
) => {
    if (!categoryIds.length) return true;
    const selected = new Set(categoryIds);
    return opportunity.categories.some((category) => {
        if (selected.has(category.id)) return true;
        // Selecting a main category includes everything filed under it.
        const parent = categories.find((c) => c.id === category.parent_id);
        return parent !== undefined && selected.has(parent.id);
    });
};

const matchesEligibilities = (
    opportunity: Opportunity,
    eligibilityIds: number[],
    eligibilities: OpportunityEligibility[],
) => {
    const selected = eligibilities.filter((e) => eligibilityIds.includes(e.id));
    const selectedGrades = selected.filter((e) => e.grade !== null);
    const selectedGroups = selected.filter((e) => e.grade === null);
    const tagIds = new Set(opportunity.eligibilities.map((e) => e.id));
    const hasGradeTags = opportunity.eligibilities.some(
        (e) => e.grade !== null,
    );

    // An opportunity with no grade tags is open to every grade.
    const gradeMatches =
        !selectedGrades.length ||
        !hasGradeTags ||
        selectedGrades.some((e) => tagIds.has(e.id));
    // A group filter only shows opportunities aimed at that group.
    const groupMatches =
        !selectedGroups.length || selectedGroups.some((e) => tagIds.has(e.id));

    return gradeMatches && groupMatches;
};

const matchesCost = (
    { cost_min, cost_max }: Opportunity,
    costRange: OpportunityFilters["costRange"],
) => {
    if (!costRange || cost_min === null) return true;
    return (cost_max ?? cost_min) >= costRange[0] && cost_min <= costRange[1];
};

const matchesDeadline = (
    opportunity: Opportunity,
    deadlines: OpportunityFilters["deadlines"],
    today: string,
) => {
    if (!deadlines.length) return true;
    if (isRollingText(opportunity.deadline_text)) {
        return deadlines.includes("rolling");
    }
    if (!opportunity.deadline) return false;
    const days = daysUntil(opportunity.deadline, today);
    return deadlines.includes("week") && days >= 0 && days <= 7;
};

const matchesQuery = (opportunity: Opportunity, query: string) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [
        opportunity.title,
        opportunity.description,
        opportunity.date_text,
        opportunity.location,
        opportunity.eligibility_text,
        ...opportunity.categories.map((c) => c.name),
    ].some((field) => field?.toLowerCase().includes(needle));
};

const compareOpportunities = (
    a: Opportunity,
    b: Opportunity,
    sort: OpportunityFilters["sort"],
    today: string,
) => {
    const archivedOrder =
        Number(isArchived(a, today)) - Number(isArchived(b, today));
    if (archivedOrder !== 0) return archivedOrder;
    if (sort === "newest") return b.created_at.localeCompare(a.created_at);
    // Dated opportunities first, soonest deadline on top, then undated ones.
    if (a.deadline === b.deadline) return a.title.localeCompare(b.title);
    if (a.deadline === null) return 1;
    if (b.deadline === null) return -1;
    return a.deadline.localeCompare(b.deadline);
};

export const sortOpportunities = (
    opportunities: Opportunity[],
    sort: OpportunityFilters["sort"],
    today: string,
) => [...opportunities].sort((a, b) => compareOpportunities(a, b, sort, today));

export const filterOpportunities = (
    opportunities: Opportunity[],
    filters: OpportunityFilters,
    categories: OpportunityCategory[],
    eligibilities: OpportunityEligibility[],
    grade: number,
    today: string,
) =>
    sortOpportunities(
        opportunities.filter((opportunity) => {
            const archived = isArchived(opportunity, today);
            const statusMatches =
                !filters.statuses.length ||
                filters.statuses.includes(archived ? "archived" : "active");

            return (
                statusMatches &&
                matchesQuery(opportunity, filters.query) &&
                matchesDeadline(opportunity, filters.deadlines, today) &&
                matchesCategories(
                    opportunity,
                    filters.categoryIds,
                    categories,
                ) &&
                matchesEligibilities(
                    opportunity,
                    filters.eligibilityIds,
                    eligibilities,
                ) &&
                matchesCost(opportunity, filters.costRange) &&
                (filters.showIneligible || !isIneligible(opportunity, grade))
            );
        }),
        filters.sort,
        today,
    );
