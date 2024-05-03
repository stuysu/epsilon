import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";

import { Box, Typography, useMediaQuery } from "@mui/material";
import OrgMember from "../../comps/pages/orgs/OrgMember";
import OrgMeeting from "../../comps/pages/orgs/OrgMeeting";

const Overview = () => {
    const organization: OrgContextType = useContext(OrgContext);

    const isMeetingMobile = useMediaQuery("(max-width: 1450px)");

    if (organization.id === -1) {
        return (
            <Box>
                <Typography>That organization doesn't exist!</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
            <Typography variant="h1" align="center" width="100%">
                Overview
            </Typography>
            <Typography variant="h3" color="primary.main" width="100%">
                Mission:
            </Typography>
            <Typography variant="body1" width="100%">
                {organization.mission || "None"}
            </Typography>
            <Typography variant="h3" color="primary.main" width="100%">
                Meeting Schedule:
            </Typography>
            <Typography variant="body1" width="100%">
                {organization.meeting_schedule || "None"}
            </Typography>
            <Box sx={{ width: "100%" }}>
                <Typography variant="h3" color="primary.main" width="100%">
                    Leaders
                </Typography>
                {organization.memberships?.map(
                    (member, i) =>
                        ["FACULTY", "ADMIN", "CREATOR"].includes(
                            member.role || "",
                        ) && (
                            <OrgMember
                                key={i}
                                role={member.role || "MEMBER"}
                                role_name={member.role_name}
                                email={member.users?.email || "no email"}
                                picture={member.users?.picture }
                                first_name={member.users?.first_name || "First"}
                                last_name={member.users?.last_name || "Last"}
                                is_faculty={member.users?.is_faculty || false}
                            />
                        ),
                )}
            </Box>
            <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                <Typography variant="h3" color="primary.main" width="100%">
                    Upcoming Meetings
                </Typography>
                {organization.meetings.map((meeting, i) => (
                    <OrgMeeting
                        id={meeting.id || -1}
                        title={meeting.title || "No Title"}
                        description={meeting.description || "No Description"}
                        start_time={meeting.start_time || ""}
                        end_time={meeting.end_time || ""}
                        is_public={meeting.is_public || false}
                        room_name={meeting.rooms?.name || "Virtual"}
                        org_name={organization.name || "No Org"}
                        org_picture={
                            organization.picture ||
                            "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
                        }
                        isMobile={isMeetingMobile}
                        onlyUpcoming
                    />
                ))}
            </Box>
        </Box>
    );
};

export default Overview;
