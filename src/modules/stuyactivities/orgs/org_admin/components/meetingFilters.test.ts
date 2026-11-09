import { describe, expect, it } from "vitest";
import {
    DEFAULT_MEETING_FILTERS,
    MeetingFilters,
    filterMeetings,
} from "./meetingFilters";

// times are UTC; New York is UTC-5 in November
const meetings = [
    {
        id: 1,
        title: "Interest Meeting",
        start_time: "2026-11-02T20:00:00Z",
        rooms: { name: "Room 101" },
        present: 0,
    },
    {
        id: 2,
        title: "Officer Elections",
        start_time: "2026-11-05T20:00:00Z",
        rooms: { name: "Library" },
        present: 12,
    },
    {
        id: 3,
        title: "Interest Meeting #2",
        start_time: "2026-11-09T20:00:00Z",
        rooms: null,
        present: 4,
    },
    // 11:30 PM in New York on Oct 20, already Oct 21 in UTC
    {
        id: 4,
        title: "late night",
        start_time: "2026-10-21T03:30:00Z",
        rooms: null,
        present: 7,
    },
];
const NOW = Date.parse("2026-11-10T15:00:00Z");
const run = (f: Partial<MeetingFilters>) =>
    filterMeetings(
        meetings,
        { ...DEFAULT_MEETING_FILTERS, ...f },
        (m) => m.present,
        NOW,
    ).map((m) => m.id);

describe("filterMeetings", () => {
    it("lists newest first by default", () => {
        expect(run({})).toEqual([3, 2, 1, 4]);
    });

    it("searches title, room, and dates in several formats", () => {
        expect(run({ query: "interest" })).toEqual([3, 1]);
        expect(run({ query: "library" })).toEqual([2]);
        expect(run({ query: "nov 5" })).toEqual([2]);
        expect(run({ query: "November 9" })).toEqual([3]);
        expect(run({ query: "11/2" })).toEqual([1]);
        expect(run({ query: "monday interest" })).toEqual([3, 1]);
    });

    it("uses the New York date, not UTC", () => {
        expect(run({ query: "10/20" })).toEqual([4]);
        expect(
            run({ when: "custom", from: "2026-10-20", to: "2026-10-20" }),
        ).toEqual([4]);
    });

    it("filters after, before, and between dates", () => {
        expect(run({ when: "custom", from: "2026-11-05" })).toEqual([3, 2]);
        expect(run({ when: "custom", to: "2026-11-05" })).toEqual([2, 1, 4]);
        expect(
            run({ when: "custom", from: "2026-11-03", to: "2026-11-08" }),
        ).toEqual([2]);
        // reversed range still works
        expect(
            run({ when: "custom", from: "2026-11-08", to: "2026-11-03" }),
        ).toEqual([2]);
    });

    it("filters the past week and month", () => {
        expect(run({ when: "week" })).toEqual([3, 2]);
        expect(run({ when: "month" })).toEqual([3, 2, 1, 4]);
    });

    it("ignores custom dates unless Custom Dates is chosen", () => {
        expect(run({ from: "2026-11-09" })).toEqual([3, 2, 1, 4]);
    });

    it("filters by whether attendance was taken", () => {
        expect(run({ status: "missing" })).toEqual([1]);
        expect(run({ status: "taken" })).toEqual([3, 2, 4]);
    });

    it("sorts", () => {
        expect(run({ sort: "oldest" })).toEqual([4, 1, 2, 3]);
        expect(run({ sort: "title" })).toEqual([1, 3, 4, 2]);
        expect(run({ sort: "most" })).toEqual([2, 4, 3, 1]);
        expect(run({ sort: "least" })).toEqual([1, 3, 4, 2]);
    });
});
