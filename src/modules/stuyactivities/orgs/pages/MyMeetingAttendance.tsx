import { Avatar, Box, Card, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import UserContext from "../../../../contexts/UserContext";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";

const MyMeetingAttendance = () => {
    const user = useContext(UserContext);
    const { meetingId: meetingIdParam } = useParams();
    const meetingId = parseInt(meetingIdParam || "-1", 10);

    const [valid, setValid] = useState(true);
    const [meeting, setMeeting] = useState<Meeting>();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (isNaN(meetingId)) {
            setValid(false);
            return;
        }
        const validateMeeting = async () => {
            const { data, error } = await supabase
                .from("meetings")
                .select(
                    `
          title,
          start_time,
          end_time,
          organizations!inner (
            id,
            memberships (
              users!inner (
                id,
                first_name,
                last_name,
                picture,
                email
              )
            )
          ),
          attendance ( user_id )
        `,
                )
                .eq("id", meetingId)
                .returns<Meeting>()
                .single();

            if (error || !data) {
                setValid(false);
                enqueueSnackbar("Failed to fetch meeting.", {
                    variant: "error",
                });
                return;
            }
            setMeeting(data);
        };
        validateMeeting();
    }, [meetingId, enqueueSnackbar]);

    if (!valid) {
        return (
            <Box>
                <h1>Invalid meeting ID</h1>
            </Box>
        );
    }

    const isPresent = !!meeting?.attendance?.find((a) => a.user_id === user.id);

    const markPresent = async () => {
        if (isPresent) {
            enqueueSnackbar("Already marked present.", { variant: "info" });
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

    return (
        <Box>
            <h1>{meeting?.title}</h1>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                }}
            >
                <Card
                    sx={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "300px",
                        padding: "15px",
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Avatar
                            src={user.picture}
                            alt={user.first_name + " " + user.last_name}
                            sx={{ width: "100px", height: "100px" }}
                        >
                            {user.first_name[0].toUpperCase()}
                        </Avatar>
                    </Box>
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <h1>{user.first_name + " " + user.last_name}</h1>
                    </Box>
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <h2>Status: {isPresent ? "Present" : "Absent"}</h2>
                    </Box>
                    <AsyncButton
                        onClick={markPresent}
                        disabled={isPresent}
                        sx={{ width: "100%" }}
                        color="success"
                        variant="contained"
                    >
                        Mark Myself Present
                    </AsyncButton>
                </Card>
            </Box>
        </Box>
    );
};

export default MyMeetingAttendance;
