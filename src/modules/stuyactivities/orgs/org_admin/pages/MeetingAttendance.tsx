import { Avatar, Box, Card, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../../lib/supabaseClient";
import { PUBLIC_URL } from "../../../../../config/constants";
import QRCode from "qrcode.react";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";

const MeetingAttendance = () => {
    const { meetingId: meetingIdParam, orgUrl } = useParams();
    const meetingId = parseInt(meetingIdParam || "-1", 10);

    const { enqueueSnackbar } = useSnackbar();
    const [meeting, setMeeting] = useState<Meeting | undefined>();

    useEffect(() => {
        let isMounted = true;

        const fetchMeetingData = async () => {
            const { data: meetingData, error } = await supabase
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

            if (error || !meetingData) {
                if (isMounted) {
                    console.error(error);
                    enqueueSnackbar(
                        `Failed to fetch meeting. <${error?.message || "Unknown Error"}>`,
                        { variant: "error" },
                    );
                }
                return;
            }

            if (isMounted) setMeeting(meetingData);
        };

        // initial + poll
        fetchMeetingData();
        const interval = setInterval(fetchMeetingData, 2500);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [meetingId, enqueueSnackbar]);

    const updateStatus = async (
        userId?: number,
        firstName?: string,
        lastName?: string,
        isPresent?: boolean,
    ) => {
        if (
            userId == null ||
            firstName == null ||
            lastName == null ||
            isPresent == null
        ) {
            enqueueSnackbar("Invalid parameters.", { variant: "error" });
            return;
        }

        let updateData: Attendance | null | undefined;
        let updateError;

        if (isPresent) {
            ({ error: updateError } = await supabase
                .from("attendance")
                .delete()
                .eq("user_id", userId)
                .eq("meeting_id", meetingId));
        } else {
            const res = await supabase
                .from("attendance")
                .insert({
                    user_id: userId,
                    meeting_id: meetingId,
                    organization_id: meeting?.organizations?.id,
                })
                .select(`*`)
                .returns<Attendance>()
                .single();
            updateData = res.data;
            updateError = res.error;
        }

        if (updateError) {
            console.error(updateError);
            enqueueSnackbar(
                `Failed to update attendance. <${updateError?.message || "Unknown Error"}>`,
                { variant: "error" },
            );
            return;
        }

        setMeeting((prev) => {
            if (!prev) return prev;
            const attendance = isPresent
                ? (prev.attendance || []).filter((a) => a.user_id !== userId)
                : [...(prev.attendance || []), updateData!];
            return { ...prev, attendance } as Meeting;
        });

        enqueueSnackbar(
            `${firstName} ${lastName} is now ${isPresent ? "Absent" : "Present"}!`,
            { variant: "success" },
        );
    };

    return (
        <Box>
            <Typography variant="h1" width="100%" align="center">
                {meeting?.title}
            </Typography>

            <Typography variant="body1" width="100%" align="center">
                Send this link to allow attendees to mark their own attendance:
                <br />
                {/* FIXED: self-check route uses orgUrl */}
                {`${PUBLIC_URL}/${orgUrl}/my-attendance/${meetingId}`}
            </Typography>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    margin: "20px 0",
                }}
            >
                <QRCode
                    value={`${PUBLIC_URL}/${orgUrl}/my-attendance/${meetingId}`}
                    size={300}
                    style={{ borderRadius: 10, border: "1px solid white" }}
                />
            </div>

            <Typography variant="body1" width="100%" align="center">
                Or send them this QR code
            </Typography>
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
                                        width: "150px",
                                        display: "flex",
                                        justifyContent: "center",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        width="100%"
                                        align="center"
                                    >
                                        {userName}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        width="100%"
                                        align="center"
                                    >
                                        {userEmail}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        width="100%"
                                        align="center"
                                    >
                                        ID: {String(userId).padStart(5, "0")}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: "50px",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        color={
                                            isPresent ? "#2ecc71" : "secondary"
                                        }
                                    >
                                        {isPresent ? "Present" : "Absent"}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        position: "absolute",
                                        right: 0,
                                        width: "130px",
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

export default MeetingAttendance;
