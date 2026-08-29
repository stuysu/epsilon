import { useContext, useMemo, useState } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import AdminUpsertMeeting from "../components/AdminUpsertMeeting";

import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import OrgMeeting from "../../components/OrgMeeting";

import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import ContentUnavailable from "../../../../../components/ui/content/ContentUnavailable";
import SearchInput from "../../../../../components/ui/input/SearchInput";
import ItemList from "../../../../../components/ui/lists/ItemList";

const Scheduler = () => {
    const organization = useContext(OrgContext);
    const { enqueueSnackbar } = useSnackbar();
    const [search, setSearch] = useState("");
    const [ascending, setAscending] = useState(false);

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

    const visibleMeetings = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        const filtered = normalizedSearch
            ? organization.meetings.filter((meeting) =>
                  [meeting.title, meeting.description, meeting.rooms?.name]
                      .filter(Boolean)
                      .join(" ")
                      .toLowerCase()
                      .includes(normalizedSearch),
              )
            : organization.meetings;

        return [...filtered].sort((first, second) => {
            const difference =
                new Date(first.start_time || 0).getTime() -
                new Date(second.start_time || 0).getTime();
            return ascending ? difference : -difference;
        });
    }, [ascending, organization.meetings, search]);

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
        <section className="mt-2 min-h-[70vh] w-full">
            <header className="mb-8">
                <div className="flex flex-wrap items-center justify-between gap-5">
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
                </div>
                <p className="mt-4">
                    Manage your meetings here. Meeting records must be kept up
                    to date in order to secure funding and avoid receiving
                    strikes.
                </p>
            </header>

            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search meetings by name"
                icon="bx bx-search-alt-2 bx-sm"
                trailing={
                    <button
                        type="button"
                        onClick={() => setAscending((current) => !current)}
                        className={`absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md hover:bg-layer-3 ${
                            ascending ? "text-accent bg-layer-3" : ""
                        }`}
                        aria-label={
                            ascending
                                ? "Sort meetings newest first"
                                : "Sort meetings oldest first"
                        }
                        title={ascending ? "Oldest first" : "Newest first"}
                    >
                        <i
                            className="bx bx-sort-alt-2 bx-sm"
                            aria-hidden="true"
                        />
                    </button>
                }
            />

            {organization.meetings.length === 0 ? (
                <ContentUnavailable
                    icon="bx-calendar-x"
                    iconColor="text-yellow"
                    title="No Meetings"
                    description="Create a meeting to begin building this Activity’s schedule."
                />
            ) : (
                <ItemList height="auto">
                    {visibleMeetings.length > 0 ? (
                        visibleMeetings.map((meeting) => (
                            <OrgMeeting
                                variant="scheduler"
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
                                    const { error } =
                                        await supabase.functions.invoke(
                                            "delete-meeting",
                                            { body: { id: meeting.id } },
                                        );

                                    if (error) {
                                        enqueueSnackbar(
                                            "Error deleting meeting. Contact it@stuysu.org for support.",
                                            { variant: "error" },
                                        );
                                        return;
                                    }

                                    organization.setOrg?.({
                                        ...organization,
                                        meetings: organization.meetings.filter(
                                            (candidate) =>
                                                candidate.id !== meeting.id,
                                        ),
                                    });
                                    enqueueSnackbar("Deleted Meeting!", {
                                        variant: "success",
                                    });
                                }}
                            />
                        ))
                    ) : (
                        <p className="bg-layer-2 px-5 py-4">
                            No meetings match this search.
                        </p>
                    )}
                </ItemList>
            )}

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
        </section>
    );
};

export default Scheduler;
