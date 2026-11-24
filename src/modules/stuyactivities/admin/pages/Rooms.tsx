import Divider from "../../../../components/ui/Divider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import AdminRoom from "../components/AdminRoom";

type ApiRoom = {
    id: number;
    name: string;
    floor?: number;
    approval_required: boolean;
    available_days: string;
    comments?: string;
    ais_days: string[];
};

type SortKey = "name" | "floor" | "approval" | "days";

const compareNames = (a: ApiRoom, b: ApiRoom) =>
    a.name.localeCompare(b.name, undefined, { numeric: true });

const countDays = (room: ApiRoom) =>
    room.available_days.split(", ").filter(Boolean).length;

const comparators: Record<SortKey, (a: ApiRoom, b: ApiRoom) => number> = {
    name: compareNames,
    floor: (a, b) =>
        (a.floor ?? Number.MAX_SAFE_INTEGER) -
            (b.floor ?? Number.MAX_SAFE_INTEGER) || compareNames(a, b),
    approval: (a, b) =>
        Number(a.approval_required) - Number(b.approval_required) ||
        compareNames(a, b),
    days: (a, b) => countDays(a) - countDays(b) || compareNames(a, b),
};

const Rooms = () => {
    const [rooms, setRooms] = useState<ApiRoom[]>([]);
    const [sort, setSort] = useState<{ key: SortKey; ascending: boolean }>({
        key: "floor",
        ascending: true,
    });
    const { enqueueSnackbar } = useSnackbar();

    const sortedRooms = useMemo(() => {
        const sorted = rooms.slice().sort(comparators[sort.key]);
        return sort.ascending ? sorted : sorted.reverse();
    }, [rooms, sort]);

    const toggleSort = (key: SortKey) =>
        setSort((prev) =>
            prev.key === key
                ? { key, ascending: !prev.ascending }
                : { key, ascending: true },
        );

    const sortHeader = (key: SortKey, label: string, width: string) => (
        <p
            role="button"
            tabIndex={0}
            aria-label={`Sort by ${label}`}
            className={`${width} touch-target cursor-pointer select-none rounded-sm sm:hover:text-typography-1 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-typography-1`}
            onClick={() => toggleSort(key)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleSort(key);
                }
            }}
        >
            {label}
            <i
                className={`bx ml-0.5 ${
                    sort.ascending ? "bx-up-arrow-alt" : "bx-down-arrow-alt"
                } ${sort.key === key ? "" : "opacity-0"}`}
            />
        </p>
    );

    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const fetchRooms = useCallback(
        async (pageToFetch = 0) => {
            setLoading(true);
            const pageSize = 1000;
            const from = pageToFetch * pageSize;
            const to = from + pageSize - 1;

            const { data: roomData, error: roomFetchError } = await supabase
                .from("rooms")
                .select("*")
                .range(from, to)
                .returns<ApiRoom[]>();

            if (roomFetchError || !roomData) {
                enqueueSnackbar("Failed to fetch rooms", { variant: "error" });
                setLoading(false);
                return;
            }

            if (pageToFetch === 0) {
                setRooms(roomData);
            } else {
                setRooms((prev) => [...prev, ...roomData]);
            }

            if (roomData.length < pageSize) {
                setHasMore(false);
            }

            setPage(pageToFetch);
            setLoading(false);
        },
        [enqueueSnackbar],
    );

    useEffect(() => {
        // the first page; loading already starts true
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRooms();
    }, [fetchRooms]);

    useEffect(() => {
        if (loading || !hasMore) return;

        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchRooms(page + 1);
            }
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [loading, hasMore, page, fetchRooms]);

    return (
        <div className={"w-full p-4 sm:px-8 sm:py-12 relative"}>
            <h1>Rooms</h1>
            <Divider />

            <div className="h-full w-10 bg-linear-to-r/srgb from-transparent to-bg absolute z-10 right-8 pointer-events-none"></div>

            <div className="w-full overflow-scroll">
                <div className={"min-w-fit flex mt-3 gap-3 flex-col w-full"}>
                    <div
                        className={
                            "gap-3 text-center z-10 bg-bg py-3 flex justify-between border-b border-divider w-full"
                        }
                    >
                        {sortHeader("name", "Room Name", "w-52")}
                        {sortHeader("floor", "Floor", "w-16")}
                        {sortHeader("approval", "Requires Approval", "w-36")}
                        {sortHeader("days", "Available Days", "w-96")}
                        <p className={"w-44"}>Actions</p>
                    </div>

                    <AdminRoom create onCreate={() => fetchRooms(0)} />

                    {sortedRooms.map((room) => (
                        <AdminRoom
                            key={room.id}
                            roomId={room.id}
                            name={room.name}
                            floor={room.floor as number}
                            availableDays={
                                room.available_days
                                    .split(", ")
                                    .filter(Boolean) as Room["available_days"]
                            }
                            comments={room.comments}
                            approvalRequired={room.approval_required}
                            aisDays={room.ais_days || []}
                            onDelete={() =>
                                setRooms(rooms.filter((r) => r.id !== room.id))
                            }
                        />
                    ))}
                    <div ref={loadMoreRef} style={{ height: "1px" }} />
                </div>
            </div>
        </div>
    );
};

export default Rooms;
