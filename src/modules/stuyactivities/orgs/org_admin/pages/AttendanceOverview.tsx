import { Box, Typography } from "@mui/material";
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
                    <Box
                        height="100%"
                        bgcolor="#1f1f1f80"
                        padding={5}
                        borderRadius={3}
                        marginBottom={3}
                        marginTop={1}
                        boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                    >
                        <Typography variant="h1" align="center" width="100%">
                            Take Attendance
                        </Typography>
                        <Typography
                            variant="body1"
                            align="center"
                            width="100%"
                            paddingX={"2vw"}
                        >
                            Here is the attendance overview for your Activity.
                            Attendance records must be kept up to date on
                            Epsilon. Strikes will be issued if attendance is not
                            marked or falsely marked.
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                width: "100%",
                                marginTop: "20px",
                            }}
                        ></Box>
                    </Box>

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
