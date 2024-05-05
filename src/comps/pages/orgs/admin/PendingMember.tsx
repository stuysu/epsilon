import { supabase } from "../../../../supabaseClient";
import { Box, Button } from "@mui/material";
import { useSnackbar } from "notistack";
import { useContext } from "react";
import OrgContext from "../../../context/OrgContext";
import OrgMember from "../OrgMember";

const PendingMember = ({
    id,
    first_name,
    last_name,
    email,
    picture,
}: {
    id: number;
    first_name?: string;
    last_name?: string;
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
        <Box sx={{ width: '100%', display: 'flex', flexWrap: 'nowrap', alignItems: 'center' }}>
            <Box sx={{ width: '100%' }}>
                <OrgMember
                    email={email}
                    picture={picture}
                    first_name={first_name}
                    last_name={last_name}
                />
            </Box>
            <Box sx={{ width: '200px', display: 'flex', flexWrap: 'nowrap' }}>
                <Button onClick={handleApprove} variant='contained' sx={{ height: '40px' }}>Approve</Button>
                <Button onClick={handleReject} variant='contained' sx={{ height: '40px', marginLeft: '10px'}}>Reject</Button>
            </Box>
            
        </Box>
    );
};

export default PendingMember;
