import React, { useContext } from "react";
import OrgContext from "../../../../../contexts/OrgContext";

import PendingMember from "../components/PendingMember";
import { Box } from "@mui/material";
import ItemList from "../../../../../components/ui/lists/ItemList";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import { supabase } from "../../../../../lib/supabaseClient";
import { enqueueSnackbar } from "notistack";

export const handleApprove = async (id: number, organization: OrgContextType, single: boolean) => {
        const { error } = await supabase.functions.invoke("approve-member", {
            body: { member_id: id },
        });

        if (error) {
            enqueueSnackbar(
                "Error approving member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        let memberIndex = organization.memberships.findIndex(
            (m) => m.id === id,
        );
        let memberData = organization.memberships[memberIndex];

        memberData.active = true;

        if (organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: [
                    ...organization.memberships.slice(0, memberIndex),
                    memberData,
                    ...organization.memberships.slice(memberIndex + 1),
                ],
            });
        }
        if (single) enqueueSnackbar("Member approved!", { variant: "success" });
};

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

    const handleApproveAll = async () => {
        let membersApproved = 0;
        pendingMembers.forEach(async (member) => {
            handleApprove(member.membershipId!, organization, false);
            membersApproved++;
        });

        enqueueSnackbar(`Approved ${membersApproved} members`, { variant: "success" });
    };
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
                <br />
                <AsyncButton variant="contained" onClick={handleApproveAll} className="rounded-md border-b-2 border-black">Approve All</AsyncButton>
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
                            approveFunc={(() => {handleApprove(member.membershipId!, organization, true)})}
                        />
                    ))}
                </ItemList>
            )}
        </Box>
    );
};

export default JoinRequests;
