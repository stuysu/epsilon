import { ChangeEvent, useContext, useEffect, useState } from "react";
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    Switch,
    TextField,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { supabase } from "../../../../../lib/supabaseClient";
import OrgContext from "../../../../../contexts/OrgContext";
import dayjs, { Dayjs } from "dayjs";
import { useSnackbar } from "notistack";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";

const getDefaultStartTime = () => {
    return dayjs().startOf("day").hour(15).minute(35);
};

const getDefaultEndTime = () => {
    return dayjs().startOf("day").hour(17).minute(0);
};

/* TODO: block off rooms on days they are unavailable */
const AdminUpsertMeeting = ({
    id,
    title,
    description,
    room_id,
    start,
    end,
    isPublic,
    open,
    advisor,
    onClose,
    onSave,
}: {
    id?: number;
    title?: string;
    description?: string;
    room_id?: number;
    start?: string;
    end?: string;
    isPublic?: boolean;
    open: boolean;
    advisor?: string;
    onClose: () => void;
    onSave: (saveState: Partial<Meeting>, isInsert: boolean) => void;
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext(OrgContext);

    const [meetingTitle, setMeetingTitle] = useState(title || "");
    const [meetingDesc, setMeetingDesc] = useState(description || "");
    const [roomId, setRoomId] = useState(room_id);
    const [meetingAdvisor, setMeetingAdvisor] = useState(advisor || "");

    /* hard coded constants to be changed later */
    const advisorNeededRooms = ["503", "505", "507"];
    const advisorNeededLowestFloor = 7;
    const [advisorNeeded, setAdvisorNeeded] = useState<boolean>(false);

    /* date inputs */
    const [startTime, setStartTime] = useState<Dayjs | null>(
        start ? dayjs(start) : getDefaultStartTime(),
    );
    const [endTime, setEndTime] = useState<Dayjs | null>(
        end ? dayjs(end) : getDefaultEndTime(),
    );

    const [isPub, setIsPub] = useState(
        isPublic === undefined ? true : isPublic,
    );

    const [notifyFaculty, setNotifyFaculty] = useState(false);

    const [allRooms, setAllRooms] = useState<Room[]>([]);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

    // fixes select menu item bug where it is trying to map over undefined rooms
    const [loading, setLoading] = useState(true);

    /* Filtering out rooms that are taken for that day */
    useEffect(() => {
        const fetchRooms = async () => {
            let { data, error } = await supabase.from("rooms").select();

            if (error || !data) {
                enqueueSnackbar(
                    "Error fetching rooms. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }

            setAllRooms((prev) => {
                setLoading(false);
                return data as Room[];
            });
        };

        fetchRooms();
    }, []);

    useEffect(() => {
        const filterRooms = async () => {
            if (!startTime || !endTime) return; // can't filter without these bounds

            /*
      get ids of rooms that are booked.
      there is a special case when we fetch an existing booked room from save
      */
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

            if (error) {
                enqueueSnackbar(
                    "Error fetching booked rooms. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }

            const bookedRooms: RoomMeta[] = Array.isArray(bookedRoomsRaw)
                ? bookedRoomsRaw
                : [];

            const filteredBookedRooms = id
                ? bookedRooms.filter((meta) => meta.meeting_id !== id)
                : bookedRooms;

            /*
            room is available if:
            - it does not exist in booked rooms
            - the day of the start time (mon-fri) is included within the room's available days
            */
            const days: Room["available_days"] = [
                "SUNDAY",
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY",
            ];

            let availRooms = allRooms.filter(
                (room) =>
                    !~filteredBookedRooms.findIndex(
                        (meta) => meta.room_id === room.id,
                    ) && room.available_days.includes(days[startTime!.day()]),
            );

            // check if the currently selected room id is no longer valid
            /* NOTE: if a meeting is invalid because of some update on the backend,
            it'll still show the room but once u click into it, it'll only show virtual.
            */
            if (
                !loading &&
                roomId &&
                !~availRooms.findIndex((meta) => meta.id === roomId)
            ) {
                setRoomId(undefined);
            }

            setAvailableRooms(availRooms);
        };

        filterRooms();
    }, [loading, id, roomId, startTime, endTime, enqueueSnackbar]);

    useEffect(() => {
        const checkAdvisorNeeded = async () => {
            if(!roomId) return;
    
            const { data, error } = await supabase
                .from("rooms")
                .select("id, name, floor")
                .eq("id", roomId)
                .single();
    
            if (error || !data) {
                return enqueueSnackbar("Error checking room floor.", { variant: "error" });
            }
        
            const roomName = data.name?.toString();
            const roomFloor = data.floor;
    
            const needsAdvisorPrompt =
                roomFloor >= advisorNeededLowestFloor || advisorNeededRooms.includes(roomName);
    
            needsAdvisorPrompt ? setAdvisorNeeded(true) : setAdvisorNeeded(false);
        };
    
        checkAdvisorNeeded();
    }, [roomId, enqueueSnackbar])

    const handleSave = async () => {
        let supabaseReturn;

        let isInsert = false;

        if (!meetingTitle || !meetingTitle.length) {
            console.log(meetingTitle);
            enqueueSnackbar("Missing meeting title.", { variant: "error" });
            return;
        }

        if (!startTime) {
            enqueueSnackbar("Missing start time for meeting.", {
                variant: "error",
            });
            return;
        }

        if (!endTime) {
            enqueueSnackbar("Missing end time for meeting.", {
                variant: "error",
            });
            return;
        }

        if (endTime.isBefore(startTime)) {
            enqueueSnackbar(
                "Meeting start time cannot be after meeting end time.",
                { variant: "error" },
            );
            return;
        }

        if (endTime.diff(startTime, "minute") < 30) {
            enqueueSnackbar("Meeting duration must be at least 30 minutes.", {
                variant: "error",
            });
            return;
        }

        const currentTime = dayjs();
        if (startTime.isBefore(currentTime)) {
            enqueueSnackbar("Meeting cannot be scheduled in the past.", {
                variant: "error",
            });
            return;
        }

        if(advisorNeeded && !meetingAdvisor.trim()) {
            enqueueSnackbar("Meeting in this room requires a faculty advisor.", {
                variant: "error",
            });
            return;
        }

        if (id) {
            // update
            supabaseReturn = await supabase.functions.invoke("edit-meeting", {
                body: {
                    organization_id: organization.id,
                    id,
                    title: meetingTitle,
                    description: meetingDesc,
                    room_id: roomId || null,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    is_public: isPub,
                    advisor: meetingAdvisor.trim()
                },
            });
        } else {
            // create
            isInsert = true;
            supabaseReturn = await supabase.functions.invoke("create-meeting", {
                body: {
                    organization_id: organization.id,
                    title: meetingTitle,
                    description: meetingDesc,
                    room_id: roomId || null,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    is_public: isPub,
                    notify_faculty: notifyFaculty,
                    advisor: meetingAdvisor.trim()
                },
            });
        }
        if (supabaseReturn.error) {
            const error = await supabaseReturn.error?.context.text();
            let message = "Contact it@stuysu.org for support.";
            if (error) {
                message = error;
            }
            enqueueSnackbar("Error creating meeting. " + message, {
                variant: "error",
            });
            return;
        }

        if (isInsert) {
            enqueueSnackbar("Meeting created!", { variant: "success" });
        } else {
            enqueueSnackbar("Meeting updated!", { variant: "success" });
        }

        onSave(supabaseReturn.data as Partial<Meeting>, isInsert);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{id ? "Update" : "Create"} Meeting</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexWrap: "nowrap",
                        alignItems: "center",
                        height: "80px",
                    }}
                >
                    <TextField
                        value={meetingTitle}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setMeetingTitle(event.target.value)
                        }
                        label="Title"
                        sx={{ width: "100%", height: "60px" }}
                    />
                    <TextField
                        value={!loading ? String(roomId) : ""}
                        label="Room"
                        select
                        onChange={(event) =>
                            setRoomId(Number(event.target.value) || undefined)
                        }
                        sx={{
                            width: "30%",
                            height: "60px",
                            marginLeft: "10px",
                        }}
                    >
                        <MenuItem value={"undefined"}>Virtual</MenuItem>
                        {availableRooms.map((room) => (
                            <MenuItem key={room.id} value={String(room.id)}>
                                {room.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <TextField
                    value={meetingAdvisor}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setMeetingAdvisor(event.target.value)
                    }
                    label="Faculty Advisor Present"
                    fullWidth
                />

                <TextField
                    value={meetingDesc}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setMeetingDesc(event.target.value)
                    }
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    sx={{ mt: 2 }}
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
                </Box>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isPub}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                setIsPub(event.target.checked)
                            }
                        />
                    }
                    sx={{ marginTop: "10px" }}
                    label="is public?"
                />
                {!id && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notifyFaculty}
                                onChange={(
                                    event: ChangeEvent<HTMLInputElement>,
                                ) => setNotifyFaculty(event.target.checked)}
                            />
                        }
                        sx={{ marginTop: "10px" }}
                        label="notify faculty?"
                    />
                )}
            </DialogContent>
            <DialogActions>
                <AsyncButton variant="contained" onClick={onClose}>
                    Cancel
                </AsyncButton>
                <AsyncButton variant="contained" onClick={handleSave}>
                    Save
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
};

export default AdminUpsertMeeting;
