import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";
import * as Dialog from "@radix-ui/react-dialog";

import {
    Avatar,
    Box,
    Typography,
    useMediaQuery,
    Stack,
    Chip,
    Divider,
} from "@mui/material";
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
            <Stack direction="row" spacing={5}>
                <Avatar
                    src={organization.picture || ""}
                    sx={{
                        width: "250px",
                        height: "250px",
                        borderRadius: "25px",
                        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                        fontSize: "100px",
                        objectFit: "cover",
                    }}
                    alt={`organization ${organization.name}`}
                >
                    {organization.name.charAt(0).toUpperCase()}
                </Avatar>

                <Stack>
                    <Typography variant="h1" width="100%">
                        {organization.name}
                    </Typography>

                    <Stack
                        direction="row"
                        maxWidth={150}
                        spacing={1}
                        paddingBottom={3}
                    >
                        {organization.tags?.map((tag, index) => (
                            <Chip key={index} label={tag} variant="filled" />
                        )) || <p>Uncategorized</p>}
                    </Stack>

                    <Typography
                        variant="body1"
                        width="100%"
                        sx={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            WebkitLineClamp: 5,
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {organization.purpose || "None"}
                    </Typography>

                </Stack>
            </Stack>

            <Divider sx={{ background: "#7d7d7d", opacity:"30%", width: "100%", marginTop: "20px"}} />

            <Box
                bgcolor="#1f1f1f80"
                padding={0.5}
                borderRadius={3}
                boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
            >
                <Typography variant="h3" width="100%" margin={3}>
                    Meeting Schedule
                </Typography>

                <Box borderRadius={2} overflow="hidden">
                    <Box bgcolor="#36363666" padding={3}>
                        <Typography variant="body1" width="100%">
                            {organization.meeting_schedule || "None"}
                        </Typography>
                    </Box>

                    <Stack marginTop={0.5} direction="row" spacing={0.5}>
                        {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                        ].map((day) => (
                            <Typography
                                flexGrow="1"
                                key={day}
                                textAlign="center"
                                sx={{
                                    fontVariationSettings: "'wght' 700",
                                    padding: "0.5rem",
                                    backgroundColor:
                                        organization.meeting_days?.includes(
                                            day.toUpperCase(),
                                        )
                                            ? "#2D6AE2CC"
                                            : "#36363666",
                                    color: organization.meeting_days?.includes(
                                        day.toUpperCase(),
                                    )
                                        ? "#E8E8E8CC"
                                        : "inherit",
                                }}
                            >
                                {day}
                            </Typography>
                        ))}
                    </Stack>
                </Box>
            </Box>

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
