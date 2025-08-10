import { Box, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import MeetingAttendanceCard from "../components/MeetingAttendanceCard";
import LoginGate from "../../../../../components/ui/LoginGate";
import OrgContext from "../../../../../contexts/OrgContext";

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
                    Attendance Overview
                </Typography>
                <Typography
                    variant="body1"
                    align="center"
                    width="100%"
                    paddingX={"2vw"}
                >
                    Attendance records must be kept up to date on Epsilon.
                    Strikes will be issued if attendance is not marked or
                    falsely marked.
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
                {meetings.length === 0 ? (
                    <Typography variant="h3" align="center">
                        No meetings found.
                    </Typography>
                ) : (
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
                )}
            </Box>
        </LoginGate>
    );
};

export default AttendanceOverview;
