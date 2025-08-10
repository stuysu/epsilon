import { useContext } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import { Divider, Typography } from "@mui/material";

const formatDays = (meeting_days: string[]) => {
    return meeting_days
        .map((m) => m.slice(0, 1).toUpperCase() + m.slice(1).toLowerCase())
        .join(", ");
};

const Charter = () => {
    const organization: OrgContextType = useContext(OrgContext);

    return (
        <div
            className={
                "flex flex-col mt-2 gap-4 mb-10 max-sm:mt-10 max-sm:mx-4"
            }
        >
            <Typography variant="h3">What is this Activity?</Typography>
            <Typography>{organization.purpose || "None"}</Typography>
            <Divider></Divider>
            <Typography variant="h3">
                On what days does this Activity meet?
            </Typography>
            <Typography>
                {formatDays(organization.meeting_days || []) || "None"}
            </Typography>
            <Divider></Divider>
            <Typography variant="h3">What is the meeting schedule?</Typography>
            <Typography>{organization.meeting_schedule || "None"}</Typography>
            <Divider></Divider>
            <Typography variant="h3">
                What does a typical meeting look like?
            </Typography>
            <Typography>
                {organization.meeting_description || "None"}
            </Typography>
            <Divider></Divider>
            <Typography variant="h3">
                How does this Activity appoint leaders?
            </Typography>
            <Typography>
                {organization.appointment_procedures || "None"}
            </Typography>
            <Divider></Divider>
            <Typography variant="h3">
                What makes this Activity unique?
            </Typography>
            <Typography>{organization.uniqueness || "None"}</Typography>
        </div>
    );
};

export default Charter;
