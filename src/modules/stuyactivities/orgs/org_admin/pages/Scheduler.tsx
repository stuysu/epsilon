import React, { useContext, useState } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import UserContext from "../../../../../contexts/UserContext";
import AdminUpsertMeeting from "../components/AdminUpsertMeeting";

import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import OrgMeeting from "../../components/OrgMeeting";

import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import ContentUnavailable from "../../../../../components/ui/content/ContentUnavailable";
import ItemList from "../../../../../components/ui/lists/ItemList";
import { MeetingRequirements } from "../../components/MeetingSideCards";
import MeetingSearch, {
    arrangeMeetings,
    MeetingFilter,
    MeetingSort,
} from "../../components/MeetingSearch";

const Scheduler = () => {
    const organization = useContext(OrgContext);
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<MeetingSort>("newest");
    const [filter, setFilter] = useState<MeetingFilter>("all");
    const rows = arrangeMeetings(organization.meetings, query, sort, filter);

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

    const renderMeeting = (meeting: Partial<Meeting>) => (
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
            advisor={meeting.advisor}
            onEdit={
                !user.admin &&
                meeting.end_time &&
                new Date(meeting.end_time) <= new Date()
                    ? undefined
                    : () =>
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
                          })
            }
            onDelete={async (silentDelete: boolean) => {
                const { error } = await supabase.functions.invoke(
                    "delete-meeting",
                    { body: { id: meeting.id, silent: silentDelete } },
                );

                if (error) {
                    return enqueueSnackbar(
                        "Error deleting meeting. Contact it@stuysu.org for support.",
                        { variant: "error" },
                    );
                }

                organization.setOrg?.({
                    ...organization,
                    meetings: organization.meetings.filter(
                        (m) => m.id !== meeting.id,
                    ),
                });

                enqueueSnackbar("Deleted Meeting!", { variant: "success" });
            }}
        />
    );

    return (
        <div className={"w-full flex flex-col"}>
            <header className={"mb-6 mt-2"}>
                <section
                    className={
                        "mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3"
                    }
                >
                    <h1>Scheduler</h1>
                    <AsyncButton
                        isPrimary
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
                    >
                        New Meeting
                    </AsyncButton>
                </section>
                <p>
                    Manage your meetings here. Meeting records must be kept up
                    to date in order to secure funding and avoid receiving
                    strikes.
                </p>
            </header>
            {organization.meetings.length === 0 ? (
                <ContentUnavailable
                    icon="bx-calendar"
                    iconColor="text-blue"
                    title="No Meetings Scheduled"
                    description="You have not scheduled any meetings yet. Use New Meeting to create one."
                />
            ) : (
                <>
                    <MeetingSearch
                        query={query}
                        onQueryChange={setQuery}
                        sort={sort}
                        onSortChange={setSort}
                        filter={filter}
                        onFilterChange={setFilter}
                    />
                    <ItemList height={"auto"}>
                        {rows.length === 0 && (
                            <p
                                className={
                                    "bg-layer-2 px-4 py-3 text-typography-2"
                                }
                            >
                                No meetings match your search.
                            </p>
                        )}
                        {rows.map(renderMeeting)}
                    </ItemList>
                </>
            )}
            <div className={"mt-8 xl:hidden"}>
                <MeetingRequirements />
            </div>

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
