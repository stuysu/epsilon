import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";

import { Box, Typography, useMediaQuery } from "@mui/material";
import OrgMember from "../../comps/pages/orgs/OrgMember";
import OrgMeeting from "../../comps/pages/orgs/OrgMeeting";
import { sortByDate, sortByRole } from "../../utils/DataFormatters";

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
                Description:
            </Typography>
            <Typography variant="body1" width="100%">
                {organization.purpose || "None"}
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
                {organization.memberships
                    ?.sort(sortByRole)
                    .map(
                        (member, i) =>
                            ["FACULTY", "ADMIN", "CREATOR"].includes(
                                member.role || "",
                            ) &&
                            member.active && (
                                <OrgMember
                                    key={i}
                                    role={member.role || "MEMBER"}
                                    role_name={member.role_name}
                                    email={member.users?.email || "no email"}
                                    picture={member.users?.picture}
                                    first_name={
                                        member.users?.first_name || "First"
                                    }
                                    last_name={
                                        member.users?.last_name || "Last"
                                    }
                                    is_faculty={
                                        member.users?.is_faculty || false
                                    }
                                />
                            ),
                    )}
            </Box>
            <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                <Typography variant="h3" color="primary.main" width="100%">
                    Upcoming Meetings
                </Typography>
                {organization.meetings.sort(sortByDate).map((meeting) => (
                    <OrgMeeting
                        key={meeting.id}
                        id={meeting.id}
                        title={meeting.title}
                        description={meeting.description}
                        start_time={meeting.start_time}
                        end_time={meeting.end_time}
                        is_public={meeting.is_public}
                        room_name={meeting.rooms?.name}
                        org_name={organization.name}
                        org_picture={organization.picture || ""}
                        isMobile={isMeetingMobile}
                        onlyUpcoming
                    />
                ))}
            </Box>
        </Box>
    );
};

export default Overview;
