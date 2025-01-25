import { Avatar, Box, Card, Divider, Typography } from "@mui/material";
import { supabase } from "../../supabaseClient";

import { useSnackbar } from "notistack";
import OrgChat from "./OrgChat";

import { useState } from "react";
import AsyncButton from "../ui/AsyncButton";

const OrgApproval = ({
    onBack,
    onDecision,
    ...org
}: {
    onBack: () => void;
    onDecision: () => void;
} & Partial<OrgContextType>) => {
    const { enqueueSnackbar } = useSnackbar();
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

    const approve = async () => {
        setButtonsDisabled(true);
        const { error } = await supabase.functions.invoke(
            "approve-organization",
            { body: { organization_id: org.id } },
        );

        if (error) {
            setButtonsDisabled(false);
            return enqueueSnackbar(
                "Error approving organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        enqueueSnackbar("Organization approved!", { variant: "success" });
        setButtonsDisabled(false);
        onDecision();
    };

    const reject = async () => {
        setButtonsDisabled(true);
        const { error } = await supabase.functions.invoke(
            "reject-organization",
            { body: { organization_id: org.id } },
        );
        if (error) {
            setButtonsDisabled(false);
            return enqueueSnackbar(
                "Error rejecting organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        enqueueSnackbar("Organization rejected!", { variant: "success" });
        setButtonsDisabled(false);
        onDecision();
    };

    return (
        <Box sx={{ padding: "30px", display: "flex", flexWrap: "wrap" }}>
            <Box sx={{ width: "100%", marginBottom: "20px" }}>
                <AsyncButton
                    variant="contained"
                    onClick={onBack}
                    sx={{ marginRight: "10px" }}
                >
                    Back
                </AsyncButton>
                <AsyncButton
                    variant="contained"
                    onClick={approve}
                    color="success"
                    sx={{ marginRight: "10px" }}
                    disabled={buttonsDisabled}
                >
                    Approve
                </AsyncButton>
                <AsyncButton
                    variant="contained"
                    onClick={reject}
                    color="secondary"
                    sx={{ marginRight: "10px" }}
                    disabled={buttonsDisabled}
                >
                    Reject
                </AsyncButton>
            </Box>
            <Card
                sx={{
                    width: "100%",
                    maxWidth: "1000px",
                    margin: "10px",
                    padding: "10px",
                }}
            >
                <Typography variant="h5" fontWeight={600}>
                    Club Name:
                </Typography>
                <Typography variant="body2">{org.name}</Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    URL:
                </Typography>
                <Typography variant="body2">{org.url}</Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Picture:
                </Typography>
                {org.picture ? (
                    <Avatar
                        src={org.picture}
                        alt={org.name}
                        sx={{ width: "150px", height: "150px" }}
                    />
                ) : (
                    "No picture provided"
                )}
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Origin Story:
                </Typography>
                <Typography variant="body2">{org.mission}</Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Goals:
                </Typography>
                <Typography variant="body2">{org.goals}</Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Club Description:
                </Typography>
                <Typography variant="body2">{org.purpose}</Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Appointment Procedures:
                </Typography>
                <Typography variant="body2">
                    {org.appointment_procedures}
                </Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Uniqueness:
                </Typography>
                <Typography variant="body2">{org.uniqueness}</Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Returning Info:
                </Typography>
                <Typography variant="body2">
                    {org.is_returning
                        ? org?.returning_info || "NO INFO SUBMITTED"
                        : "Claims to not be a returning club."}
                </Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Meeting Description:
                </Typography>
                <Typography variant="body2">
                    {org.meeting_description}
                </Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Meeting Schedule:
                </Typography>
                <Typography variant="body2">{org.meeting_schedule}</Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Meeting Days:
                </Typography>
                <Typography variant="body2">
                    {org.meeting_days?.join(", ")}
                </Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Commitment Level:
                </Typography>
                <Typography variant="body2">{org.commitment_level}</Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Keywords:
                </Typography>
                <Typography variant="body2">
                    {org.keywords || "none"}
                </Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Tags:
                </Typography>
                <Typography variant="body2">
                    {org.tags?.join(", ") || "none"}
                </Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Clubs/Pubs Fair Interest:
                </Typography>
                <Typography variant="body2">
                    {org.fair ? "YES" : "NO"}
                </Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Creator:
                </Typography>
                <Typography variant="body2">
                    {
                        org.memberships?.find((m) => m.role === "CREATOR")
                            ?.users?.email
                    }
                </Typography>
                <Divider sx={{ margin: "10px" }} />

                <Typography variant="h5" fontWeight={600}>
                    Faculty Advisor:
                </Typography>
                <Typography variant="body2">
                    {org?.faculty_email || "N/A"}
                </Typography>
                <Divider sx={{ margin: "10px" }} />
            </Card>
            <Box sx={{ maxWidth: "700px", width: "100%", margin: "10px" }}>
                <OrgChat organization_id={org.id as number} />
            </Box>
        </Box>
    );
};

export default OrgApproval;
