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
    OpportunityEligibility,
} from "./types";

const TODAY = "2026-11-02";

const junior: OpportunityEligibility = {
    id: 3,
    name: "Junior",
    grade: 11,
    position: 3,
};
const senior: OpportunityEligibility = {
    id: 4,
    name: "Senior",
    grade: 12,
    position: 4,
};
const aid: OpportunityEligibility = {
    id: 9,
    name: "Needs Financial Aid",
    grade: null,
    position: 9,
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
    created_at: "2026-01-01T00:00:00Z",
    categories: [],
    eligibilities: [],
    ...overrides,
});

const run = (
    opportunities: Opportunity[],
    filters: Partial<typeof DEFAULT_FILTERS> = {},
    grade = 11,
) =>
    filterOpportunities(
        opportunities,
        { ...DEFAULT_FILTERS, ...filters },
        categories,
        eligibilities,
        grade,
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
        expect(isIneligible(seniorsOnly, 11)).toBe(true);
        expect(isIneligible(seniorsOnly, 12)).toBe(false);
    });

    it("never flags faculty or users with no grade", () => {
        expect(isIneligible(seniorsOnly, 0)).toBe(false);
        expect(isIneligible(seniorsOnly, -1)).toBe(false);
    });

    it("ignores group tags, which Epsilon cannot check", () => {
        expect(isIneligible(make({ eligibilities: [aid] }), 11)).toBe(false);
    });
});

describe("getStatus", () => {
    it("treats a deadline as open through its whole day", () => {
        const status = getStatus(make({ deadline: TODAY }), 11, TODAY);
        expect(status.label).toBe("Apply by November 2");
        expect(status.tone).toBe("urgent");
    });

    it("archives once the deadline has passed", () => {
        const status = getStatus(make({ deadline: "2026-11-01" }), 11, TODAY);
        expect(status.label).toBe("Archived");
        expect(status.struck).toBe(true);
    });

    it("shows rolling and far-off deadlines as neutral", () => {
        expect(getStatus(make(), 11, TODAY).label).toBe("Rolling Basis");
        expect(
            getStatus(make({ deadline: "2027-03-01" }), 11, TODAY).tone,
        ).toBe("neutral");
    });

    it("does not call an unknown deadline rolling", () => {
        expect(getStatus(make({ deadline_text: "TBD" }), 11, TODAY).label).toBe(
            "Deadline: TBD",
        );
        expect(getStatus(make({ deadline_text: null }), 11, TODAY).label).toBe(
            "Check deadline",
        );
    });

    it("puts ineligible ahead of archived", () => {
        const status = getStatus(
            make({ archived: true, eligibilities: [senior] }),
            11,
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

    it("hides ineligible opportunities only when asked", () => {
        const list = [
            make({ id: 1, eligibilities: [senior] }),
            make({ id: 2 }),
        ];
        expect(run(list).sort()).toEqual([1, 2]);
        expect(run(list, { showIneligible: false })).toEqual([2]);
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
