import { describe, expect, it } from "vitest";
import {
    DEFAULT_FILTERS,
    filterOpportunities,
    getCostLabel,
    getStatus,
    getTodayEastern,
    isIneligible,
} from "./utils";
import {
    Opportunity,
    OpportunityCategory,
    OpportunityTag,
    Student,
} from "./types";

const TODAY = "2026-11-02";
const asGrade = (grade: number): Student => ({ grade, groups: null });
const JUNIOR = asGrade(11);

const junior: OpportunityTag = {
    id: 3,
    name: "Junior",
    grade: 11,
    position: 3,
    preferred: false,
};
const senior: OpportunityTag = {
    id: 4,
    name: "Senior",
    grade: 12,
    position: 4,
    preferred: false,
};
const aid: OpportunityTag = {
    id: 9,
    name: "Needs Financial Aid",
    grade: null,
    position: 9,
    preferred: false,
};
const eligibilities = [junior, senior, aid];

const main: OpportunityCategory = {
    id: 1,
    name: "STEM Opportunities",
    parent_id: null,
    position: 1,
};
const sub: OpportunityCategory = {
    id: 2,
    name: "Medical & Life Sciences",
    parent_id: 1,
    position: 1,
};
const categories = [main, sub];

const make = (overrides: Partial<Opportunity> = {}): Opportunity => ({
    id: 1,
    title: "Program",
    title_key: "program",
    description: "A description",
    date_text: null,
    location: null,
    cost_text: "Free",
    cost_min: 0,
    cost_max: 0,
    deadline: null,
    deadline_text: "Rolling Basis",
    eligibility_text: null,
    links: [],
    bulletin_label: null,
    archived: false,
    edited_fields: [],
    edited_at: null,
    updated_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    categories: [],
    eligibilities: [],
    ...overrides,
});

const run = (
    opportunities: Opportunity[],
    filters: Partial<typeof DEFAULT_FILTERS> = {},
    student = JUNIOR,
) =>
    filterOpportunities(
        opportunities,
        { ...DEFAULT_FILTERS, ...filters },
        categories,
        eligibilities,
        student,
        TODAY,
    ).map((o) => o.id);

describe("getTodayEastern", () => {
    it("uses the New York date, not the UTC one", () => {
        expect(getTodayEastern(new Date("2026-11-03T02:00:00Z"))).toBe(
            "2026-11-02",
        );
    });
});

describe("isIneligible", () => {
    const seniorsOnly = make({ eligibilities: [senior] });

    it("flags grades outside the tagged ones", () => {
        expect(isIneligible(seniorsOnly, asGrade(11))).toBe(true);
        expect(isIneligible(seniorsOnly, asGrade(12))).toBe(false);
    });

    it("never flags faculty or users with no grade", () => {
        expect(isIneligible(seniorsOnly, asGrade(0))).toBe(false);
        expect(isIneligible(seniorsOnly, asGrade(-1))).toBe(false);
    });

    it("checks group tags only once About You is filled in", () => {
        const aidOnly = make({ eligibilities: [aid] });
        expect(isIneligible(aidOnly, JUNIOR)).toBe(false);
        expect(isIneligible(aidOnly, { grade: 11, groups: [] })).toBe(true);
        expect(
            isIneligible(aidOnly, {
                grade: 11,
                groups: ["Needs Financial Aid"],
            }),
        ).toBe(false);
    });

    it("never flags a preferred tag", () => {
        const preferred = make({
            eligibilities: [
                { ...senior, preferred: true },
                { ...aid, preferred: true },
            ],
        });
        expect(isIneligible(preferred, { grade: 11, groups: [] })).toBe(false);
    });
});

describe("getStatus", () => {
    it("treats a deadline as open through its whole day", () => {
        const status = getStatus(make({ deadline: TODAY }), JUNIOR, TODAY);
        expect(status.label).toBe("Due Today");
        expect(status.tone).toBe("urgent");
    });

    it("archives once the deadline has passed", () => {
        const status = getStatus(
            make({ deadline: "2026-11-01" }),
            JUNIOR,
            TODAY,
        );
        expect(status.label).toBe("Archived");
        expect(status.struck).toBe(true);
    });

    it("shows rolling and far-off deadlines as neutral", () => {
        expect(getStatus(make(), JUNIOR, TODAY).label).toBe("Rolling Basis");
        expect(
            getStatus(make({ deadline: "2027-03-01" }), JUNIOR, TODAY).tone,
        ).toBe("neutral");
    });

    it("does not call an unknown deadline rolling", () => {
        expect(
            getStatus(make({ deadline_text: "TBD" }), JUNIOR, TODAY).label,
        ).toBe("Deadline: TBD");
        expect(
            getStatus(make({ deadline_text: null }), JUNIOR, TODAY).label,
        ).toBe("Check deadline");
    });

    it("puts ineligible ahead of archived", () => {
        const status = getStatus(
            make({ archived: true, eligibilities: [senior] }),
            JUNIOR,
            TODAY,
        );
        expect(status.label).toBe("Ineligible");
    });
});

