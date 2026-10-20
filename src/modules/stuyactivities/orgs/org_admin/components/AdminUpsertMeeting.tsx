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
import UserContext from "../../../../../contexts/UserContext";
import dayjs, { Dayjs } from "dayjs";
import { useSnackbar } from "notistack";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import FacultySelect, {
    FacultyOption,
} from "../../../../../components/ui/input/FacultySelect";
import { sortRooms } from "../../../../../utils/DataFormatters";
import {
    isoToWallClock,
    wallClockToISO,
} from "../../../../../utils/NewYorkTime";

const getDefaultStartTime = () => {
    return isoToWallClock().startOf("day").hour(15).minute(35);
};

const getDefaultEndTime = () => {
    return isoToWallClock().startOf("day").hour(17).minute(0);
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
    const user = useContext(UserContext);

    const [meetingTitle, setMeetingTitle] = useState(title || "");
    const [meetingDesc, setMeetingDesc] = useState(description || "");
    const [roomId, setRoomId] = useState(room_id);
    const [meetingAdvisor, setMeetingAdvisor] = useState(advisor || "");

    const [advisorNeeded, setAdvisorNeeded] = useState<boolean>(false);

    /* date inputs */
    const [startTime, setStartTime] = useState<Dayjs | null>(
        start ? isoToWallClock(start) : getDefaultStartTime(),
    );
    const [endTime, setEndTime] = useState<Dayjs | null>(
        end ? isoToWallClock(end) : getDefaultEndTime(),
    );

    const [isPub, setIsPub] = useState(
        isPublic === undefined ? true : isPublic,
    );

    const [notifyFaculty, setNotifyFaculty] = useState(false);
    const [silent, setSilent] = useState(false);
    const advisorRoomBooking = advisorNeeded && (!id || roomId !== room_id);

    const [faculty, setFaculty] = useState<
        (FacultyOption & { firstName: string; lastName: string })[]
    >([]);
    const [facultyLoaded, setFacultyLoaded] = useState(false);
    const [facultyFailed, setFacultyFailed] = useState(false);
    const [advisorTouched, setAdvisorTouched] = useState(false);
    const unregisteredAdvisor =
        facultyLoaded &&
        meetingAdvisor !== "" &&
        !faculty.some((member) => member.name === meetingAdvisor);
    const advisorInvalid =
        advisorNeeded &&
        (meetingAdvisor.trim() === "" || !facultyLoaded || unregisteredAdvisor);
    const clubAdvisorIds = new Set(
        (organization.memberships || [])
            .filter((member) => member.role === "ADVISOR" && member.active)
            .map((member) => member.users?.id),
    );
    const charterAdvisorEmail = (organization.faculty_email || "")
        .trim()
        .toLowerCase();
    const isClubAdvisor = (member: { id: number; email: string }) =>
        clubAdvisorIds.has(member.id) ||
        (charterAdvisorEmail !== "" &&
            member.email?.trim().toLowerCase() === charterAdvisorEmail);
    const sortedFaculty = [...faculty].sort(
        (a, b) =>
            a.lastName.localeCompare(b.lastName, undefined, {
                sensitivity: "base",
            }) ||
            a.firstName.localeCompare(b.firstName, undefined, {
                sensitivity: "base",
            }),
    );
    const groupedFaculty: FacultyOption[] = sortedFaculty.some((member) =>
        isClubAdvisor(member),
    )
        ? [
              ...sortedFaculty
                  .filter((member) => isClubAdvisor(member))
                  .map((member) => ({
                      ...member,
                      group: "Advisors of this club",
                  })),
              ...sortedFaculty
                  .filter((member) => !isClubAdvisor(member))
                  .map((member) => ({ ...member, group: "All faculty" })),
          ]
        : sortedFaculty;
    const advisorOptions: FacultyOption[] = unregisteredAdvisor
        ? [{ id: -1, name: meetingAdvisor, email: "" }, ...groupedFaculty]
        : groupedFaculty;
    const [allRooms, setAllRooms] = useState<Room[]>([]);
    const [roomGrants, setRoomGrants] = useState<
        { room_id: number; organization_id: number }[]
    >([]);
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

            const { data: grantsData, error: grantsError } = await supabase
                .from("room_grants")
                .select("room_id, organization_id");

            if (grantsError) {
                enqueueSnackbar(
                    "Error fetching rooms. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }

            setRoomGrants(grantsData || []);
            setAllRooms((prev) => {
                setLoading(false);
                return (data as Room[]).sort(sortRooms);
            });
        };

        fetchRooms();
    }, []);

    useEffect(() => {
        const fetchFaculty = async () => {
            const { data, error } = await supabase
                .from("users")
                .select("id, first_name, last_name, email")
                .eq("is_faculty", true)
                .order("last_name")
                .returns<
                    Pick<User, "id" | "first_name" | "last_name" | "email">[]
                >();

            if (error || !data) {
                setFacultyFailed(true);
                enqueueSnackbar(
                    "Error fetching faculty. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }

            setFaculty(
                data.map((user) => ({
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`.trim(),
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                })),
            );
            setFacultyLoaded(true);
        };

        fetchFaculty();
    }, [enqueueSnackbar]);

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
                    meeting_start: wallClockToISO(startTime),
                    meeting_end: wallClockToISO(endTime),
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

            let availRooms = allRooms.filter((room) => {
                if (
                    ~filteredBookedRooms.findIndex(
                        (meta) => meta.room_id === room.id,
                    )
                ) {
                    return false;
                }

                const hasGrant = roomGrants.some(
                    (grant) =>
                        grant.room_id === room.id &&
                        grant.organization_id === organization.id,
                );

                const day = days[startTime!.day()];
                if (day === "SATURDAY" || day === "SUNDAY") return false;

                return (
                    (hasGrant || room.available_days.includes(day)) &&
                    !room.ais_days?.includes(days[startTime!.day()])
                );
            });

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
    }, [
        loading,
        id,
        roomId,
        startTime,
        endTime,
        enqueueSnackbar,
        roomGrants,
        organization.id,
    ]);

    useEffect(() => {
        const checkAdvisorNeeded = async () => {
            if (!roomId) {
                setAdvisorNeeded(false);
                return;
            }

            const { data, error } = await supabase
                .from("rooms")
                .select("id, approval_required")
                .eq("id", roomId)
                .single();

            if (error || !data) {
                return enqueueSnackbar("Error checking room floor.", {
                    variant: "error",
                });
            }

            setAdvisorNeeded(data.approval_required === true);
        };

        checkAdvisorNeeded();
    }, [roomId, enqueueSnackbar]);

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

        /* compare real instants, the picker values are New York wall clock times */
        const startInstant = dayjs(wallClockToISO(startTime));
        const endInstant = dayjs(wallClockToISO(endTime));

        if (endInstant.isBefore(startInstant)) {
            enqueueSnackbar(
                "Meeting start time cannot be after meeting end time.",
                { variant: "error" },
            );
            return;
        }

        if (endInstant.diff(startInstant, "minute") < 30) {
            enqueueSnackbar("Meeting duration must be at least 30 minutes.", {
                variant: "error",
            });
            return;
        }

        const keepsStartOfRunningMeeting =
            !!id &&
            !!start &&
            startInstant.isSame(dayjs(start)) &&
            endInstant.isAfter(dayjs());

        if (
            !user.admin &&
            !keepsStartOfRunningMeeting &&
            startInstant.isBefore(dayjs())
        ) {
            enqueueSnackbar("Meeting cannot be scheduled in the past.", {
                variant: "error",
            });
            return;
        }

        if (advisorNeeded && !facultyLoaded) {
            enqueueSnackbar(
                facultyFailed
                    ? "The faculty list could not be loaded, so this room cannot be booked right now. Reopen this window to try again."
                    : "The faculty list is still loading. Try again in a moment.",
                { variant: "error" },
            );
            return;
        }

        if (advisorInvalid) {
            setAdvisorTouched(true);
            enqueueSnackbar(
                "Meeting in this room requires a faculty advisor. Choose one from the list.",
                {
                    variant: "error",
                },
            );
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
                    start_time: wallClockToISO(startTime),
                    end_time: wallClockToISO(endTime),
                    is_public: isPub,
                    notify_faculty: notifyFaculty || advisorRoomBooking,
                    advisor: meetingAdvisor.trim(),
                    silent,
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
                    start_time: wallClockToISO(startTime),
                    end_time: wallClockToISO(endTime),
                    is_public: isPub,
                    notify_faculty: notifyFaculty || advisorRoomBooking,
                    advisor: meetingAdvisor.trim(),
                    silent,
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

                <FacultySelect
                    label="Faculty Advisor Present"
                    options={advisorOptions}
                    value={meetingAdvisor}
                    onChange={setMeetingAdvisor}
                    required={advisorNeeded}
                    error={advisorTouched && advisorInvalid}
                    helperText={
                        advisorTouched && advisorInvalid && facultyLoaded
                            ? "Choose a faculty advisor from the list."
                            : advisorNeeded && facultyFailed
                              ? "The faculty list could not be loaded."
                              : advisorNeeded && !facultyLoaded
                                ? "Loading the faculty list..."
                                : unregisteredAdvisor
                                  ? "This advisor is not a registered faculty member. Choose one from the list."
                                  : advisorNeeded
                                    ? "A faculty advisor is required for this room."
                                    : undefined
                    }
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
                <FormControlLabel
                    control={
                        <Switch
                            checked={silent}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                setSilent(event.target.checked)
                            }
                        />
                    }
                    sx={{ marginTop: "10px" }}
                    label="silent?"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={notifyFaculty || advisorRoomBooking}
                            disabled={advisorRoomBooking}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                setNotifyFaculty(event.target.checked)
                            }
                        />
                    }
                    sx={{ marginTop: "10px" }}
                    label={
                        advisorRoomBooking
                            ? "notify faculty? (required for this room)"
                            : "notify faculty?"
                    }
                />
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
