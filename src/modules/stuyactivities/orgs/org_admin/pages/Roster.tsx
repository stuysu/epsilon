import React, { useContext, useState, useEffect } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import UserContext from "../../../../../contexts/UserContext";
import { supabase } from "../../../../../lib/supabaseClient";

import AdminMember from "../components/AdminMember";
import { Box, TextField } from "@mui/material";
import { Switch } from "radix-ui";

import { sortByRole } from "../../../../../utils/DataFormatters";
import { useSnackbar } from "notistack";
import ItemList from "../../../../../components/ui/lists/ItemList";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";

const Roster = () => {
    const { enqueueSnackbar } = useSnackbar();

    const user = useContext(UserContext);
    const organization = useContext<OrgContextType>(OrgContext);

    const [joinableState, setJoinableState] = useState<boolean>(
        organization.joinable ?? false,
    );
    const [toggling, setToggling] = useState(false);

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

    return (
        <Box sx={{ width: "100%" }}>
            <div
                className={
                    "bg-layer-1 p-5 pl-7 pb-8 rounded-xl mb-10 mt-2 shadow-prominent"
                }
            >
                <h1>Member Roster</h1>
                <p className={"mb-6"}>
                    See your members, manage them, or change your club's
                    joinable status here. Sending invites to join is a feature
                    in development.
                </p>

                <div
                    style={{ marginBottom: 12 }}
                    className="flex items-center gap-4"
                >
                    <div className="font-medium">
                        {joinableState ? "Joinable" : "Private"}
                    </div>
                    <Switch.Root
                        checked={joinableState}
                        onCheckedChange={() => toggleJoinable()}
                        disabled={!canToggleJoinable || toggling}
                        className={
                            "relative h-6 w-11 cursor-pointer rounded-full bg-layer-3 transition-colors " +
                            "data-[state=checked]:bg-blue " +
                            (!canToggleJoinable || toggling
                                ? "opacity-50 cursor-not-allowed"
                                : "")
                        }
                    >
                        <Switch.Thumb className="sm:hover:scale-110 block h-5 w-5 translate-x-0.5 rounded-full bg-white/90 shadow transition-transform data-[state=checked]:translate-x-[22px] ease-in-out" />
                    </Switch.Root>
                </div>

                <AsyncButton disabled={true}>
                    <i className={"bx bx-send mr-2"}></i> Invites are coming
                    soon!
                </AsyncButton>
            </div>

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

export default Roster;
