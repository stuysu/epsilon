import { Avatar, Box, Button, Card, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { supabase } from "../../../../supabaseClient";

import { PUBLIC_URL } from "../../../../constants";

import QRCode from "qrcode.react";
import AsyncButton from "../../../../comps/ui/AsyncButton";

const MeetingAdminAttendance = () => {
    const params = useParams();
    const meetingId = parseInt(params.meetingId || "-1");

    const navigate = useNavigate();

    const { enqueueSnackbar } = useSnackbar();

    const [meeting, setMeeting] = useState<Meeting | undefined>();

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchMeetingData = async () => {
            // fetch meeting
            const { data: meetingData, error: meetingFetchError } =
                await supabase
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
                    attendance (
                        user_id
                    )
                `,
                    )
                    .eq("id", meetingId)
                    .returns<Meeting>()
                    .limit(1)
                    .single();

            if (meetingFetchError || !meetingData) {
                enqueueSnackbar("Failed to fetch meeting.", {
                    variant: "error",
                });
                return;
            }

            setMeeting(meetingData);
        };
        fetchMeetingData();
    }, [meetingId, enqueueSnackbar]);

    const updateStatus = async (
        userId?: number,
        firstName?: string,
        lastName?: string,
        isPresent?: boolean,
    ) => {
        if (
            userId === undefined ||
            firstName === undefined ||
            lastName === undefined ||
            isPresent === undefined
        ) {
            enqueueSnackbar("Invalid parameters.", { variant: "error" });
            return;
        }

        let updateData: Attendance | null, updateError;

        if (isPresent) {
            // delete attendance record
            ({ error: updateError } = await supabase
                .from("attendance")
                .delete()
                .eq("user_id", userId)
                .eq("meeting_id", meetingId));
        } else {
            // insert attendance record
            ({ data: updateData, error: updateError } = await supabase
                .from("attendance")
                .insert({
                    user_id: userId,
                    meeting_id: meetingId,
                    organization_id: meeting?.organizations?.id,
                })
                .select(`*`)
                .returns<Attendance>()
                .single());
        }

        if (updateError) {
            enqueueSnackbar("Failed to update attendance.", {
                variant: "error",
            });
            return;
        }

        if (isPresent) {
            // remove attendance record on frontend
            setMeeting((prevMeeting) => {
                return {
                    ...prevMeeting,
                    attendance: (prevMeeting?.attendance || []).filter(
                        (attendance) => attendance.user_id !== userId,
                    ),
                } as Meeting;
            });
        } else {
            // add attendance record to frontend
            setMeeting((prevMeeting) => {
                return {
                    ...prevMeeting,
                    attendance: [
                        ...(prevMeeting?.attendance || []),
                        updateData,
                    ],
                } as Meeting;
            });
        }

        enqueueSnackbar(
            `${firstName} ${lastName} is now ${isPresent ? "Absent" : "Present"}!`,
            { variant: "success" },
        );
    };

    return (
        <Box>
            <Box sx={{ width: "100%", paddingLeft: "40px", marginTop: "20px" }}>
                <AsyncButton
                    onClick={() => {
                        let oid = meeting?.organizations?.id;

                        if (oid) {
                            navigate(`/modules/attendance?org=${oid}`);
                        } else {
                            navigate(`/modules/attendance`);
                        }
                    }}
                    variant="contained"
                    sx={{ width: "80px" }}
                >
                    Back
                </AsyncButton>
            </Box>
            <Typography variant="h1" width="100%" align="center">
                {meeting?.title}
            </Typography>
            <Typography variant="body1" width="300px" align="center" margin="auto">
                Send the QR code or the link below to your members to mark their attendance!
            </Typography>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    margin: "20px 0",
                }}
            >
                <QRCode
                    value={`${PUBLIC_URL}/modules/attendance/meeting/${meetingId}`}
                    size={300}
                />
                <Button 
                    onClick={() => {
                        navigator.clipboard.writeText(`${PUBLIC_URL}/modules/attendance/meeting/${meetingId}`);
                        setCopied(true);
                    }}
                    sx={{ width: "200px", marginTop: "20px" }}
                >
                    { copied ? "Copied!" : "Copy Link"}
                </Button>
            </div>
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
                        maxWidth: "800px",
                        width: "100%",
                        display: "flex",
                        flexWrap: "wrap",
                    }}
                >
                    {meeting?.organizations?.memberships?.map((member) => {
                        let userId = member.users?.id;
                        let userName =
                            member.users?.first_name +
                            " " +
                            member.users?.last_name;
                        let userPicture = member.users?.picture;
                        let userEmail = member.users?.email;

                        let isPresent = meeting?.attendance?.some(
                            (attendance) => attendance.user_id === userId,
                        );

                        return (
                            <Box
                                key={userId}
                                sx={{
                                    width: "100%",
                                    margin: "10px",
                                    display: "flex",
                                    flexWrap: "nowrap",
                                    height: "60px",
                                    alignItems: "center",
                                    position: "relative",
                                }}
                            >
                                <Avatar
                                    src={userPicture}
                                    alt={userName}
                                    sx={{
                                        width: "50px",
                                        height: "50px",
                                        fontSize: "25px",
                                    }}
                                >
                                    {userName[0].toUpperCase()}
                                </Avatar>

                                <Box
                                    sx={{
                                        width: "",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        padding: "20px",
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                    >
                                        {userName}
                                        <br />
                                        {userEmail}
                                        <br />
                                        ID: {String(userId).padStart(5, "0")}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        position: "absolute",
                                        right: 0,
                                        width: "130px",
                                        height: "60px",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <AsyncButton
                                        variant="outlined"
                                        color={isPresent ? "error" : "success"}
                                        onClick={() =>
                                            updateStatus(
                                                userId,
                                                member.users?.first_name,
                                                member.users?.last_name,
                                                isPresent,
                                            )
                                        }
                                    >
                                        {isPresent
                                            ? "Mark Absent"
                                            : "Mark Present"}
                                    </AsyncButton>
                                </Box>
                            </Box>
                        );
                    })}
                </Card>
            </Box>
        </Box>
    );
};

export default MeetingAdminAttendance;
