import React, { useContext } from "react";
import OrgContext from "../../../../../contexts/OrgContext";

import PendingMember from "../components/PendingMember";
import { Box } from "@mui/material";
import ItemList from "../../../../../components/ui/lists/ItemList";

const JoinRequests = () => {
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
        <Box sx={{ width: "100%", minHeight: "70vh" }}>
            <div
                className={
                    "bg-layer-1 p-5 pl-7 pb-8 rounded-xl mb-10 mt-2 shadow-prominent"
                }
            >
                <h1>Join Requests</h1>
                <p>
                    When people request to join your Activity, you'll see them
                    here.
                </p>
            </div>

            {pendingMembers?.length > 0 && (
                <ItemList height={"auto"}>
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
                </ItemList>
            )}
        </Box>
    );
};

export default JoinRequests;
