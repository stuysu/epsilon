import React, { useContext } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import { useMediaQuery } from "@mui/material";

import OrgMeeting from "../components/OrgMeeting";
import { sortByDate } from "../../../../utils/DataFormatters";
import LoginGate from "../../../../components/ui/content/LoginGate";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";
import ItemList from "../../../../components/ui/lists/ItemList";

const Meetings = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const isMobile = useMediaQuery("(max-width: 1450px)");
    const now = new Date();
    const upcomingMeetings = (organization.meetings || []).filter(
        (meeting) => meeting.end_time && new Date(meeting.end_time) > now,
    );
    const hasUpcomingMeetings = upcomingMeetings.length > 0;

    return (
        <LoginGate page="view meetings">
            {hasUpcomingMeetings ? (
                <div className={"mt-2"}>
                    <ItemList
                        height={"auto"}
                        title={"Upcoming Meetings"}
                        icon={"bx-calendar"}
                    >
                        {upcomingMeetings.sort(sortByDate).map((meeting) => (
                            <OrgMeeting
                                key={meeting.id}
                                id={meeting.id || -1}
                                title={meeting.title || "No Title"}
                                description={
                                    meeting.description || "No Description"
                                }
                                start_time={meeting.start_time || ""}
                                end_time={meeting.end_time || ""}
                                is_public={meeting.is_public || false}
                                room_name={meeting.rooms?.name || "Virtual"}
                                org_name={organization.name || "No Org"}
                                org_picture={
                                    organization.picture ||
                                    "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
                                }
                                isMobile={isMobile}
                                onlyUpcoming
                            />
                        ))}
                    </ItemList>
                </div>
            ) : (
                <ContentUnavailable
                    icon="bx-calendar-x"
                    iconColor="text-blue"
                    title="No Meetings Scheduled"
                    description="This Activity has not yet scheduled any meetings for the future. To view past meetings, visit the audit page."
                />
            )}
        </LoginGate>
    );
};

export default Meetings;
