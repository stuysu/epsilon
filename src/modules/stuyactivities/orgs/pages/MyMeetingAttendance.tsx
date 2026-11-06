import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import UserContext from "../../../../contexts/UserContext";
import OrgContext from "../../../../contexts/OrgContext";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import LoginGate from "../../../../components/ui/content/LoginGate";
import Avatar from "../../../../components/ui/Avatar";
import { toNewYork, usesNewYorkTime } from "../../../../utils/NewYorkTime";

/* members can check themselves in from this long before the meeting starts until it ends */
const CHECK_IN_OPENS_MINUTES_BEFORE = 15;

/* e.g. "Thursday, November 6 at 3:45 PM" */
const formatWhen = (value: ReturnType<typeof toNewYork>) =>
    `${value.format("dddd, MMMM D")} at ${value.format("LT")}`;

const MyMeetingAttendance = () => {
    const user = useContext(UserContext);
    const organization = useContext(OrgContext);
    const { meetingId: meetingIdParam } = useParams();
    const meetingId = parseInt(meetingIdParam || "-1", 10);

    const [valid, setValid] = useState(true);
    const [meeting, setMeeting] = useState<Meeting>();
    const [now, setNow] = useState(() => Date.now());
    const { enqueueSnackbar } = useSnackbar();

    const membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );
    const isActiveMember = !!membership?.active;

    /* re-check the time every so often so the button opens and closes on its own */
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 15 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isNaN(meetingId)) {
            setValid(false);
            return;
        }
        if (!user.signed_in || !isActiveMember) return;
        const validateMeeting = async () => {
            const { data, error } = await supabase
                .from("meetings")
                .select(
                    `
          id,
          title,
          start_time,
          end_time,
          organizations!inner (
            id
          ),
          attendance ( user_id )
        `,
                )
                .eq("id", meetingId)
                .eq("organization_id", organization.id)
                .eq("attendance.user_id", user.id)
                .returns<Meeting>()
                .maybeSingle();

            if (error) {
                enqueueSnackbar("Failed to fetch meeting.", {
                    variant: "error",
                });
            }
            if (error || !data) {
                setValid(false);
                return;
            }
            setMeeting(data);
        };
        validateMeeting();
    }, [
        meetingId,
        user.signed_in,
        user.id,
        isActiveMember,
        organization.id,
        enqueueSnackbar,
    ]);

    if (!valid) {
        return (
            <div>
                <h1>Invalid meeting ID</h1>
            </div>
        );
    }

    const isPresent = !!meeting?.attendance?.find((a) => a.user_id === user.id);

    const start = meeting ? toNewYork(meeting.start_time) : undefined;
    const end = meeting ? toNewYork(meeting.end_time) : undefined;
    const opens = start?.subtract(CHECK_IN_OPENS_MINUTES_BEFORE, "minute");
    const notOpenYet = !!opens && now < opens.valueOf();
    const closed = !!end && now > end.valueOf();
    const canCheckIn = !!meeting && !notOpenYet && !closed;
    const timezoneNote = usesNewYorkTime() ? "" : " (New York time)";

    const markPresent = async () => {
        if (isPresent) {
            enqueueSnackbar("Already marked present.", { variant: "info" });
            return;
        }
        if (!canCheckIn) {
            enqueueSnackbar("Check-in isn't open for this meeting.", {
                variant: "info",
            });
            return;
        }
        const { data, error } = await supabase
            .from("attendance")
            .insert({
                user_id: user.id,
                meeting_id: meetingId,
                organization_id: meeting?.organizations?.id,
            })
            .select(`*`)
            .returns<Attendance>()
            .single();

        if (error || !data) {
            enqueueSnackbar("Failed to mark present.", { variant: "error" });
            return;
        }

        enqueueSnackbar("Marked present successfully.", { variant: "success" });
        setMeeting(
            (prev) =>
                ({
                    ...(prev as Meeting),
                    attendance: [...(prev?.attendance || []), data],
                }) as Meeting,
        );
    };

    if (user.signed_in && !isActiveMember) {
        return (
            <div
                className={
                    "w-full h-[70vh] px-14 flex flex-col justify-center items-center"
                }
            >
                <i className="bx bx-lock bx-lg text-blue mb-5"></i>
                <h1 className={"text-center mb-3"}>
                    Only members of {organization.name} can mark attendance.
                </h1>
                <p className={"text-center"}>
                    {membership
                        ? "Your request to join is still pending. You can mark attendance once it's approved."
                        : "Join this activity to mark your attendance at its meetings."}
                </p>
            </div>
        );
    }

    let checkInMessage = "";
    if (meeting && !isPresent) {
        if (notOpenYet && opens) {
            checkInMessage = `Check-in opens ${formatWhen(opens)}${timezoneNote}.`;
        } else if (closed && end) {
            checkInMessage = `Check-in closed when the meeting ended, ${formatWhen(end)}${timezoneNote}.`;
        }
    }

    return (
        <LoginGate page="mark your attendance">
            <div>
                <h1>{meeting?.title}</h1>
                {start && end && (
                    <p>
                        {`${start.format("dddd, MMMM D")}, ${start.format("LT")} to ${end.format("LT")}${timezoneNote}`}
                    </p>
                )}
                <div className="w-full flex justify-center mt-5">
                    <div
                        className="rounded bg-layer-2 shadow-control"
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            minHeight: "300px",
                            padding: "15px",
                        }}
                    >
                        <div className="w-full flex justify-center">
                            <Avatar
                                src={user.picture}
                                alt={user.first_name + " " + user.last_name}
                                style={{ width: "100px", height: "100px" }}
                            >
                                {user.first_name[0]?.toUpperCase()}
                            </Avatar>
                        </div>
                        <div className="w-full flex justify-center">
                            <h1>{user.first_name + " " + user.last_name}</h1>
                        </div>
                        <div className="w-full flex justify-center">
                            <h2>Status: {isPresent ? "Present" : "Absent"}</h2>
                        </div>
                        <AsyncButton
                            onClick={markPresent}
                            disabled={isPresent || !canCheckIn}
                            sx={{ width: "100%" }}
                            color="success"
                        >
                            Mark Myself Present
                        </AsyncButton>
                        {checkInMessage && (
                            <p className={"text-center mt-3"}>
                                {checkInMessage}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </LoginGate>
    );
};

export default MyMeetingAttendance;
