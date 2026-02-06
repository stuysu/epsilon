import { Box } from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import MeetingAttendanceCard from "../components/MeetingAttendanceCard";
import LoginGate from "../../../../../components/ui/content/LoginGate";
import OrgContext from "../../../../../contexts/OrgContext";
import ContentUnavailable from "../../../../../components/ui/content/ContentUnavailable";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const AttendanceOverview = () => {
    const org = useContext(OrgContext);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [now, setNow] = useState(() => dayjs());

    useEffect(() => {
        const fetchOrgMeetings = async () => {
            if (!org.id || org.id === -1) return;

            const { data: meetingsData, error: meetingFetchError } =
                await supabase
                    .from("meetings")
                    .select(`*, rooms(name)`)
                    .eq("organization_id", org.id);

            if (meetingFetchError || !meetingsData) {
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
            setMeetings(sortedMeetings);
        };

        fetchOrgMeetings();
    }, [org.id, enqueueSnackbar]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(dayjs());
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const activeMeeting = useMemo(() => {
        if (meetings.length === 0) return null;

        const candidates = meetings.filter((meeting) => {
            const start = dayjs(meeting.start_time);
            const end = dayjs(meeting.end_time);
            const windowStart = start.subtract(30, "minute");

            const withinWindowStart =
                now.isAfter(windowStart) || now.isSame(windowStart);
            const beforeEnd = now.isBefore(end) || now.isSame(end);
            return withinWindowStart && beforeEnd;
        });

        if (candidates.length === 0) return null;

        return candidates.reduce((closest, meeting) => {
            if (!closest) return meeting;
            const closestDiff = Math.abs(
                dayjs(closest.start_time).diff(now, "minute"),
            );
            const meetingDiff = Math.abs(
                dayjs(meeting.start_time).diff(now, "minute"),
            );
            return meetingDiff < closestDiff ? meeting : closest;
        }, candidates[0] as Meeting);
    }, [meetings, now]);

    return (
        <LoginGate>
            {meetings.length === 0 ? (
                <ContentUnavailable
                    icon="bx-calendar-x"
                    iconColor="text-yellow"
                    title="Attendance Unavailable"
                    description="This Activity has not yet held any meetings. When they become available, you can take their attendance here."
                />
            ) : (
                <div>
                    <header className={"mb-6 mt-2"}>
                        <section className={"flex justify-between mb-2"}>
                            <h1>Attendance</h1>
                            <div>
                                <AsyncButton
                                    className={"right-2"}
                                    onClick={() => {
                                        if (activeMeeting) {
                                            navigate(`${activeMeeting.id}`);
                                        }
                                    }}
                                    disabled={!activeMeeting}
                                >
                                    {activeMeeting
                                        ? "Take Attendance for Current Meeting"
                                        : "No Active Meetings"}
                                </AsyncButton>
                            </div>
                        </section>
                        <p>
                            Here is the attendance overview for your Activity.
                            Attendance records must be kept up to date on
                            Epsilon. Strikes will be issued if attendance is not
                            marked or falsely marked.
                        </p>
                    </header>

                    <Box sx={{ width: "100%" }}>
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                flexWrap: "wrap",
                            }}
                        >
                            {meetings.map((meeting) => (
                                <MeetingAttendanceCard
                                    key={meeting.id}
                                    title={meeting.title}
                                    id={meeting.id}
                                    room={meeting.rooms?.name}
                                    startTime={meeting.start_time}
                                    clickable={true}
                                />
                            ))}
                        </Box>
                    </Box>
                </div>
            )}
        </LoginGate>
    );
};

export default AttendanceOverview;
