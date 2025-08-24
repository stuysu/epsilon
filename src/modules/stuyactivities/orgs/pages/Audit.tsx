import React, { useContext } from "react";
import OrgContext from "../../../../contexts/OrgContext";

import OrgMeeting from "../components/OrgMeeting";
import { sortByDate } from "../../../../utils/DataFormatters";
import LoginGate from "../../../../components/ui/content/LoginGate";
import OrgInspector from "../components/OrgInspector";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";
import ItemList from "../../../../components/ui/lists/ItemList";

const Audit = () => {
    const organization: OrgContextType = useContext(OrgContext);

    return (
        <LoginGate page="audit this activity">
            <section className={"mt-2"}>
                <div className={"xl:hidden mb-10 w-full"}>
                    <OrgInspector />
                </div>
                {organization.meetings.length > 0 ? (
                    <ItemList
                        height={"auto"}
                        title={"Audit Meeting Records"}
                        icon={"bx-calendar"}
                    >
                        {organization.meetings
                            .sort(sortByDate)
                            .map((meeting) => (
                                <OrgMeeting
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
                                />
                            ))}
                    </ItemList>
                ) : (
                    <ContentUnavailable
                        icon="bx-calendar-x"
                        iconColor="text-yellow"
                        title="No Meetings Records"
                        description="This Activity has not yet held any meetings. Meeting records will be displayed here when they become available."
                    />
                )}
            </section>
        </LoginGate>
    );
};

export default Audit;
