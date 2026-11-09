import { toNewYork } from "../../../../../utils/NewYorkTime";

export type MeetingWhen = "any" | "week" | "month" | "custom";
export type MeetingStatus = "all" | "taken" | "missing";
export type MeetingSort = "newest" | "oldest" | "title" | "most" | "least";

export type MeetingFilters = {
    query: string;
    when: MeetingWhen;
    // YYYY-MM-DD in New York time; either end may be empty
    from: string;
    to: string;
    status: MeetingStatus;
    sort: MeetingSort;
};

export const DEFAULT_MEETING_FILTERS: MeetingFilters = {
    query: "",
    when: "any",
    from: "",
    to: "",
    status: "all",
    sort: "newest",
};

export const meetingSortOptions: { value: MeetingSort; label: string }[] = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "title", label: "Title (A-Z)" },
    { value: "most", label: "Most present" },
    { value: "least", label: "Least present" },
];

export const meetingStatusOptions: { value: MeetingStatus; label: string }[] = [
    { value: "all", label: "All meetings" },
    { value: "taken", label: "Attendance taken" },
    { value: "missing", label: "Attendance not taken" },
];

export const meetingWhenOptions: { value: MeetingWhen; label: string }[] = [
    { value: "any", label: "Any Time" },
    { value: "week", label: "Past Week" },
    { value: "month", label: "Past Month" },
    { value: "custom", label: "Custom Dates" },
];

type FilterableMeeting = {
    title: string;
    start_time: string;
    rooms?: { name?: string } | null;
};

/* every way someone might type a meeting's date: "Nov 9", "November 9", "11/9", "11/9/2026", "Monday" */
const searchText = (m: FilterableMeeting) => {
    const t = toNewYork(m.start_time);
    return [
        m.title,
        m.rooms?.name,
        t.format("MMMM D YYYY"),
        t.format("MMM D"),
        t.format("M/D/YYYY"),
        t.format("MM/DD/YYYY"),
        t.format("dddd"),
    ]
        .join(" ")
        .toLowerCase();
};

const dateRange = (
    f: MeetingFilters,
    now: number,
): [string | null, string | null] => {
    const today = toNewYork(new Date(now));
    if (f.when === "week")
        return [today.subtract(6, "day").format("YYYY-MM-DD"), null];
    if (f.when === "month")
        return [today.subtract(1, "month").format("YYYY-MM-DD"), null];
    if (f.when === "custom") {
        // a backwards range still means the days between them
        const [a, b] = [f.from || null, f.to || null];
        return a && b && a > b ? [b, a] : [a, b];
    }
    return [null, null];
};

export const filterMeetings = <M extends FilterableMeeting>(
    meetings: M[],
    f: MeetingFilters,
    present: (m: M) => number,
    now = Date.now(),
): M[] => {
    const words = f.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const [from, to] = dateRange(f, now);
    const shown = meetings.filter((m) => {
        const day = toNewYork(m.start_time).format("YYYY-MM-DD");
        if (from && day < from) return false;
        if (to && day > to) return false;
        if (f.status === "taken" && present(m) === 0) return false;
        if (f.status === "missing" && present(m) > 0) return false;
        if (!words.length) return true;
        const text = searchText(m);
        return words.every((w) => text.includes(w));
    });
    const time = (m: M) => new Date(m.start_time).getTime();
    const byNewest = (a: M, b: M) => time(b) - time(a);
    const compare: Record<MeetingSort, (a: M, b: M) => number> = {
        newest: byNewest,
        oldest: (a, b) => time(a) - time(b),
        title: (a, b) =>
            a.title.localeCompare(b.title, undefined, {
                sensitivity: "base",
                numeric: true,
            }) || byNewest(a, b),
        most: (a, b) => present(b) - present(a) || byNewest(a, b),
        least: (a, b) => present(a) - present(b) || byNewest(a, b),
    };
    return [...shown].sort(compare[f.sort]);
};

export const filtersActive = (f: MeetingFilters) =>
    !!f.query.trim() || f.when !== "any" || f.status !== "all";
