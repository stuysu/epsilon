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

    const advisorNeededRooms = ["503", "505", "507"];
    const advisorNeededLowestFloor = 7;
    const [advisorNeeded, setAdvisorNeeded] = useState<boolean>(false);

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

    useEffect(() => {
        const checkAdvisorNeeded = async () => {
            if(!editState.room) return;

            const { data, error } = await supabase
                .from("rooms")
                .select("id, name, floor")
                .eq("id", editState.room)
                .single();

            if (error || !data) {
                return enqueueSnackbar("Error checking room floor.", { variant: "error" });
            }

            console.log(data);

            const roomName = data.name?.toString();
            const roomFloor = data.floor;

            const needsAdvisorPrompt =
                roomFloor >= advisorNeededLowestFloor || advisorNeededRooms.includes(roomName);

            needsAdvisorPrompt ? setAdvisorNeeded(true) : setAdvisorNeeded(false);
        };

        checkAdvisorNeeded();
    }, [editState]);

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
            <div
                className={
                    "w-full bg-layer-1 p-5 pl-7 pb-8 rounded-xl mb-10 mt-2 shadow-prominent"
                }
            >
                <h1>Activity Meetings Scheduler</h1>
                <p className={"mb-4"}>
                    Meeting records must be kept up to date on Epsilon in order
                    to secure funding and avoid receiving strikes.
                </p>
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
            </div>

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
        </div>
    );
};

export default Scheduler;
