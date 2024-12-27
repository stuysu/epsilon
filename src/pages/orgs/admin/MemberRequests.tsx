import { useContext } from "react";
import OrgContext from "../../../comps/context/OrgContext";

import PendingMember from "../../../comps/pages/orgs/admin/PendingMember";
import { Box, Typography } from "@mui/material";

const MemberRequests = () => {
    const organization = useContext<OrgContextType>(OrgContext);
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

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h1" align="center" width="100%">
                Member Requests
            </Typography>
            {pendingMembers?.map((member, i) => (
                <PendingMember
                    id={member.membershipId || -1}
                    first_name={member.first_name}
                    last_name={member.last_name}
                    email={member.email || "Undefined"}
                    picture={member.picture}
                    key={i}
                />
            ))}
        </Box>
    );
};

export default MemberRequests;
