import { supabase } from "../../../../supabaseClient";
import { Button } from "@mui/material";
import { useSnackbar } from "notistack";
import { useContext } from "react";
import OrgContext from "../../../context/OrgContext";

const PendingMember = ({
    id,
    name,
    email,
    picture,
}: {
    id: number;
    name: string;
    email: string;
    picture: string | undefined;
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext(OrgContext);

    const handleApprove = async () => {
        const { error } = await supabase
            .from("memberships")
            .update({ active: true })
            .eq("id", id);

        if (error) {
            enqueueSnackbar(
                "Error approving member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        let memberIndex = organization.memberships.findIndex(m => m.id === id);
        let memberData = organization.memberships[memberIndex];

        memberData.active = true;

        // update context
        if (organization.setOrg) {
            organization.setOrg(
                {
                    ...organization,
                    memberships: [
                        ...organization.memberships.slice(0, memberIndex),
                        memberData,
                        ...organization.memberships.slice(memberIndex+1)
                    ]
                }
            )
        }

        enqueueSnackbar("Member approved!", { variant: "success" });
    };

    const handleReject = async () => {
        const { error } = await supabase
            .from("memberships")
            .delete()
            .eq("id", id);
        if (error) {
            enqueueSnackbar(
                "Error rejecting member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        // update context
        if (organization.setOrg) {
            organization.setOrg(
                {
                    ...organization,
                    memberships: organization.memberships.filter(m => m.id !== id)
                }
            )
        }

        enqueueSnackbar("User rejected!", { variant: "success" });
    };

    return (
        <div>
            <p>
                {name} - {email}
            </p>
            <Button onClick={handleApprove}>Approve</Button>
            <Button onClick={handleReject}>Reject</Button>
        </div>
    );
};

export default PendingMember;
