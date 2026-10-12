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
import CheckboxInput from "../../../../../components/ui/input/CheckboxInput";
import { PUBLIC_URL } from "../../../../../config/constants";

const JoinRequests = () => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext<OrgContextType>(OrgContext);

    // which bulk action is waiting for confirmation / currently running
    const [confirmAction, setConfirmAction] = useState<
        "approve" | "reject" | null
    >(null);
    const [working, setWorking] = useState<"approve" | "reject" | null>(null);
    // everyone is selected by default, so only the ones taken out are tracked
    const [unselectedIds, setUnselectedIds] = useState<number[]>([]);
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

    const selectedMembers = pendingMembers?.filter(
        (member) => !unselectedIds.includes(member.membershipId as number),
    );
    const allSelected = selectedMembers?.length === pendingMembers?.length;

    const toggleSelectAll = (selectAll: boolean) => {
        setUnselectedIds(
            selectAll
                ? []
                : pendingMembers.map((member) => member.membershipId as number),
        );
    };

    const toggleMember = (id: number, selected: boolean) => {
        setUnselectedIds((ids) =>
            selected ? ids.filter((i) => i !== id) : [...ids, id],
        );
    };

    const handleApproveSelected = async () => {
        setWorking("approve");

        // one at a time, approve-member checks if the club should be unlocked after every approval
        const approvedIds: number[] = [];
        for (const member of selectedMembers) {
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

        if (approvedIds.length === selectedMembers.length) {
            enqueueSnackbar(`Approved ${approvedIds.length} members!`, {
                variant: "success",
            });
        } else if (approvedIds.length) {
            enqueueSnackbar(
                `Approved ${approvedIds.length} of ${selectedMembers.length} members. Contact it@stuysu.org if the rest keep failing.`,
                { variant: "warning" },
            );
        } else {
            enqueueSnackbar(
                "Error approving members. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        setWorking(null);
    };

    const handleRejectSelected = async () => {
        setWorking("reject");

        const ids = selectedMembers.map((member) => member.membershipId);
        // RLS only returns the rows that were actually deleted
        const { data, error } = await supabase
            .from("memberships")
            .delete()
            .in("id", ids)
            .select("id");

        const rejectedIds = error ? [] : (data ?? []).map((row) => row.id);

        if (rejectedIds.length && organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: organization.memberships.filter(
                    (m) => !rejectedIds.includes(m.id as number),
                ),
            });
        }

        if (rejectedIds.length === selectedMembers.length) {
            enqueueSnackbar(`Rejected ${rejectedIds.length} requests.`, {
                variant: "success",
            });
        } else if (rejectedIds.length) {
            enqueueSnackbar(
                `Rejected ${rejectedIds.length} of ${selectedMembers.length} requests. Contact it@stuysu.org if the rest keep failing.`,
                { variant: "warning" },
            );
        } else {
            enqueueSnackbar(
                "Error rejecting requests. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        setWorking(null);
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
            </div>

            <UserDialog
                open={confirmAction !== null}
                imageSrc={
                    confirmAction === "reject"
                        ? `${PUBLIC_URL}/symbols/warning.png`
                        : undefined
                }
                title={`${confirmAction === "reject" ? "Reject" : "Approve"} ${
                    selectedMembers?.length
                } ${selectedMembers?.length === 1 ? "request" : "requests"}?`}
                description={`${
                    confirmAction === "reject"
                        ? "Everyone selected will be removed from your join requests. They can request to join again."
                        : "Everyone selected will be added to your roster and emailed that they were approved."
                }${
                    allSelected
                        ? ""
                        : ` The ${unselectedIds.length} you left out will stay pending.`
                }`}
                confirmText={confirmAction === "reject" ? "Reject" : "Approve"}
                onConfirm={
                    confirmAction === "reject"
                        ? handleRejectSelected
                        : handleApproveSelected
                }
                onClose={() => setConfirmAction(null)}
            />

            {pendingMembers?.length > 0 ? (
                <ItemList height={"auto"}>
                    {pendingMembers.length > 1 && (
                        <div
                            className={
                                "flex flex-wrap items-center gap-3 bg-layer-2 pl-3 pr-3 py-3"
                            }
                        >
                            <CheckboxInput
                                checked={
                                    allSelected
                                        ? true
                                        : selectedMembers.length
                                          ? "indeterminate"
                                          : false
                                }
                                onChange={toggleSelectAll}
                                label="Select all requests"
                                disabled={working !== null}
                            />
                            <span
                                className={
                                    "font-medium text-typography-1 grow min-w-0"
                                }
                            >
                                {allSelected
                                    ? `All ${pendingMembers.length} selected`
                                    : `${selectedMembers.length} of ${pendingMembers.length} selected`}
                            </span>
                            <div className={"flex gap-2 w-full sm:w-auto"}>
                                <AsyncButton
                                    onClick={() => setConfirmAction("approve")}
                                    disabled={
                                        working !== null ||
                                        !selectedMembers.length
                                    }
                                    sx={{
                                        height: "40px",
                                        flexGrow: { xs: 1, sm: 0 },
                                    }}
                                >
                                    {working === "approve"
                                        ? "Approving..."
                                        : `Approve (${selectedMembers.length})`}
                                </AsyncButton>
                                <AsyncButton
                                    onClick={() => setConfirmAction("reject")}
                                    disabled={
                                        working !== null ||
                                        !selectedMembers.length
                                    }
                                    sx={{
                                        height: "40px",
                                        flexGrow: { xs: 1, sm: 0 },
                                    }}
                                >
                                    {working === "reject"
                                        ? "Rejecting..."
                                        : `Reject (${selectedMembers.length})`}
                                </AsyncButton>
                            </div>
                        </div>
                    )}
                    {pendingMembers?.map((member, i) => (
                        <PendingMember
                            id={member.membershipId || -1}
                            first_name={member.first_name}
                            last_name={member.last_name}
                            email={member.email || "Undefined"}
                            picture={member.picture}
                            selected={
                                !unselectedIds.includes(
                                    member.membershipId as number,
                                )
                            }
                            onSelect={
                                pendingMembers.length > 1
                                    ? (selected) =>
                                          toggleMember(
                                              member.membershipId as number,
                                              selected,
                                          )
                                    : undefined
                            }
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
