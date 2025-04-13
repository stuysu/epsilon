import { Box, Typography, TextField, MenuItem } from "@mui/material";
import { TimePicker, DatePicker } from "@mui/x-date-pickers";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSnackbar } from "notistack";
import AdminRoom from "../../comps/admin/AdminRoom";
import dayjs, { Dayjs } from "dayjs";
import AsyncButton from "../../comps/ui/AsyncButton";

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
        <Box>
            <Typography variant="h1" width="100%" align="center">
                Rooms
            </Typography>

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "auto",
                    padding: "10px",
                }}
            >
                <Typography variant="h2" width="100%" align="center">
                    Force Reservation
                </Typography>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <TextField
                        sx={{ width: "300px" }}
                        label="Search Organizations"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </Box>
                {filteredOrgs.length > 0 && (
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "10px",
                            flexWrap: "wrap",
                        }}
                    >
                        {filteredOrgs.map((org) => (
                            <AsyncButton
                                key={org.id}
                                onClick={async () => {
                                    setForceOrgId(org.id);
                                    setForceOrgName(org.name);
                                    setSearchInput(""); // Clear search input after selecting an org
                                    setFilteredOrgs([]); // Clear filtered orgs after selecting an org
                                }}
                                sx={{ margin: "5px" }}
                            >
                                {org.name}
                            </AsyncButton>
                        ))}
                    </Box>
                )}
                {forceOrgId && (
                    <Box
                        sx={{
                            maxWidth: "600px",
                            width: "100%",
                            marginTop: "10px",
                        }}
                    >
                        <Typography variant="h4" width="100%">
                            Force Reserve for {forceOrgName}:
                        </Typography>
                        <DatePicker
                            label="Meeting Day"
                            value={startTime}
                            onChange={(newStartTime) => {
                                if (!newStartTime) return;

                                setStartTime(newStartTime);

                                // also change day of end time    
                                if (!endTime) {
                                    setEndTime(newStartTime);
                                } else {
                                    setEndTime(
                                        endTime
                                            ?.year(newStartTime.year())
                                            .month(newStartTime.month())
                                            .date(newStartTime.date()),
                                    );
                                }
                            }}
                            sx={{
                                width: "100%",
                                marginTop: "10px",
                                marginBottom: "10px",
                            }}
                        />
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                flexWrap: "nowrap",
                                alignItems: "center",
                            }}
                        >
                            <TimePicker
                                label="Start"
                                value={startTime}
                                onChange={setStartTime}
                                sx={{ marginRight: "10px" }}
                            />

                            <TimePicker
                                label="End"
                                value={endTime}
                                onChange={setEndTime}
                            />
                            <TextField
                                value={!loading ? String(forceRoomId) : ""}
                                label="Room"
                                select
                                onChange={(event) =>
                                    setForceRoomId(
                                        Number(event.target.value) || undefined,
                                    )
                                }
                                sx={{
                                    width: "30%",
                                    height: "60px",
                                    marginLeft: "10px",
                                }}
                            >
                                {allRooms.map((room) => (
                                    <MenuItem
                                        key={room.id}
                                        value={String(room.id)}
                                    >
                                        {room.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <AsyncButton
                            onClick={forceReserve}
                            sx={{ width: "100%", marginTop: "10px" }}
                            variant="outlined"
                        >
                            Force Reservation
                        </AsyncButton>
                    </Box>
                )}
            </Box>

            <Typography
                variant="h2"
                width="100%"
                align="center"
                sx={{ marginTop: "20px" }}
            >
                Manage Rooms
            </Typography>
            <AdminRoom create onCreate={() => fetchRooms(0)} />
            <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
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
            </Box>
        </Box>
    );
};

export default Rooms;
