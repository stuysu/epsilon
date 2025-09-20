import { Box } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import MeetingAttendanceCard from "../components/MeetingAttendanceCard";
import LoginGate from "../../../../../components/ui/content/LoginGate";
import OrgContext from "../../../../../contexts/OrgContext";
import ContentUnavailable from "../../../../../components/ui/content/ContentUnavailable";

const AttendanceOverview = () => {
    const org = useContext(OrgContext);
    const { enqueueSnackbar } = useSnackbar();

    const [meetings, setMeetings] = useState<Meeting[]>([]);

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
                    <div
                        className={
                            "w-full bg-layer-1 p-5 pl-7 pb-8 rounded-xl mb-10 mt-2 shadow-prominent"
                        }
                    >
                        <h1>Take Attendance</h1>
                        <p>
                            Here is the attendance overview for your Activity.
                            Attendance records must be kept up to date on
                            Epsilon. Strikes will be issued if attendance is not
                            marked or falsely marked.
                        </p>
                    </div>

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
