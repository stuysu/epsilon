import { Box, Button } from "@mui/material";
import { supabase } from "../../supabaseClient";

import { useSnackbar } from "notistack";

const OrgApproval = ({
    onBack,
    onDecision,
    ...org
}: {
    onBack: () => void;
    onDecision: () => void;
} & Partial<OrgContextType>) => {
    const { enqueueSnackbar } = useSnackbar();

    const approve = async () => {
        const { error } = await supabase.functions.invoke(
            "approve-organization",
            { body: { organization_id: org.id }}
        )

        if (error) {
            return enqueueSnackbar(
                "Error approving organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        enqueueSnackbar("Organization approved!", { variant: "success" });
        onDecision();
    };

    const reject = async () => {
        const { error } = await supabase.functions.invoke(
            "reject-organization",
            { body: { organization_id: org.id }}
        )
        if (error) {
            return enqueueSnackbar(
                "Error rejecting organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        enqueueSnackbar("Organization rejected!", { variant: "success" });
        onDecision();
    };

    return (
        <Box>
            <Button variant="contained" onClick={onBack}>
                Back
            </Button>
            <Button variant="contained" onClick={approve}>
                Approve
            </Button>
            <Button variant="contained" onClick={reject}>
                Reject
            </Button>
            <p>name: {org.name}</p>
            <p>url: {org.url}</p>
            <p>picture: {org.picture}</p>
            <p>mission: {org.mission}</p>
            <p>purpose: {org.purpose}</p>
            <p>benefit: {org.benefit}</p>
            <p>appointment procedures: {org.appointment_procedures}</p>
            <p>uniqueness: {org.uniqueness}</p>
            <p>meeting schedule: {org.meeting_schedule}</p>
            <p>meeting days: {org.meeting_days}</p>
            <p>commitment_level: {org.commitment_level}</p>
            <p>
                creator:{" "}
                {
                    org.memberships?.find((m) => m.role === "CREATOR")?.users
                        ?.email
                }
            </p>
        </Box>
    );
};

export default OrgApproval;
