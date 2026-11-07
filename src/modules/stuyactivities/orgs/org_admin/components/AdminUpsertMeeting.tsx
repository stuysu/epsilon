import { ChangeEvent, useContext, useEffect, useState } from "react";
import ContentDialog from "../../../../../components/ui/overlays/ContentDialog";
import {
    DateField,
    TimeField,
} from "../../../../../components/ui/input/DateTimeField";
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
import SelectField from "../../../../../components/ui/input/SelectField";
import SwitchField from "../../../../../components/ui/input/SwitchField";
import TextField from "../../../../../components/ui/input/TextField";
import { functionErrorText } from "../../../../../utils/FunctionErrors";

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
            const { data, error } = await supabase.from("rooms").select();

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
            setAllRooms(() => {
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

            const availRooms = allRooms.filter((room) => {
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
            const error = await functionErrorText(supabaseReturn.error);
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
        <ContentDialog
            open={open}
            onClose={onClose}
            title={`${id ? "Update" : "Create"} Meeting`}
            actions={
                <>
                    <AsyncButton onClick={onClose}>Cancel</AsyncButton>
                    <AsyncButton onClick={handleSave}>Save</AsyncButton>
                </>
            }
        >
            <div className="w-full flex flex-nowrap items-center h-[80px]">
                <TextField
                    value={meetingTitle}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setMeetingTitle(event.target.value)
                    }
                    label="Title"
                    sx={{ width: "100%", height: "60px" }}
                />
                <SelectField
                    value={!loading ? String(roomId) : ""}
                    label="Room"
                    onChange={(next) => setRoomId(Number(next) || undefined)}
                    options={[
                        { value: "undefined", label: "Virtual" },
                        ...availableRooms.map((room) => ({
                            value: String(room.id),
                            label: room.name,
                        })),
                    ]}
                    sx={{
                        width: "30%",
                        minWidth: "120px",
                        height: "60px",
                        marginLeft: "10px",
                    }}
                />
            </div>

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
                sx={{ marginTop: "16px" }}
            />

            <DateField
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
            <div className="w-full flex flex-nowrap items-center">
                <TimeField
                    label="Start"
                    value={startTime}
                    onChange={setStartTime}
                    sx={{ marginRight: "10px" }}
                />

                <TimeField label="End" value={endTime} onChange={setEndTime} />
            </div>
            <SwitchField
                checked={isPub}
                onChange={setIsPub}
                className="mt-2.5"
                label="is public?"
            />
            <SwitchField
                checked={silent}
                onChange={setSilent}
                className="mt-2.5"
                label="silent?"
            />
            <SwitchField
                checked={notifyFaculty || advisorRoomBooking}
                disabled={advisorRoomBooking}
                onChange={setNotifyFaculty}
                className="mt-2.5"
                label={
                    advisorRoomBooking
                        ? "notify faculty? (required for this room)"
                        : "notify faculty?"
                }
            />
        </ContentDialog>
    );
};

export default AdminUpsertMeeting;