describe("getCostLabel", () => {
    it("shows the bulletin's wording", () => {
        expect(getCostLabel(make({ cost_text: "$500 - $1,500" }))).toBe(
            "$500 - $1,500",
        );
        expect(getCostLabel(make({ cost_text: null }))).toBe(
            "Check description",
        );
    });
});

describe("filterOpportunities", () => {
    it("treats regex characters in a search as plain text", () => {
        const list = [make({ id: 1, title: "C++ (intro)" }), make({ id: 2 })];
        expect(run(list, { query: "(intro" })).toEqual([1]);
    });

    it("includes subcategories when their main category is selected", () => {
        const list = [
            make({ id: 1, categories: [sub] }),
            make({ id: 2, categories: [main] }),
            make({ id: 3 }),
        ];
        expect(run(list, { categoryIds: [1] }).sort()).toEqual([1, 2]);
        expect(run(list, { categoryIds: [2] })).toEqual([1]);
    });

    it("keeps untagged opportunities for a grade filter only", () => {
        const list = [
            make({ id: 1 }),
            make({ id: 2, eligibilities: [senior] }),
            make({ id: 3, eligibilities: [aid] }),
        ];
        expect(run(list, { eligibilityIds: [3] }).sort()).toEqual([1, 3]);
        expect(run(list, { eligibilityIds: [9] })).toEqual([3]);
    });

    it("counts a preferred group for a group filter, but not as a grade limit", () => {
        const list = [
            make({ id: 1, eligibilities: [{ ...aid, preferred: true }] }),
            make({ id: 2, eligibilities: [{ ...senior, preferred: true }] }),
        ];
        expect(run(list, { eligibilityIds: [9] })).toEqual([1]);
        expect(run(list, { eligibilityIds: [3] }).sort()).toEqual([1, 2]);
    });

    it("hides ineligible opportunities unless asked to show them", () => {
        const list = [
            make({ id: 1, eligibilities: [senior] }),
            make({ id: 2 }),
        ];
        expect(run(list)).toEqual([2]);
        expect(run(list, { showIneligible: true }).sort()).toEqual([1, 2]);
    });

    it("matches cost ranges and always shows unpriced ones", () => {
        const list = [
            make({ id: 1, cost_min: 500, cost_max: 500 }),
            make({ id: 2, cost_min: null, cost_max: null }),
            make({ id: 3, cost_min: 50, cost_max: 50 }),
            make({ id: 4, cost_min: 90, cost_max: 900 }),
        ];
        expect(run(list, { costRange: [0, 100] }).sort()).toEqual([2, 3, 4]);
    });

    it("filters by status and deadline", () => {
        const list = [
            make({ id: 1, deadline: "2026-11-05", deadline_text: "Nov 5" }),
            make({ id: 2, deadline: "2026-12-05", deadline_text: "Dec 5" }),
            make({ id: 3 }),
            make({ id: 4, archived: true }),
            make({ id: 5, deadline_text: "TBD" }),
        ];
        expect(run(list, { statuses: ["archived"] })).toEqual([4]);
        expect(run(list, { deadlines: ["week"] })).toEqual([1]);
        expect(run(list, { deadlines: ["rolling"] }).sort()).toEqual([3, 4]);
    });

    it("treats rolling wording with a set date as dated", () => {
        const list = [
            make({ id: 1, deadline: "2026-11-05", deadline_text: "Rolling" }),
        ];
        expect(run(list, { deadlines: ["week"] })).toEqual([1]);
        expect(run(list, { deadlines: ["rolling"] })).toEqual([]);
    });

    it("sorts soonest first, then undated, with archived last", () => {
        const list = [
            make({ id: 1, archived: true, deadline: "2026-11-03" }),
            make({ id: 2 }),
            make({ id: 3, deadline: "2026-12-01" }),
            make({ id: 4, deadline: "2026-11-10" }),
        ];
        expect(run(list)).toEqual([4, 3, 2, 1]);
    });

    it("does not reorder the list it was given", () => {
        const list = [make({ id: 1 }), make({ id: 2, deadline: "2026-11-05" })];
        run(list);
        expect(list.map((o) => o.id)).toEqual([1, 2]);
    });
});
