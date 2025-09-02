import { Box } from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../../lib/supabaseClient";
import { PUBLIC_URL } from "../../../../../config/constants";
import QRCode from "qrcode.react";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import OrgMember from "../../components/OrgMember";
import ItemList from "../../../../../components/ui/lists/ItemList";

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
            <h1>{meeting?.title}</h1>

            <div className={"w-full flex gap-5 max-md:flex-col mb-6"}>
                <div className={"w-full rounded-lg border border-divider p-5"}>
                    <p>
                        Send this link to allow attendees to mark their own
                        attendance. Click to copy the link to your clipboard.
                        <br />
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(
                                    `${PUBLIC_URL}/${orgUrl}/my-attendance/${meetingId}`,
                                );
                                enqueueSnackbar("Copied link to clipboard!", {
                                    variant: "success",
                                });
                            }}
                            className="cursor-pointer text-blue-500 underline"
                        >
                            {`${PUBLIC_URL}/${orgUrl}/my-attendance/${meetingId}`}
                        </a>
                    </p>
                </div>

                <div className={"w-full rounded-lg border border-divider p-5"}>
                    <p className={"mb-5"}>Or, send them this QR code.</p>
                    <QRCode
                        value={`${PUBLIC_URL}/${orgUrl}/my-attendance/${meetingId}`}
                        size={300}
                        style={{ borderRadius: 10, border: "1px solid white" }}
                    />
                </div>
            </div>
            <ItemList height={"auto"}>
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
                        <div className={"flex items-center max-sm:flex-col"}>
                            <div className={"w-full"}>
                                <OrgMember
                                    key={userId}
                                    email={userEmail}
                                    picture={userPicture}
                                    role_name={isPresent ? "Present" : "Absent"}
                                    first_name={userName}
                                    last_name={String(userId).padStart(5, "0")}
                                />
                            </div>
                            <div className={"w-48 px-4"}>
                                <AsyncButton
                                    isPrimary={!isPresent}
                                    onClick={() =>
                                        updateStatus(
                                            userId,
                                            member.users?.first_name,
                                            member.users?.last_name,
                                            isPresent,
                                        )
                                    }
                                >
                                    {isPresent ? "Mark Absent" : "Mark Present"}
                                </AsyncButton>
                            </div>
                        </div>
                    );
                })}
            </ItemList>
        </Box>
    );
};

export default MeetingAttendance;
