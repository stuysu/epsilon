import { useContext, useState } from "react";
import OrgContext from "../../../../contexts/OrgContext";

import OrgMeeting from "../components/OrgMeeting";
import LoginGate from "../../../../components/ui/content/LoginGate";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";
import ItemList from "../../../../components/ui/lists/ItemList";
import MeetingSearch, {
    arrangeMeetings,
    MeetingFilter,
    MeetingSort,
} from "../components/MeetingSearch";

const Meetings = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<MeetingSort>("soonest");
    const [filter, setFilter] = useState<MeetingFilter>("all");
    const now = new Date();
    const upcoming = (organization.meetings || []).filter(
        (meeting) => meeting.end_time && new Date(meeting.end_time) > now,
    );
    const shown = arrangeMeetings(upcoming, query, sort, filter);

    return (
        <LoginGate page="view meetings">
            <h1 className={"sr-only"}>Meetings</h1>
            <div className={"mt-2"}>
                {upcoming.length > 0 ? (
                    <>
                        <MeetingSearch
                            query={query}
                            onQueryChange={setQuery}
                            sort={sort}
                            onSortChange={setSort}
                            filter={filter}
                            onFilterChange={setFilter}
                        />
                        <ItemList
                            height={"auto"}
                            title={"Upcoming Meetings"}
                            icon={""}
                        >
                            {shown.length ? (
                                shown.map((meeting) => (
                                    <OrgMeeting
                                        key={meeting.id}
                                        id={meeting.id}
                                        title={meeting.title}
                                        description={meeting.description}
                                        start_time={meeting.start_time}
                                        end_time={meeting.end_time}
                                        is_public={meeting.is_public}
                                        room_name={meeting.rooms?.name}
                                        advisor={meeting.advisor}
                                        org_name={organization.name}
                                        org_picture={
                                            organization.picture || undefined
                                        }
                                    />
                                ))
                            ) : (
                                <p
                                    className={
                                        "bg-layer-2 px-4 py-3 text-typography-2"
                                    }
                                >
                                    No meetings match your search.
                                </p>
                            )}
                        </ItemList>
                    </>
                ) : (
                    <ContentUnavailable
                        icon="bx-calendar-x"
                        iconColor="text-blue"
                        title="No Meetings Scheduled"
                        description="This Activity has not yet scheduled any meetings for the future."
                    />
                )}
            </div>
        </LoginGate>
    );
};

export default Meetings;
