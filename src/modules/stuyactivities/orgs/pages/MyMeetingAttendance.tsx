import { useContext, useEffect, useState } from "react";
import BackLink from "../../../../components/ui/links/BackLink";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import UserContext from "../../../../contexts/UserContext";
import OrgContext from "../../../../contexts/OrgContext";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import LoginGate from "../../../../components/ui/content/LoginGate";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";
import { Ring } from "../components/AttendanceBits";
import MeetingChips, { MeetingChip } from "../components/MeetingChips";
import { toNewYork, usesNewYorkTime } from "../../../../utils/NewYorkTime";

/*
 * Self check-in window. Members can mark themselves present from
 * CHECK_IN_OPENS_MINUTES_BEFORE minutes before the meeting starts until
 * CHECK_IN_CLOSES_MINUTES_AFTER minutes after it ends.
 * Keep in sync with attendance_checkin_opens_before() / attendance_checkin_closes_after()
 * in the database, which enforce the same window.
 */
const CHECK_IN_OPENS_MINUTES_BEFORE = 15;
const CHECK_IN_CLOSES_MINUTES_AFTER = 15;

/* e.g. "Thursday, November 6 at 3:45 PM" */
const formatWhen = (value: ReturnType<typeof toNewYork>) =>
    `${value.format("dddd, MMMM D")} at ${value.format("LT")}`;

