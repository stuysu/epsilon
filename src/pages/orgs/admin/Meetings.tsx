import { useContext, useState } from "react";
import OrgContext from "../../../comps/context/OrgContext";
import AdminUpsertMeeting from "../../../comps/pages/orgs/admin/AdminUpsertMeeting";

import { Box, Stack, Typography, useMediaQuery } from "@mui/material";
import { supabase } from "../../../supabaseClient";
import { useSnackbar } from "notistack";
import OrgMeeting from "../../../comps/pages/orgs/OrgMeeting";

import { sortByDate } from "../../../utils/DataFormatters";
import AsyncButton from "../../../comps/ui/AsyncButton";

import { useNavigate } from "react-router-dom";

const Meetings = () => {
    const navigate = useNavigate();

    const organization = useContext(OrgContext);
    const { enqueueSnackbar } = useSnackbar();
    const isMeetingMobile = useMediaQuery("(max-width: 1450px)");

    const [editState, setEditState] = useState<{
        id: number | undefined;
        title: string | undefined;
        description: string | undefined;
        start: string | undefined;
        end: string | undefined;
        room: number | undefined;
        isPublic: boolean | undefined;
        editing: boolean;
    }>({
        id: undefined,
        title: undefined,
        description: undefined,
        start: undefined,
        end: undefined,
        room: undefined,
        isPublic: undefined,
        editing: false,
    });

    if (
        organization.state === "LOCKED" ||
        organization.state === "PENDING" ||
        organization.state === "PUNISHED"
    )
        return <h2>Meetings are disabled for this organization.</h2>;

    return (
        <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
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
                    Activity Meetings
                </Typography>
                <Typography variant="body1" align="center" width="100%">
                    <i className={"bx bx-calendar-exclamation"}></i> Meeting
                    attendance records must be kept up to date on Epsilon in
                    order to secure funding and avoid receiving strikes.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                        marginTop: "20px",
                    }}
                >
                    <AsyncButton
                        onClick={() =>
                            setEditState({
                                id: undefined,
                                title: undefined,
                                description: undefined,
                                start: undefined,
                                end: undefined,
                                room: undefined,
                                isPublic: undefined,
                                editing: true,
                            })
                        }
                        variant="contained"
                    >
                        Create Meeting
                    </AsyncButton>
                </Box>
            </Box>

            <Box
                height="100%"
                bgcolor="#1f1f1f80"
                padding={0.5}
                borderRadius={3}
                marginBottom={10}
                marginTop={1}
                boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
            >
                <Stack borderRadius={2} overflow="hidden" spacing={0.5}>
                    {organization.meetings
                        .sort(sortByDate)
                        .reverse()
                        .map((meeting) => (
                            <OrgMeeting
                                key={meeting.id}
                                id={meeting.id}
                                title={meeting.title}
                                description={meeting.description}
                                start_time={meeting.start_time}
                                end_time={meeting.end_time}
                                room_name={meeting.rooms?.name}
                                org_name={organization.name}
                                org_picture={organization.picture || ""}
                                is_public={meeting.is_public}
                                isMobile={isMeetingMobile}
                                openAttendance={() => {
                                    navigate(
                                        `/modules/attendance/meeting-admin/${meeting.id}`,
                                    );
                                }}
                                onEdit={() => {
                                    setEditState({
                                        id: meeting.id,
                                        title: meeting.title,
                                        description: meeting.description,
                                        start: meeting.start_time,
                                        end: meeting.end_time,
                                        room: meeting.rooms?.id,
                                        isPublic: meeting.is_public,
                                        editing: true,
                                    });
                                }}
                                onDelete={async () => {
                                    let { error } =
                                        await supabase.functions.invoke(
                                            "delete-meeting",
                                            {
                                                body: {
                                                    id: meeting.id,
                                                },
                                            },
                                        );

                                    if (error) {
                                        return enqueueSnackbar(
                                            "Error deleting meeting. Contact it@stuysu.org for support.",
                                            { variant: "error" },
                                        );
                                    }

                                    if (organization.setOrg) {
                                        // update org
                                        organization.setOrg({
                                            ...organization,
                                            meetings:
                                                organization.meetings.filter(
                                                    (m) => m.id !== meeting.id,
                                                ),
                                        });
                                    }

                                    enqueueSnackbar("Deleted Meeting!", {
                                        variant: "success",
                                    });
                                }}
                            />
                        ))}
                </Stack>
            </Box>

            {editState.editing && (
                <AdminUpsertMeeting
                    id={editState.id}
                    title={editState.title}
                    description={editState.description}
                    room_id={editState.room}
                    start={editState.start}
                    end={editState.end}
                    isPublic={editState.isPublic}
                    open={editState.editing}
                    onClose={() => {
                        setEditState({
                            id: undefined,
                            title: undefined,
                            description: undefined,
                            start: undefined,
                            end: undefined,
                            room: undefined,
                            isPublic: undefined,
                            editing: false,
                        });
                    }}
                    onSave={(
                        saveState: Partial<Meeting>,
                        isInsert: boolean,
                    ) => {
                        if (isInsert) {
                            organization.setOrg?.({
                                ...organization,
                                meetings: [...organization.meetings, saveState],
                            });
                        } else {
                            organization.setOrg?.({
                                ...organization,
                                meetings: [
                                    ...organization.meetings.filter(
                                        (m) => m.id !== saveState.id,
                                    ),
                                    saveState,
                                ],
                            });
                        }
                    }}
                />
            )}
        </Box>
    );
};

export default Meetings;
