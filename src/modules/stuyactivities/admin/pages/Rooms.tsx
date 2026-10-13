import Divider from "../../../../components/ui/Divider";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import AdminRoom from "../components/AdminRoom";
import dayjs, { Dayjs } from "dayjs";

type ApiRoom = {
    id: number;
    name: string;
    floor?: number;
    approval_required: boolean;
    available_days: string;
    comments?: string;
    ais_days: string[];
};

type Organization = {
    id: number;
    name: string;
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

const getDefaultTime = () => {
    return dayjs().startOf("day").hour(15).minute(45);
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
            className={`${width} cursor-pointer select-none sm:hover:text-typography-1`}
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

    /* force reservation data */
    const [forceOrgId, setForceOrgId] = useState<number | undefined>();
    const [forceOrgName, setForceOrgName] = useState<string | undefined>();
    const [forceRoomId, setForceRoomId] = useState<number | undefined>();
    const [allRooms, setAllRooms] = useState<ApiRoom[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    /* organization search data */
    const [searchInput, setSearchInput] = useState("");
    const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]);

    /* date inputs */
    const [startTime, setStartTime] = useState<Dayjs | null>(getDefaultTime());
    const [endTime, setEndTime] = useState<Dayjs | null>(getDefaultTime());

    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const fetchRooms = async (pageToFetch = 0) => {
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

        if (pageToFetch === 0 && roomData.length) {
            setForceRoomId(roomData[0].id);
        }

        setAllRooms((prev) =>
            pageToFetch === 0 ? roomData : [...prev, ...roomData],
        );

        setPage(pageToFetch);
        setLoading(false);
    };

    useEffect(() => {
        fetchRooms();
    }, [enqueueSnackbar]);

    useEffect(() => {
        const fetchAllOrgs = async () => {
            const { data, error } = await supabase
                .from("organizations")
                .select("*");
            if (error || !data) {
                enqueueSnackbar(
                    "Failed to load organizations. Contact support.",
                    { variant: "error" },
                );
                return;
            }
            setAllOrgs(data);
        };

        fetchAllOrgs();
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (searchInput) {
            setFilteredOrgs(
                allOrgs.filter((org) =>
                    org.name.toLowerCase().includes(searchInput.toLowerCase()),
                ),
            );
        } else {
            setFilteredOrgs([]);
        }
    }, [searchInput, allOrgs]);

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
    }, [loading, hasMore, page]);

    const forceReserve = async () => {
        const { error: reserveError } = await supabase.functions.invoke(
            "force-reserve",
            {
                body: {
                    room_id: forceRoomId,
                    organization_id: forceOrgId,
                    start_time: startTime?.toISOString(),
                    end_time: endTime?.toISOString(),
                },
            },
        );

        if (reserveError) {
            enqueueSnackbar("Failed to force reserve room", {
                variant: "error",
            });
            return;
        }

        enqueueSnackbar("Room reserved successfully", { variant: "success" });

        /* reset state */
        setForceOrgId(undefined);
        setForceOrgName(undefined);
        setStartTime(getDefaultTime());
        setEndTime(getDefaultTime());
    };

    return (
        <div className={"w-full p-4 sm:p-12 relative"}>
            <h1>Rooms</h1>
            <Divider />

            <div className="h-full w-10 bg-gradient-to-r from-transparent to-bg absolute z-10 right-12 pointer-events-none"></div>

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
                        <p className={"w-24 relative right-3"}>Actions</p>
                    </div>

                    <AdminRoom create onCreate={() => fetchRooms(0)} />

                    {sortedRooms.map((room) => (
                        <AdminRoom
                            key={room.id}
                            roomId={room.id}
                            name={room.name}
                            floor={room.floor as number}
                            availableDays={
                                room.available_days.split(
                                    ", ",
                                ) as Room["available_days"]
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
