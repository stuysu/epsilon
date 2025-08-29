import { Box, Divider} from "@mui/material";
import { useEffect, useRef, useState } from "react";
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
};

type Organization = {
    id: number;
    name: string;
};

const getDefaultTime = () => {
    return dayjs().startOf("day").hour(15).minute(45);
};

const Rooms = () => {
    const [rooms, setRooms] = useState<ApiRoom[]>([]);
    const { enqueueSnackbar } = useSnackbar();

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
        const pageSize = 10;
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
        <div className={"w-full p-4 sm:p-12"}>
            <h1>
                Rooms
            </h1>

            <Divider />
            <div className={"flex mt-8 gap-3 flex-wrap"}
            >
                <div
                    className={
                        "border-zinc-800 border-solid border-2 rounded-lg"
                    }
                >
                    <p className={"p-4"}>Create New Room</p>
                    <AdminRoom create onCreate={() => fetchRooms(0)} />
                </div>

                {rooms.map((room) => (
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
                        onDelete={() =>
                            setRooms(rooms.filter((r) => r.id !== room.id))
                        }
                    />
                ))}
                <div ref={loadMoreRef} style={{ height: "1px" }} />
            </div>
        </div>
    );
};

export default Rooms;