const MyMeetingAttendance = () => {
    const user = useContext(UserContext);
    const organization = useContext(OrgContext);
    const { meetingId: meetingIdParam, orgUrl } = useParams();
    const meetingId = parseInt(meetingIdParam || "-1", 10);
    // only the meeting's QR code and link carry this, so check-in needs you there
    const [searchParams] = useSearchParams();
    const code = searchParams.get("code");

    const [valid, setValid] = useState(true);
    const [meeting, setMeeting] = useState<Meeting>();
    const [now, setNow] = useState(() => Date.now());
    const [lateAfter, setLateAfter] = useState(15);
    const { enqueueSnackbar } = useSnackbar();

    const membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );
    const isActiveMember = !!membership?.active;

    /* ticks every second so the countdown and the button update on their own */
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!organization.id || organization.id === -1) return;
        supabase
            .from("organizations")
            .select("late_after_minutes")
            .eq("id", organization.id)
            .maybeSingle()
            .then(({ data }) => {
                if (typeof data?.late_after_minutes === "number")
                    setLateAfter(data.late_after_minutes);
            });
    }, [organization.id]);

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
          rooms ( name ),
          organizations!inner (
            id
          ),
          attendance ( user_id, late )
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
            <ContentUnavailable
                icon="bx-calendar-x"
                iconColor="text-yellow"
                title="Meeting Not Found"
                description="This meeting doesn't exist or belongs to another Activity."
                action={
                    <BackLink
                        to={`/${orgUrl}/attendance`}
                        className={
                            "inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-typography-1 underline-offset-2 sm:hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1"
                        }
                    >
                        <i
                            aria-hidden="true"
                            className={"bx bx-chevron-left"}
                        />
                        Back to My Attendance
                    </BackLink>
                }
            />
        );
    }

    const myMark = meeting?.attendance?.find((a) => a.user_id === user.id);
    const isPresent = !!myMark;

    const start = meeting ? toNewYork(meeting.start_time) : undefined;
    const end = meeting ? toNewYork(meeting.end_time) : undefined;
    const opens = start?.subtract(CHECK_IN_OPENS_MINUTES_BEFORE, "minute");
    const notOpenYet = !!opens && now < opens.valueOf();
    const closes = end?.add(CHECK_IN_CLOSES_MINUTES_AFTER, "minute");
    const closed = !!closes && now > closes.valueOf();
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
            .rpc("check_in_to_meeting", {
                p_meeting_id: meetingId,
                p_code: code,
            })
            .returns<Attendance>()
            .single();

        if (error || !data) {
            enqueueSnackbar(
                error?.message === "Invalid check-in code"
                    ? "This check-in link isn't valid. Scan the QR code at the meeting."
                    : "Failed to mark present.",
                { variant: "error" },
            );
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

    const joinClub = async () => {
        const { data, error } = await supabase.functions.invoke(
            "join-organization",
            { body: { organization_id: organization.id } },
        );
        if (error || !data) {
            enqueueSnackbar("Unable to join organization.", {
                variant: "error",
            });
            return;
        }
        organization.setOrg?.({
            ...organization,
            memberships: [...organization.memberships, data],
        });
        enqueueSnackbar("Join request sent!", { variant: "success" });
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
                        : organization.joinable
                          ? "Join this activity to mark your attendance at its meetings."
                          : "This activity is private. Ask a leader to add you."}
                </p>
                {!membership && organization.joinable && (
                    <AsyncButton
                        isPrimary
                        onClick={joinClub}
                        className={"mt-6 w-full max-w-sm"}
                    >
                        Join {organization.name}
                    </AsyncButton>
                )}
            </div>
        );
    }

    let checkInMessage = "";
    if (meeting && !isPresent) {
        if (closed && closes) {
            checkInMessage = `Check-in closed ${formatWhen(closes)}${timezoneNote}.`;
        } else if (!code) {
            checkInMessage =
                "To check in, scan the QR code or open the link your leaders share at the meeting.";
        } else if (notOpenYet && opens) {
            checkInMessage = `Check-in opens ${formatWhen(opens)}${timezoneNote}.`;
        }
    }

    const lateAt = start ? start.add(lateAfter, "minute").valueOf() : 0;
    const msLeft = lateAt - now;
    const countdown = `${Math.floor(Math.max(0, msLeft) / 60000)}:${String(
        Math.floor((Math.max(0, msLeft) % 60000) / 1000),
    ).padStart(2, "0")}`;

    let status = { label: "Absent", icon: "bx-x-circle", color: "text-red" };
    if (isPresent)
        status = myMark?.late
            ? {
                  label: "Present (Late)",
                  icon: "bx-time-five",
                  color: "text-yellow",
              }
            : {
                  label: "Present",
                  icon: "bx-check-circle",
                  color: "text-green",
              };

    return (
        <LoginGate page="mark your attendance">
            <div>
                <header className={"mb-6 mt-2"}>
                    <h1 className={"mb-2 break-words"}>
                        <BackLink
                            to={`/${orgUrl}/attendance`}
                            className={
                                "rounded-md text-typography-3 no-underline transition-colors sm:hover:text-typography-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                            }
                        >
                            My Attendance
                        </BackLink>
                        <span
                            aria-hidden="true"
                            className={"text-typography-3"}
                        >
                            /
                        </span>
                        {meeting?.title}
                    </h1>
                    {meeting && (
                        <div className={"mb-3"}>
                            <MeetingChips
                                align="start"
                                start_time={meeting.start_time}
                                end_time={meeting.end_time}
                                room_name={meeting.rooms?.name}
                            />
                        </div>
                    )}
                    {timezoneNote && <p>Times are in New York time.</p>}
                </header>
                <section
                    className={
                        "flex flex-col items-center gap-5 rounded-2xl border border-divider bg-layer-1 px-5 py-8 text-center shadow-prominent sm:py-10"
                    }
                >
                    {isPresent ? (
                        <div
                            className={`flex size-36 items-center justify-center rounded-full bg-layer-2 sm:size-44 ${status.color}`}
                        >
                            <i
                                aria-hidden="true"
                                className={`bx ${status.icon} text-7xl sm:text-8xl`}
                            />
                        </div>
                    ) : meeting && canCheckIn && code ? (
                        <Ring
                            size={176}
                            width={6}
                            value={
                                msLeft > 0 && lateAfter
                                    ? msLeft / (lateAfter * 60000)
                                    : 1
                            }
                            stroke={
                                msLeft > 0 ? "stroke-blue" : "stroke-yellow"
                            }
                        >
                            {msLeft > 0 ? (
                                <>
                                    <p
                                        className={
                                            "important text-4xl tabular-nums"
                                        }
                                    >
                                        {countdown}
                                    </p>
                                    <p className={"text-sm"}>
                                        until you&apos;re late
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className={"important text-3xl"}>Late</p>
                                    <p className={"text-sm"}>
                                        you can still check in
                                    </p>
                                </>
                            )}
                        </Ring>
                    ) : (
                        <div
                            className={
                                "flex size-36 items-center justify-center rounded-full bg-layer-2 text-typography-3 sm:size-44"
                            }
                        >
                            <i
                                aria-hidden="true"
                                className={
                                    "bx bx-calendar text-7xl sm:text-8xl"
                                }
                            />
                        </div>
                    )}
                    <div className={"flex flex-col items-center gap-2"}>
                        <h2 aria-live="polite" className={"text-base"}>
                            <span className={"sr-only"}>Status: </span>
                            <MeetingChip
                                icon={status.icon}
                                iconClass={status.color}
                                label={
                                    isPresent ? status.label : "Not Checked In"
                                }
                            />
                        </h2>
                        {checkInMessage && (
                            <p className={"max-w-sm text-sm"}>
                                {checkInMessage}
                            </p>
                        )}
                    </div>
                    {!isPresent && code && !closed && (
                        <div className={"w-full max-w-sm"}>
                            <AsyncButton
                                isPrimary
                                onClick={markPresent}
                                disabled={!canCheckIn}
                                className={"w-full"}
                            >
                                Mark Myself Present
                            </AsyncButton>
                        </div>
                    )}
                </section>
            </div>
        </LoginGate>
    );
};

export default MyMeetingAttendance;
