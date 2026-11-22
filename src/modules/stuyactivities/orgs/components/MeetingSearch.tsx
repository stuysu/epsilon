import SearchInput from "../../../../components/ui/input/SearchInput";
import SortSelect from "../../../../components/ui/input/SortSelect";
import FilterSelect from "../../../../components/ui/input/FilterSelect";

export type MeetingSort = "soonest" | "newest" | "oldest" | "name" | "nameDesc";
export type MeetingFilter =
    | "all"
    | "inPerson"
    | "virtual"
    | "public"
    | "private";

const sortOptions: { value: MeetingSort; label: string }[] = [
    { value: "soonest", label: "Soonest first" },
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "name", label: "Name (A–Z)" },
    { value: "nameDesc", label: "Name (Z–A)" },
];

const filterOptions: { value: MeetingFilter; label: string }[] = [
    { value: "all", label: "All meetings" },
    { value: "inPerson", label: "In person" },
    { value: "virtual", label: "Virtual" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
];

type SearchableMeeting = {
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    is_public?: boolean;
    rooms?: { name?: string } | null;
};

const isVirtual = (m: SearchableMeeting) =>
    !m.rooms?.name || /virtual/i.test(m.rooms.name);

export const arrangeMeetings = <T extends SearchableMeeting>(
    meetings: T[],
    query: string,
    sort: MeetingSort,
    filter: MeetingFilter,
) => {
    const q = query.trim().toLowerCase();
    const start = (m: T) => new Date(m.start_time || 0).getTime();
    return meetings
        .filter(
            (m) =>
                (!q ||
                    `${m.title || ""} ${m.description || ""}`
                        .toLowerCase()
                        .includes(q)) &&
                (filter === "all" ||
                    (filter === "inPerson" && !isVirtual(m)) ||
                    (filter === "virtual" && isVirtual(m)) ||
                    (filter === "public" && m.is_public) ||
                    (filter === "private" && !m.is_public)),
        )
        .sort((a, b) => {
            if (sort === "name" || sort === "nameDesc") {
                const byName = (a.title || "").localeCompare(b.title || "");
                return (
                    (sort === "name" ? byName : -byName) || start(a) - start(b)
                );
            }
            if (sort === "soonest") {
                /* live and upcoming meetings nearest first, then past ones most recent first */
                const now = Date.now();
                const ended = (m: T) =>
                    new Date(m.end_time || m.start_time || 0).getTime() < now;
                const aPast = ended(a);
                const bPast = ended(b);
                if (aPast !== bPast) return aPast ? 1 : -1;
                return (start(a) - start(b)) * (aPast ? -1 : 1);
            }
            return (start(a) - start(b)) * (sort === "newest" ? -1 : 1);
        });
};

const MeetingSearch = ({
    query,
    onQueryChange,
    sort,
    onSortChange,
    filter,
    onFilterChange,
}: {
    query: string;
    onQueryChange: (query: string) => void;
    sort: MeetingSort;
    onSortChange: (sort: MeetingSort) => void;
    filter: MeetingFilter;
    onFilterChange: (filter: MeetingFilter) => void;
}) => (
    <SearchInput
        placeholder={"Search meetings"}
        value={query}
        onChange={onQueryChange}
        inputClassName={"!pr-24"}
        trailing={
            <div className={"flex items-center gap-1"}>
                <FilterSelect
                    label="Filter meetings"
                    value={filter}
                    onChange={onFilterChange}
                    options={filterOptions}
                />
                <SortSelect
                    compact
                    label="Sort meetings"
                    value={sort}
                    onChange={onSortChange}
                    options={sortOptions}
                />
            </div>
        }
    />
);

export default MeetingSearch;
