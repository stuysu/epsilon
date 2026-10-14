import {
    Box,
    Divider,
    FormControlLabel,
    Switch,
    TextField,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import { Dayjs } from "dayjs";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import SearchInput from "../../../../components/ui/input/SearchInput";
import MeetingAttendanceCard from "../../orgs/org_admin/components/MeetingAttendanceCard";
import RoomChecklist from "../components/RoomChecklist";
import { isoToWallClock, wallClockToISO } from "../../../../utils/NewYorkTime";

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
    return isoToWallClock().startOf("day").hour(15).minute(45);
};

const Reserve = () => {
    const { enqueueSnackbar } = useSnackbar();

    /* force reservation data */
    const [forceOrgId, setForceOrgId] = useState<number | undefined>();
    const [forceOrgName, setForceOrgName] = useState<string | undefined>();
    const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
    const [confirming, setConfirming] = useState<{
        meetings: number;
        heldRoomIds: number[];
    } | null>(null);
    const [failedRooms, setFailedRooms] = useState<
        { name: string; message: string }[]
    >([]);
    const [forceTitle, setForceTitle] = useState("");
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
            .eq("description", "This meeting was reserved by an admin.");

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
                        meeting_start: wallClockToISO(startTime),
                        meeting_end: wallClockToISO(endTime),
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

    const roomsToReserve = allRooms.filter((room) =>
        selectedRoomIds.includes(room.id),
    );

    const startReservation = async () => {
        setFailedRooms([]);

        if (!roomsToReserve.length) {
            enqueueSnackbar("Select at least one room.", { variant: "error" });
            return;
        }

        if (!startTime || !endTime) {
            return forceReserve();
        }

        const { data: bookedRoomsRaw } = await supabase.rpc(
            "get_booked_rooms",
            {
                meeting_start: wallClockToISO(startTime),
                meeting_end: wallClockToISO(endTime),
            },
        );
        const bookedRooms: { room_id: number; meeting_id: number }[] =
            Array.isArray(bookedRoomsRaw) ? bookedRoomsRaw : [];

        const selectedBooked = bookedRooms.filter((meta) =>
            selectedRoomIds.includes(meta.room_id),
        );

        const { data: heldMeetings } = selectedBooked.length
            ? await supabase
                  .from("meetings")
                  .select("id, room_id, organizations!inner(state)")
                  .in(
                      "id",
                      selectedBooked.map((meta) => meta.meeting_id),
                  )
                  .eq("organizations.state", "ADMIN")
            : { data: [] };

        const heldRoomIds = Array.from(
            new Set((heldMeetings || []).map((meeting) => meeting.room_id)),
        ) as number[];

        const heldMeetingIds = (heldMeetings || []).map(
            (meeting) => meeting.id,
        );

        const conflicts = selectedBooked.filter(
            (meta) => !heldMeetingIds.includes(meta.meeting_id),
        ).length;

        if (heldRoomIds.length === roomsToReserve.length && !conflicts) {
            return forceReserve();
        }

        /* a single room only needs confirming when it would cancel something */
        if (roomsToReserve.length === 1 && !conflicts) {
            return forceReserve();
        }

        setConfirming({ meetings: conflicts, heldRoomIds });
    };

    const forceReserve = async () => {
        setConfirming(null);
        setFailedRooms([]);

        const failed: { id: number; name: string; message: string }[] = [];

        for (const room of roomsToReserve) {
            const { error: reserveError } = await supabase.functions.invoke(
                "force-reserve",
                {
                    body: {
                        room_id: room.id,
                        organization_id: forceOrgId,
                        start_time: startTime && wallClockToISO(startTime),
                        end_time: endTime && wallClockToISO(endTime),
                        title: forceTitle.trim() || undefined,
                    },
                },
            );

            if (reserveError) {
                const message = await reserveError.context?.text();
                failed.push({
                    id: room.id,
                    name: room.name,
                    message: message || "Failed to force reserve room",
                });
            }
        }

        const reserved = roomsToReserve.length - failed.length;

        if (reserved) {
            enqueueSnackbar(
                reserved === 1
                    ? "Room reserved successfully"
                    : `${reserved} rooms reserved successfully`,
                { variant: "success" },
            );
        }

        if (failed.length) {
            enqueueSnackbar(
                failed.length === 1
                    ? "Failed to reserve 1 room"
                    : `Failed to reserve ${failed.length} rooms`,
                { variant: "error" },
            );
            setFailedRooms(failed);
            setSelectedRoomIds(failed.map((room) => room.id));
        }

        await fetchOrgMeetings();

        if (!failed.length) {
            /* reset state */
            setForceTitle("");
            setSelectedRoomIds([]);
            setStartTime(getDefaultTime());
            setEndTime(getDefaultTime());
        }
    };

    return (
        <div className={"w-full p-4 sm:p-12"}>
            <h1>Reserve</h1>
            <Divider />
            <div className="my-4">
                <h2>Force Reservation</h2>
                <p className={"mb-3"}>
                    Reserve one or more rooms for an organization manually.
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
                        <TextField
                            label="Title"
                            placeholder="Reserved Meeting"
                            helperText="Optional. Leave blank to use the default title."
                            value={forceTitle}
                            onChange={(event) =>
                                setForceTitle(event.target.value)
                            }
                            inputProps={{ maxLength: 500 }}
                            sx={{
                                width: "100%",
                                marginTop: "10px",
                                marginBottom: "10px",
                            }}
                        />
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
                        {loading ? (
                            <p className="my-4">Loading rooms...</p>
                        ) : (
                            <RoomChecklist
                                rooms={allRooms}
                                selected={selectedRoomIds}
                                onChange={setSelectedRoomIds}
                            />
                        )}

                        {confirming ? (
                            <div className="bg-layer-1 rounded-xl shadow-control p-4 mt-2">
                                <p className="important">
                                    Reserve{" "}
                                    {roomsToReserve.length === 1
                                        ? roomsToReserve[0].name
                                        : `${roomsToReserve.length} rooms`}{" "}
                                    for {forceOrgName}?
                                </p>
                                <p className="mt-1">
                                    {confirming.meetings
                                        ? `${confirming.meetings} meeting${
                                              confirming.meetings === 1
                                                  ? ""
                                                  : "s"
                                          } in ${
                                              roomsToReserve.length === 1
                                                  ? "this room"
                                                  : "these rooms"
                                          } will be cancelled and their Activities will be emailed.`
                                        : "No existing meetings in these rooms will be cancelled."}
                                </p>
                                {confirming.heldRoomIds.length > 0 && (
                                    <p className="mt-1">
                                        {roomsToReserve
                                            .filter((room) =>
                                                confirming.heldRoomIds.includes(
                                                    room.id,
                                                ),
                                            )
                                            .map((room) => room.name)
                                            .join(", ")}{" "}
                                        {confirming.heldRoomIds.length === 1
                                            ? "is"
                                            : "are"}{" "}
                                        held by an admin club and will not be
                                        reserved.
                                    </p>
                                )}
                                <div className="flex gap-2 mt-3">
                                    <AsyncButton
                                        onClick={forceReserve}
                                        variant="outlined"
                                    >
                                        Confirm Reservation
                                    </AsyncButton>
                                    <AsyncButton
                                        onClick={() => setConfirming(null)}
                                        variant="outlined"
                                    >
                                        Cancel
                                    </AsyncButton>
                                </div>
                            </div>
                        ) : (
                            <AsyncButton
                                onClick={startReservation}
                                sx={{ width: "100%", marginTop: "10px" }}
                                variant="outlined"
                            >
                                {roomsToReserve.length > 1
                                    ? `Force Reservation (${roomsToReserve.length} rooms)`
                                    : "Force Reservation"}
                            </AsyncButton>
                        )}

                        {failedRooms.length > 0 && (
                            <div className="bg-layer-1 rounded-xl shadow-control p-4 mt-3">
                                <p className="important">
                                    These rooms could not be reserved:
                                </p>
                                {failedRooms.map((room) => (
                                    <p key={room.name} className="mt-1">
                                        {room.name}: {room.message}
                                    </p>
                                ))}
                            </div>
                        )}
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
