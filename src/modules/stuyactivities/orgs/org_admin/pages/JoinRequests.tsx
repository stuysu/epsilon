import React, { useContext } from "react";
import OrgContext from "../../../../../contexts/OrgContext";

import PendingMember from "../components/PendingMember";
import { Box, Stack } from "@mui/material";

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
                    "bg-layer-1 p-5 pl-7 pb-3 rounded-xl mb-10 mt-2 shadow-module"
                }
            >
                <h1>Join Requests</h1>
                <p>
                    When people request to join your Activity, you'll see them
                    here.
                </p>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                        marginTop: "20px",
                    }}
                ></Box>
            </div>

            {pendingMembers?.length > 0 && (
                <Box
                    height="100%"
                    bgcolor="#1f1f1f80"
                    padding={0.5}
                    borderRadius={3}
                    marginBottom={10}
                    marginTop={1}
                    boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                >
                    <Stack borderRadius={2} overflow="hidden" spacing={0.5}>
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
                    </Stack>
                </Box>
            )}
        </Box>
    );
};

export default JoinRequests;
