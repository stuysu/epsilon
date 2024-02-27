import { Box, Button } from "@mui/material";
import { supabase } from "../../supabaseClient";
import UserContext from "../context/UserContext";
import { useContext } from "react";

const OrgInfo = ({ onBack, ...org}: { onBack: () => void } & Partial<OrgContextType>) => {
    const user = useContext(UserContext);

    const approve = async () => {
        const { error } = await supabase
            .from("organizations")
            .update({ state: "UNLOCKED" })
            .eq("id", org.id)
        if (error) {
            return user.setMessage("Error approving organization. Contact it@stuysu.org for support.")
        }

        user.setMessage("Organization approved!")
    }

    return (
        <Box>
            <Button variant="contained" onClick={onBack}>Back</Button>
            <Button variant="contained" onClick={approve}>Approve</Button>
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
            <p>creator: {org.memberships?.find(m => m.role === 'CREATOR')?.users?.email}</p>
        </Box>
    )
}

export default OrgInfo;