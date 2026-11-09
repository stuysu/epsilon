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
    it("lists past meetings newest first by default", () => {
        expect(run({})).toEqual([3, 2, 1, 4]);
    });

    it("puts the live or next meeting first, then the rest by date", () => {
        const at = (h: number) => new Date(NOW + h * 3600_000).toISOString();
        const mixed = [
            { id: 10, title: "past", start_time: at(-48), end_time: at(-47) },
            { id: 11, title: "far", start_time: at(72), end_time: at(73) },
            { id: 12, title: "live", start_time: at(-1), end_time: at(1) },
            { id: 13, title: "soon", start_time: at(2), end_time: at(3) },
            { id: 14, title: "older", start_time: at(-96), end_time: at(-95) },
        ];
        const ids = (f: Partial<MeetingFilters>) =>
            filterMeetings(
                mixed,
                { ...DEFAULT_MEETING_FILTERS, ...f },
                () => 0,
                NOW,
            ).map((m) => m.id);
        expect(ids({})).toEqual([12, 11, 13, 10, 14]);
        // with nothing live, the next meeting goes on top
        expect(
            filterMeetings(
                mixed.filter((m) => m.id !== 12),
                DEFAULT_MEETING_FILTERS,
                () => 0,
                NOW,
            ).map((m) => m.id),
        ).toEqual([13, 11, 10, 14]);
        // upcoming meetings aren't missing attendance; "past week" stops at today
        expect(ids({ status: "missing" })).toEqual([12, 10, 14]);
        expect(ids({ when: "week" })).toEqual([12, 13, 10, 14]);
        expect(ids({ status: "upcoming" })).toEqual([13, 11]);
        expect(ids({ status: "past" })).toEqual([12, 10, 14]);
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
