import { useContext } from "react";
import UserContext from "../../../context/UserContext";

import { supabase } from "../../../../supabaseClient";
import { Button } from "@mui/material";

const PendingMember = (
    { id, name, email, picture } : 
    { id: number, name: string, email: string, picture: string | undefined }
) => {
    const user = useContext(UserContext);

    const handleApprove = async () => {
        const { error } = await supabase
            .from('memberships')
            .update({ active: true })
            .eq('id', id)
        
        if (error) {
            user.setMessage("Error approving member. Contact it@stuysu.org for support.")
            return;
        }

        user.setMessage("Member approved!")
    }

    const handleReject = async () => {
        const { error } = await supabase
            .from('memberships')
            .delete()
            .eq('id', id)
        if (error) {
            user.setMessage("Error rejecting member. Contact it@stuysu.org for support.")
            return;
        }

        user.setMessage("User rejected!")
    }

    return (
        <div>
            <p>{name} - {email}</p>
            <Button onClick={handleApprove}>Approve</Button>
            <Button onClick={handleReject}>Reject</Button>
        </div>
    )
}

export default PendingMember;