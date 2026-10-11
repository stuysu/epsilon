import React, { useContext, useState, useEffect } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import UserContext from "../../../../../contexts/UserContext";
import { supabase } from "../../../../../lib/supabaseClient";

import AdminMember from "../components/AdminMember";
import { Box, TextField } from "@mui/material";
import { Switch } from "radix-ui";
import { Reorder } from "framer-motion";

import { sortMembers } from "../../../../../utils/DataFormatters";
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
        .sort(sortMembers)
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

    /* the creator can move anyone, admins can only move members and advisors */
    const canReorder = (role?: Membership["role"]) =>
        userMember?.role === "CREATOR" ||
        (userMember?.role === "ADMIN" &&
            (role === "MEMBER" || role === "ADVISOR"));

    const roles: Membership["role"][] = [
        "CREATOR",
        "ADMIN",
        "ADVISOR",
        "MEMBER",
    ];

    // membership ids in displayed order, so a member can be dragged before the order is saved
    const [order, setOrder] = useState<number[]>([]);

    useEffect(() => {
        setOrder(members.map((member) => member.membershipId as number));
    }, [organization.memberships]);

    const membersById = new Map(
        members.map((member) => [member.membershipId, member]),
    );
    const orderedMembers =
        order.length === members.length &&
        order.every((id) => membersById.has(id))
            ? order.map((id) => membersById.get(id)!)
            : members;

    const idsOfRole = (list: typeof members, role: Membership["role"]) =>
        list
            .filter((member) => member.role === role)
            .map((member) => member.membershipId as number);

    const handleReorder = (role: Membership["role"], ids: number[]) => {
        setOrder(
            roles.flatMap((r) =>
                r === role ? ids : idsOfRole(orderedMembers, r),
            ),
        );
    };

    // every member of the role gets an ordering_id matching the given order
    const saveOrder = async (role: Membership["role"], ids: number[]) => {
        const current = idsOfRole(members, role);
        if (ids.every((id, i) => id === current[i])) return;

        const orderings = ids.map((id, i) => ({ id, ordering_id: i }));

        const results = await Promise.all(
            orderings.map(({ id, ordering_id }) =>
                supabase
                    .from("memberships")
                    .update({ ordering_id })
                    .eq("id", id),
            ),
        );

        if (results.some(({ error }) => error)) {
            enqueueSnackbar(
                "Could not reorder members. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            setOrder(members.map((member) => member.membershipId as number));
            return;
        }

        if (organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: organization.memberships.map((member) => {
                    const ordering = orderings.find(
                        ({ id }) => id === member.id,
                    );
                    return ordering
                        ? { ...member, ordering_id: ordering.ordering_id }
                        : member;
                }),
            });
        }
    };

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
                {roles.map((role) => {
                    const group = orderedMembers.filter(
                        (member) => member.role === role,
                    );
                    if (!group.length) return null;

                    return (
                        <Reorder.Group
                            as="div"
                            axis="y"
                            key={role}
                            values={group.map(
                                (member) => member.membershipId as number,
                            )}
                            onReorder={(ids) => handleReorder(role, ids)}
                            className="flex flex-col gap-0.5"
                        >
                            {group.map((member) => (
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
                                    canDrag={
                                        canReorder(member.role) &&
                                        group.length > 1
                                    }
                                    onDragEnd={() =>
                                        saveOrder(
                                            role,
                                            group.map(
                                                (m) => m.membershipId as number,
                                            ),
                                        )
                                    }
                                    key={member.membershipId}
                                />
                            ))}
                        </Reorder.Group>
                    );
                })}
            </ItemList>
        </Box>
    );
};

export default Roster;
