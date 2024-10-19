import { useContext, useState } from "react";
import OrgContext from "../../../comps/context/OrgContext";

import PendingMember from "../../../comps/pages/orgs/admin/PendingMember";
import { Box, Typography } from "@mui/material";
import AsyncButton from "../../../comps/ui/AsyncButton";

const MemberRequests = () => {
    const organization = useContext<OrgContextType>(OrgContext);
    const [autoApprove, setAutoApprove] = useState(false);
    
    const pendingMembers = organization.memberships
        ?.filter((member) => !member.active)
        .map((member) => {
            return {
                first_name: member.users?.first_name,
                last_name: member.users?.last_name,
                email: member.users?.email,
                membershipId: member.id,
                picture: member.users?.picture,
            };
        });
    
    const handleApproveAll = () => {
        setAutoApprove(true);
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h1" align="center" width="100%">
                Member Requests
            </Typography>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "1em", marginTop: "1em" }}>
                <AsyncButton
                    onClick={handleApproveAll}
                    variant="contained"
                    sx={{ height: "40px"}}
                >
                    Approve ALL
                </AsyncButton>
            </Box>

            {pendingMembers?.map((member, i) => (
                <PendingMember
                    id={member.membershipId || -1}
                    first_name={member.first_name}
                    last_name={member.last_name}
                    email={member.email || "Undefined"}
                    picture={member.picture}
                    key={i}
                    auto={autoApprove}
                />
            ))}
        </Box>
    );
};

export default MemberRequests;
