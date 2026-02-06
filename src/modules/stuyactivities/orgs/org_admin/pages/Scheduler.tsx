import React, { useContext, useEffect, useState } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import AdminUpsertMeeting from "../components/AdminUpsertMeeting";

import { useMediaQuery } from "@mui/material";
import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import OrgMeeting from "../../components/OrgMeeting";

import { sortByDate } from "../../../../../utils/DataFormatters";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import ContentUnavailable from "../../../../../components/ui/content/ContentUnavailable";
import ItemList from "../../../../../components/ui/lists/ItemList";

const Scheduler = () => {
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
        advisor: string | undefined;
        editing: boolean;
    }>({
        id: undefined,
        title: undefined,
        description: undefined,
        start: undefined,
        end: undefined,
        room: undefined,
        isPublic: undefined,
        advisor: undefined,
        editing: false,
    });

    if (
        organization.state === "LOCKED" ||
        organization.state === "PENDING" ||
        organization.state === "PUNISHED"
    )
        return (
            <ContentUnavailable
                icon="bx-no-entry"
                iconColor="text-red"
                title="Cannot Schedule Meetings"
                description="This Activity does not yet meet the requirements to hold meetings."
            />
        );

    return (
        <div className={"w-full flex flex-col"}>
            <header className={"mb-6 mt-2"}>
                <section className={"flex justify-between mb-2"}>
                    <h1>Scheduler</h1>
                    <div>
                        <AsyncButton
                            isPrimary={true}
                            onClick={() =>
                                setEditState({
                                    id: undefined,
                                    title: undefined,
                                    description: undefined,
                                    start: undefined,
                                    end: undefined,
                                    room: undefined,
                                    isPublic: undefined,
                                    advisor: undefined,
                                    editing: true,
                                })
                            }
                            variant="contained"
                        >
                            New Meeting
                        </AsyncButton>
                    </div>
                </section>
                <p>
                    Manage your meetings here. Meeting records must be kept up
                    to date in order to secure funding and avoid receiving
                    strikes.
                </p>
            </header>

            <ItemList height={"auto"}>
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
                            advisor={meeting.advisor}
                            onEdit={() => {
                                setEditState({
                                    id: meeting.id,
                                    title: meeting.title,
                                    description: meeting.description,
                                    start: meeting.start_time,
                                    end: meeting.end_time,
                                    room: meeting.rooms?.id,
                                    isPublic: meeting.is_public,
                                    advisor: meeting.advisor,
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
            </ItemList>

            {editState.editing && (
                <AdminUpsertMeeting
                    id={editState.id}
                    title={editState.title}
                    description={editState.description}
                    room_id={editState.room}
                    start={editState.start}
                    end={editState.end}
                    isPublic={editState.isPublic}
                    advisor={editState.advisor}
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
                            advisor: undefined,
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
        </div>
    );
};

export default Scheduler;
