import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";
import { Divider, Stack, Typography } from "@mui/material";

const formatDays = (meeting_days: string[]) => {
    return meeting_days
        .map((m) => m.slice(0, 1).toUpperCase() + m.slice(1).toLowerCase())
        .join(", ");
};

const Charter = () => {
    const organization: OrgContextType = useContext(OrgContext);

    return (
        <Stack spacing={3}>
            <Typography variant="h1" align="center" width="100%">
                Charter
            </Typography>
            <Typography variant="h3" color="primary.main">
                What is this club?
            </Typography>
            <Typography>{organization.purpose || "None"}</Typography>
            <Divider></Divider>
            <Typography variant="h3" color="primary.main">
                What days does this organization meet?
            </Typography>
            <Typography>
                {formatDays(organization.meeting_days || []) || "None"}
            </Typography>
            <Divider></Divider>
            <Typography variant="h3" color="primary.main">
                What is the meeting schedule?
            </Typography>
            <Typography>{organization.meeting_schedule || "None"}</Typography>
            <Divider></Divider>
            <Typography variant="h3" color="primary.main">
                What would a typical meeting look like?
            </Typography>
            <Typography>
                {organization.meeting_description || "None"}
            </Typography>
            <Divider></Divider>
            <Typography variant="h3" color="primary.main">
                How does this activity appoint leaders?
            </Typography>
            <Typography>
                {organization.appointment_procedures || "None"}
            </Typography>
            <Divider></Divider>
            <Typography variant="h3" color="primary.main">
                What makes this activity unique?
            </Typography>
            <Typography>{organization.uniqueness || "None"}</Typography>
        </Stack>
    );
};

export default Charter;
