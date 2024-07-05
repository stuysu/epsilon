import { Avatar, Box, Card, Typography, Button } from "@mui/material"
import { useContext, useEffect } from "react";

import { useParams } from "react-router-dom";

import { useState } from "react";

import { supabase } from "../../../../supabaseClient";
import { useSnackbar } from "notistack";
import UserContext from "../../../../comps/context/UserContext";

const MeetingAttendance = () => {
    const user = useContext(UserContext);

    const params = useParams();
    const meetingId = parseInt(params.meetingId || "-1");

    const [valid, setValid] = useState(true);
    const [meeting, setMeeting] = useState<Meeting>();

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (isNaN(meetingId)) {
            setValid(false);
            return;
        }

        const validateMeeting = async () => {
            const { data: meetingData, error: meetingFetchError } = await supabase.from("meetings")
                .select(`
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
                    attendance (
                        user_id
                    )    
                `)
                .eq("id", meetingId)
                .returns<Meeting>()
                .limit(1)
                .single();

            if (meetingFetchError || !meetingData) {
                setValid(false);
                enqueueSnackbar("Failed to fetch meeting.", { variant: "error" });
                return;
            }

            setMeeting(meetingData);
        }

        validateMeeting();
    }, [meetingId, enqueueSnackbar]);

    if (!valid) {
        return (
            <Box>
                <Typography variant="h1">Invalid meeting ID</Typography>
            </Box>
        )
    }

    let isPresent = meeting?.attendance?.find(a => a.user_id === user.id) !== undefined;

    const markPresent = async () => {
        if (isPresent) {
            enqueueSnackbar("Already marked present.", { variant: "info" });
            return;
        }

        // insert attendance record
        const { data: updateData, error: updateError } = await supabase.from("attendance")
            .insert({ 
                user_id: user.id, 
                meeting_id: meetingId,
                organization_id: meeting?.organizations?.id
            })
            .select(`*`)
            .returns<Attendance>()
            .single();
        
        if (updateError || !updateData) {
            enqueueSnackbar("Failed to mark present.", { variant: "error" });
            return;
        }

        enqueueSnackbar("Marked present successfully.", { variant: "success" });
        setMeeting({
            ...meeting,
            attendance: [
                ...(meeting?.attendance || []),
                updateData
            ]
        } as Meeting)
    }

    return (
        <Box>
            <Typography variant="h1" width="100%" align="center">{meeting?.title}</Typography>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <Card sx={{ width: "100%", maxWidth: "400px", height: "300px", padding: "15px" }}>
                    <Box sx={{ 
                        width: "100%",
                        display: "flex",
                        justifyContent: "center"
                    }}>
                        <Avatar src={user.picture} alt={user.first_name + " " + user.last_name} sx={{ width: "100px", height: "100px"}}>
                            {user.first_name[0].toUpperCase()}
                        </Avatar>
                    </Box>
                    <Box sx={{ 
                        width: "100%",
                        display: "flex",
                        justifyContent: "center"
                    }}>
                        <Typography variant="h4">{user.first_name + " " + user.last_name}</Typography>
                    </Box>
                    <Box sx={{ 
                        width: "100%",
                        display: "flex",
                        justifyContent: "center"
                    }}>
                        <Typography variant="h5">Status: {isPresent ? "Present" : "Absent"}</Typography>
                    </Box>
                    <Button
                        onClick={markPresent} 
                        disabled={isPresent} 
                        sx={{ width: "100%"}} 
                        color="success" 
                        variant="contained"
                    >Mark Present</Button>
                </Card>
            </Box>
        </Box>
    )
}

export default MeetingAttendance;