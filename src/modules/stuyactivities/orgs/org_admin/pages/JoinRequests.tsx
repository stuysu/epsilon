import React, { useContext, useState } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";

import PendingMember from "../components/PendingMember";
import { Box } from "@mui/material";
import ItemList from "../../../../../components/ui/lists/ItemList";
import ContentUnavailable from "../../../../../components/ui/content/ContentUnavailable";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import UserDialog from "../../../../../components/ui/overlays/UserDialog";

const JoinRequests = () => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext<OrgContextType>(OrgContext);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [approving, setApproving] = useState(false);
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
        setApproving(true);

        // one at a time, approve-member checks if the club should be unlocked after every approval
        const approvedIds: number[] = [];
        for (const member of pendingMembers) {
            const { error } = await supabase.functions.invoke(
                "approve-member",
                { body: { member_id: member.membershipId } },
            );
            if (!error) approvedIds.push(member.membershipId as number);
        }

        if (approvedIds.length && organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: organization.memberships.map((m) =>
                    approvedIds.includes(m.id as number)
                        ? { ...m, active: true }
                        : m,
                ),
            });
        }

        if (approvedIds.length === pendingMembers.length) {
            enqueueSnackbar(`Approved ${approvedIds.length} members!`, {
                variant: "success",
            });
        } else if (approvedIds.length) {
            enqueueSnackbar(
                `Approved ${approvedIds.length} of ${pendingMembers.length} members. Contact it@stuysu.org if the rest keep failing.`,
                { variant: "warning" },
            );
        } else {
            enqueueSnackbar(
                "Error approving members. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        setApproving(false);
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
                    Review requests from students who want to join your
                    Activity. Approving a request adds them to your roster.
                </p>

                {pendingMembers?.length > 1 && (
                    <div className={"mt-6"}>
                        <AsyncButton
                            onClick={() => setConfirmOpen(true)}
                            disabled={approving}
                        >
                            <i className={"bx bx-check-double mr-2"}></i>
                            {approving
                                ? "Approving..."
                                : `Approve All (${pendingMembers.length})`}
                        </AsyncButton>
                    </div>
                )}
            </div>

            <UserDialog
                open={confirmOpen}
                title={`Approve all ${pendingMembers?.length} requests?`}
                description={
                    "Everyone waiting to join will be added to your roster and emailed that they were approved."
                }
                confirmText="Approve All"
                onConfirm={handleApproveAll}
                onClose={() => setConfirmOpen(false)}
            />

            {pendingMembers?.length > 0 ? (
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
            ) : (
                <ContentUnavailable
                    title="No Join Requests"
                    iconColor="text-red"
                    icon="bx-user-x"
                    description="When people request to join your Activity, you'll see them here."
                ></ContentUnavailable>
            )}
        </Box>
    );
};

export default JoinRequests;
