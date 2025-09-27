import React, { useContext, useEffect, useState } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import { Checkbox } from "radix-ui";
import PendingMember from "../components/PendingMember";
import { Box } from "@mui/material";
import ItemList from "../../../../../components/ui/lists/ItemList";
import { supabase } from "../../../../../lib/supabaseClient";
import { enqueueSnackbar } from "notistack";

    const handleApprove = async ({id, organization}: {id: number, organization: OrgContextType}) => {
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

        enqueueSnackbar("Member approved!", { variant: "success" });
    };

const JoinRequests = () => {
    const [autoAccept, setAutoAccept] = useState(false);
    const organization = useContext<OrgContextType>(OrgContext);
    console.log(organization.memberships);
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


    useEffect(() => {
        if (autoAccept) {
            pendingMembers.map((member) => {
                handleApprove({id: member.membershipId!, organization});
            });
        }
        if (organization.setOrg) {
            organization.setOrg({
                ...organization,
                auto_accept: autoAccept,
            });
        }
    }, [autoAccept])
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
                <div className="flex flex-col">
                    <div className="flex flex-row gap-3 mt-6">
                    <Checkbox.Root
                        id="agree-regulations"
                        checked={autoAccept}
                        onCheckedChange={(checked) =>
                            setAutoAccept(!!checked)
                        }
                        className={`h-8 min-w-8 rounded border border-divider flex items-center justify-center ${autoAccept ? "bg-blue": "bg-transparent"}`}
                        aria-label="Agree to Clubs & Pubs Regulations"
                    >
                        <Checkbox.Indicator>
                            <i className="bx bx-check text-typography-1 text-lg"></i>
                        </Checkbox.Indicator>
                    </Checkbox.Root>
                    <h2 className="my-0">Auto-Accept</h2>
                    </div>
                    <h4 className="text-gray-400 opacity-30 mt-1 text-sm">Automatically accept new members to your organization.</h4>
                </div>
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
