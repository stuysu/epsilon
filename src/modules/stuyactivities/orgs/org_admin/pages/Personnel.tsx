import React, { useContext, useState, useEffect } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import UserContext from "../../../../../contexts/UserContext";
import { supabase } from "../../../../../lib/supabaseClient";
import { PUBLIC_URL } from "../../../../../config/constants";

import AdminMember from "../components/AdminMember";
import OrgMember from "../../components/OrgMember";
import { Box, TextField } from "@mui/material";

import { sortByRole } from "../../../../../utils/DataFormatters";
import { useSnackbar } from "notistack";
import ItemList from "../../../../../components/ui/lists/ItemList";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import UserDialog from "../../../../../components/ui/overlays/UserDialog";

const Personnel = () => {
    const { enqueueSnackbar } = useSnackbar();

    const user = useContext(UserContext);
    const organization = useContext<OrgContextType>(OrgContext);

    const [joinableState, setJoinableState] = useState<boolean>(
        organization.joinable ?? false,
    );
    const [toggling, setToggling] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [joinRequestsDialogOpen, setJoinRequestsDialogOpen] = useState(false);

    useEffect(() => {
        setJoinableState(organization.joinable ?? false);
    }, [organization.joinable]);

    const members = organization.memberships
        .filter((member) => member.active)
        .map((member) => {
            return {
                first_name: member.users?.first_name,
                last_name: member.users?.last_name,
                email: member.users?.email,
                membershipId: member.id,
                userId: member.users?.id,
                picture: member.users?.picture,
                role_name: member.role_name,
                role: member.role,
                is_faculty: member.users?.is_faculty,
            };
        });
    const member_emails = members.map((member) => member.email).join(", ");

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

    const userMember = organization.memberships.find(
        (member) => member.users?.id === user.id,
    );

    const canToggleJoinable =
        userMember?.role === "CREATOR" || userMember?.role === "ADMIN";

    const toggleJoinable = async () => {
        if (!canToggleJoinable) {
            enqueueSnackbar(
                "You do not have permission to change this setting.",
                {
                    variant: "error",
                },
            );
            return;
        }
        setToggling(true);
        const { error } = await supabase
            .from("organizations")
            .update({ joinable: !joinableState })
            .eq("id", organization.id);

        if (error) {
            enqueueSnackbar("Failed to update joinable state.", {
                variant: "error",
            });
            setToggling(false);
            return;
        }

        if (organization.setOrg) {
            organization.setOrg({
                ...organization,
                joinable: !joinableState,
            });
        }
        setJoinableState((prev) => !prev);
        enqueueSnackbar(
            `Organization is now ${!joinableState ? "joinable" : "private"}.`,
            { variant: "success" },
        );
        setToggling(false);
    };

    const handleApprove = async (membershipId: number) => {
        const { error } = await supabase.functions.invoke("approve-member", {
            body: { member_id: membershipId },
        });

        if (error) {
            enqueueSnackbar(
                "Error approving member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        let memberIndex = organization.memberships.findIndex(
            (m) => m.id === membershipId,
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

    const handleReject = async (membershipId: number) => {
        const { error } = await supabase
            .from("memberships")
            .delete()
            .eq("id", membershipId);
        if (error) {
            enqueueSnackbar(
                "Error rejecting member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        // update contexts
        if (organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: organization.memberships.filter(
                    (m) => m.id !== membershipId,
                ),
            });
        }

        enqueueSnackbar("User rejected!", { variant: "success" });
    };

    return (
        <Box sx={{ width: "100%" }}>
            <header className={"mb-6 mt-2"}>
                <section className={"flex justify-between mb-2"}>
                    <h1>Personnel</h1>
                    <div>
                        <AsyncButton
                            className={"right-2"}
                            onClick={() => setDialogOpen(true)}
                            disabled={toggling}
                        >
                            <i
                                className={
                                    joinableState
                                        ? "bx bx-globe bx-xs mt-px mr-3"
                                        : "bx bx-lock bx-xs mt-px mr-3"
                                }
                            ></i>
                            {joinableState
                                ? "Public Activity"
                                : "Private Activity"}
                        </AsyncButton>
                        <AsyncButton
                            isPrimary={true}
                            onClick={() => setJoinRequestsDialogOpen(true)}
                            disabled={toggling}
                        >
                            Join Requests{pendingMembers?.length > 0 && ` (${pendingMembers.length})`}
                        </AsyncButton>
                    </div>
                </section>
                <p>
                    Manage your members or change your Activity’s joinable
                    status here. {" "}
                    <span className={"important"}>
                        Sending invites to join is a feature in development.
                    </span>
                </p>
            </header>

            <UserDialog
                title={
                    joinableState
                        ? "Make Activity Private?"
                        : "Make Activity Public?"
                }
                imageSrc={`${PUBLIC_URL}/symbols/warning.png`}
                description={
                    joinableState
                        ? "This Activity is currently public. Are you sure you want to make it private? Members may no longer request to join this Activity. Currently, this renders the Activity un-joinable."
                        : "This Activity is currently private. Are you sure you want to make it public? Anyone will be able to send join requests."
                }
                onConfirm={toggleJoinable}
                onClose={() => setDialogOpen(false)}
                open={dialogOpen}
                confirmText={joinableState ? "Make Private" : "Make Public"}
            />

            <UserDialog
                title="Join Requests"
                description={
                    pendingMembers?.length > 0
                        ? "Review and manage pending join requests for your Activity."
                        : "No pending join requests at this time."
                }
                open={joinRequestsDialogOpen}
                onClose={() => setJoinRequestsDialogOpen(false)}
                confirmText="Done"
                hideCancel={true}
            >
                {pendingMembers?.length > 0 && (
                    <ItemList height={"auto"}>
                        {pendingMembers.map((member, i) => (
                            <OrgMember
                                key={i}
                                approvalMode={true}
                                onApprove={() => handleApprove(member.membershipId || -1)}
                                onReject={() => handleReject(member.membershipId || -1)}
                                first_name={member.first_name}
                                last_name={member.last_name}
                                email={member.email || "Undefined"}
                                picture={member.picture}
                            />
                        ))}
                    </ItemList>
                )}
            </UserDialog>

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "nowrap",
                    alignItems: "center",
                    marginBottom: "25px",
                }}
            >
                <Box
                    sx={{
                        paddingTop: "8px",
                        paddingBottom: "8px",
                        width: "100%",
                    }}
                >
                    <TextField
                        disabled
                        fullWidth
                        value={member_emails}
                        variant="outlined"
                    />
                </Box>
                <Box sx={{ paddingLeft: "16px", width: "100px" }}>
                    <AsyncButton
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(
                                    member_emails,
                                );
                                enqueueSnackbar("Copied emails to clipboard!", {
                                    variant: "success",
                                });
                            } catch (error) {
                                enqueueSnackbar(
                                    "Failed to copy emails to clipboard. :( Try manually copying from the page.",
                                    { variant: "error" },
                                );
                            }
                        }}
                    >
                        Copy
                    </AsyncButton>
                </Box>
            </Box>

            <ItemList height={"auto"}>
                {members
                    ?.sort(sortByRole)
                    .map((member, i) => (
                        <AdminMember
                            id={member.membershipId || -1}
                            userId={member.userId || -1}
                            first_name={member.first_name || "First"}
                            last_name={member.last_name || "Last"}
                            email={member.email || ""}
                            picture={member.picture}
                            role={member.role || "MEMBER"}
                            role_name={member.role_name}
                            isCreator={userMember?.role === "CREATOR"}
                            isAdmin={userMember?.role === "ADMIN"}
                            is_faculty={member.is_faculty}
                            key={i}
                        />
                    ))}
            </ItemList>
        </Box>
    );
};

export default Personnel;
