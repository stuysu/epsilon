import {
    Box,
    Divider,
    FormControlLabel,
    MenuItem,
    Switch,
    TextField,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import dayjs, { Dayjs } from "dayjs";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import SearchInput from "../../../../components/ui/input/SearchInput";
import MeetingAttendanceCard from "../../orgs/org_admin/components/MeetingAttendanceCard";

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

const Reserve = () => {
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

    const [reservedMeetings, setReservedMeetings] = useState<Meeting[]>([]);

    const [excludeBooked, setexcludeBooked] = useState<boolean>(false);

    const fetchOrgMeetings = async () => {
        if (!forceOrgId || forceOrgId === -1) return;

        const { data: meetingsData, error: meetingFetchError } = await supabase
            .from("meetings")
            .select(`*, rooms(name)`)
            .eq("organization_id", forceOrgId)
            .eq("title", "Reserved Meeting");

        if (meetingFetchError) {
            enqueueSnackbar("Failed to fetch meetings.", {
                variant: "error",
            });
            return;
        }

        const sortedMeetings = (meetingsData as Meeting[]).sort(
            (a, b) =>
                new Date(b.start_time).getTime() -
                new Date(a.start_time).getTime(),
        );
        setReservedMeetings(sortedMeetings);
    };

    useEffect(() => {
        fetchOrgMeetings();
    }, [forceOrgId]);
    useEffect(() => {
        // No other way to use async here
        (async () => {
            let { data: roomData, error: roomFetchError } = await supabase
                .from("rooms")
                .select("*")
                .order("name", { ascending: true });
            if (roomFetchError || !roomData) {
                enqueueSnackbar("Failed to fetch rooms", {
                    variant: "error",
                });
                setLoading(false);
                return;
            }
            if (excludeBooked) {
                // Fetch booked rooms overlapping with current times
                // Date should in theory be filled but just in case:
                if (!startTime || !endTime) return;
                type RoomMeta = {
                    room_id: number;
                    meeting_id: number;
                };
                const { data: bookedRoomsRaw, error } = await supabase
                    .rpc("get_booked_rooms", {
                        meeting_start: startTime.toISOString(),
                        meeting_end: endTime.toISOString(),
                    })
                    .returns<RoomMeta[]>();
                const bookedRooms: RoomMeta[] = Array.isArray(bookedRoomsRaw)
                    ? bookedRoomsRaw
                    : [];
                roomData = roomData.filter((meta) =>
                    bookedRooms.every((room) => room.room_id !== meta.id),
                );
            }
            setAllRooms(roomData);
        })();
    }, [excludeBooked]);
    const fetchRooms = async () => {
        setLoading(true);

        const { data: roomData, error: roomFetchError } = await supabase
            .from("rooms")
            .select("*")
            .order("name", { ascending: true });

        if (roomFetchError || !roomData) {
            enqueueSnackbar("Failed to fetch rooms", { variant: "error" });
            setLoading(false);
            return;
        }

        setAllRooms(roomData);

        if (roomData.length) {
            setForceRoomId(roomData[0].id);
        }

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

        await fetchOrgMeetings();

        /* reset state */
        setStartTime(getDefaultTime());
        setEndTime(getDefaultTime());
    };

    return (
        <div className={"w-full p-4 sm:p-12"}>
            <h1>Reserve</h1>
            <Divider />
            <div className="my-4">
                <h2>Force Reservation</h2>
                <p className={"mb-3"}>
                    Reserve a room for an organization manually.
                </p>
                <SearchInput
                    placeholder="Search Activities..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e)}
                />
                {searchInput.length < 3 ? (
                    <p>Keep typing to find an Activity.</p>
                ) : filteredOrgs.length > 10 ? (
                    <p>Too many activities, try a more specific query.</p>
                ) : filteredOrgs.length > 0 ? (
                    <div>
                        {filteredOrgs.map((org) => (
                            <div>
                                <a
                                    className={"important cursor-pointer"}
                                    key={org.id}
                                    onClick={() => {
                                        setForceOrgId(org.id);
                                        setForceOrgName(org.name);
                                        setSearchInput(""); // Clear search input after selecting an org
                                        setFilteredOrgs([]); // Clear filtered orgs after selecting an org
                                    }}
                                >
                                    {org.name}
                                </a>
                                <Divider />
                            </div>
                        ))}
                    </div>
                ) : null}
                {forceOrgId && (
                    <div className="my-4">
                        <Divider />
                        <h4 className={"py-4"}>
                            Force-reserving a meeting for {forceOrgName}
                        </h4>
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
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={excludeBooked}
                                        onChange={(
                                            event: ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            setexcludeBooked(
                                                event.target.checked,
                                            )
                                        }
                                    ></Switch>
                                }
                                sx={{ marginLeft: "10px" }}
                                label="hide booked rooms?"
                                disabled={!endTime || !startTime}
                            ></FormControlLabel>
                        </Box>
                        <AsyncButton
                            onClick={forceReserve}
                            sx={{ width: "100%", marginTop: "10px" }}
                            variant="outlined"
                        >
                            Force Reservation
                        </AsyncButton>
                    </div>
                )}

                {forceOrgId && (
                    <Box sx={{ width: "100%" }}>
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                flexWrap: "wrap",
                            }}
                        >
                            {reservedMeetings.map((meeting) => (
                                <MeetingAttendanceCard
                                    key={meeting.id}
                                    title={meeting.title}
                                    id={meeting.id}
                                    room={meeting.rooms?.name}
                                    startTime={meeting.start_time}
                                    clickable={false}
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </div>
        </div>
    );
};

export default Reserve;
