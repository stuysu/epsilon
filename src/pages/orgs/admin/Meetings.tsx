import { useContext, useState } from "react";
import OrgContext from "../../../comps/context/OrgContext";
import AdminUpsertMeeting from "../../../comps/pages/orgs/admin/AdminUpsertMeeting";

import { Box, Typography, useMediaQuery } from "@mui/material";
import { supabase } from "../../../supabaseClient";
import { useSnackbar } from "notistack";
import OrgMeeting from "../../../comps/pages/orgs/OrgMeeting";

import { sortByDate } from "../../../utils/DataFormatters";
import AsyncButton from "../../../comps/ui/AsyncButton";

const Meetings = () => {
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
            <Typography variant="h1" align="center" width="100%">
                Manage Meetings
            </Typography>
            <Typography variant="h6" align="center" width="100%">
                Reminder: Meeting attendance records MUST be kept up to date on
                Sigma in order to secure club funding.
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    paddingLeft: "10px",
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
                            let { error } = await supabase.functions.invoke(
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
                                    meetings: organization.meetings.filter(
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
