import { useContext } from "react";
import UserContext from "../../../comps/context/UserContext";
import OrgContext from "../../../comps/context/OrgContext";
import AdminMeeting from "../../../comps/pages/orgs/admin/AdminMeeting";

const Meetings = () => {
    const organization = useContext<OrgContextType>(OrgContext)
    console.log(organization.meetings)
    return (
        <div>
            <h1>Meetings</h1>
            { 
            organization.meetings.map(
                meeting => (
                    <AdminMeeting 
                        title={meeting.title || ""} 
                        description={meeting.description || ""} 
                        start={meeting.start_time || ""}
                        end={meeting.end_time || ""}
                        room={meeting.rooms?.name}
                    />
                )
            )
            }
        </div>
    )
}

export default Meetings;