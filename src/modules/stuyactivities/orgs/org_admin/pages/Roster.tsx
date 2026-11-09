import React, { useContext, useState, useEffect } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import UserContext from "../../../../../contexts/UserContext";
import { supabase } from "../../../../../lib/supabaseClient";

import AdminMember from "../components/AdminMember";
import { Reorder } from "framer-motion";

import {
    MemberSort,
    sortMembers,
    sortMembersBy,
    memberSortOptions,
} from "../../../../../utils/DataFormatters";
import useMembershipJoinDates from "../../../../../utils/useMembershipJoinDates";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import ItemList from "../../../../../components/ui/lists/ItemList";
import OrgAdvisors from "../../components/OrgAdvisors";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import ToggleChip from "../../../../../components/ui/input/ToggleChip";
import UserDialog from "../../../../../components/ui/overlays/UserDialog";
import InviteMembersDialog from "../components/InviteMembersDialog";
import MemberToolbar from "../components/MemberToolbar";
import { PUBLIC_URL } from "../../../../../config/constants";

const Roster = ({ readOnly = false }: { readOnly?: boolean }) => {
    const { enqueueSnackbar } = useSnackbar();

    const user = useContext(UserContext);
    const organization = useContext<OrgContextType>(OrgContext);

    const [joinableState, setJoinableState] = useState<boolean>(
        organization.joinable ?? false,
    );
    const [toggling, setToggling] = useState(false);
    const [confirmingVisibility, setConfirmingVisibility] = useState(false);
    const navigate = useNavigate();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [query, setQuery] = useState("");
    const pendingCount = organization.memberships.filter(
        (member) => !member.active,
    ).length;
    const [sort, setSort] = useState<MemberSort>("default");
    const joinDates = useMembershipJoinDates(
        organization.id,
        organization.memberships.length,
    );

    useEffect(() => {
        setJoinableState(organization.joinable ?? false);
    }, [organization.joinable]);

    const activeMembers = organization.memberships
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
    const members = activeMembers.filter((member) => member.role !== "ADVISOR");
    const member_emails = members.map((member) => member.email).join(", ");
    const leader_emails = members
        .filter(
            (member) => member.role === "CREATOR" || member.role === "ADMIN",
        )
        .map((member) => member.email)
        .join(", ");

    const userMember = organization.memberships.find(
        (member) => member.users?.id === user.id,
    );

    const canToggleJoinable =
        !!userMember?.active &&
        (userMember.role === "CREATOR" ||
            userMember.role === "ADMIN" ||
            userMember.role === "ADVISOR");

    /* the creator can move anyone, admins can only move members and advisors */
    const canReorder = canToggleJoinable;

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

    const sortedMembers = sortMembersBy(orderedMembers, sort, (member) => ({
        first_name: member.first_name,
        last_name: member.last_name,
        joined_at: joinDates.get(member.membershipId as number),
    }));

    const searchText = query.trim().toLowerCase();
    const searching = searchText !== "";
    const visibleMembers = sortedMembers.filter((member) =>
        `${member.first_name ?? ""} ${member.last_name ?? ""} ${member.email ?? ""}`
            .toLowerCase()
            .includes(searchText),
    );

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

        const { error } = await supabase.rpc("reorder_memberships", {
            org_id: organization.id,
            membership_ids: ids,
        });

        if (error) {
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

    const renderMember = (
        member: (typeof members)[number],
        canDrag: boolean,
        onDragEnd: () => void,
    ) => (
        <AdminMember
            id={member.membershipId || -1}
            userId={member.userId || -1}
            first_name={member.first_name || "First"}
            last_name={member.last_name || "Last"}
            email={member.email || ""}
            picture={member.picture}
            role={member.role || "MEMBER"}
            role_name={member.role_name}
            isCreator={!!userMember?.active && userMember.role === "CREATOR"}
            isAdmin={
                !!userMember?.active &&
                (userMember.role === "ADMIN" || userMember.role === "ADVISOR")
            }
            readOnly={readOnly}
            canDrag={canDrag}
            onDragEnd={onDragEnd}
            key={member.membershipId}
        />
    );

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
        const { error } = await supabase.rpc("set_organization_joinable", {
            org_id: organization.id,
            new_joinable: !joinableState,
        });

        if (error) {
            enqueueSnackbar(
                "Failed to update whether this Activity is public.",
                {
                    variant: "error",
                },
            );
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
            `Activity is now ${!joinableState ? "public" : "private"}.`,
            { variant: "success" },
        );
        setToggling(false);
    };

    return (
        <div className="w-full">
            <header className={"mb-8 mt-2"}>
                <section
                    className={
                        "mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3"
                    }
                >
                    <h1>Roster</h1>
                    {readOnly ? (
                        <ToggleChip
                            title={joinableState ? "Public" : "Private"}
                            selectable={false}
                        />
                    ) : (
                        <div className={"flex flex-wrap gap-2"}>
                            <AsyncButton
                                onClick={() => setConfirmingVisibility(true)}
                                disabled={!canToggleJoinable || toggling}
                            >
                                <i
                                    aria-hidden="true"
                                    className={
                                        "bx bx-xs mr-3 mt-px " +
                                        (joinableState ? "bx-globe" : "bx-lock")
                                    }
                                />
                                {joinableState
                                    ? "Public Activity"
                                    : "Private Activity"}
                            </AsyncButton>
                            <AsyncButton onClick={() => setInviteOpen(true)}>
                                <i
                                    aria-hidden="true"
                                    className={
                                        "bx bx-user-plus bx-xs mr-3 mt-px"
                                    }
                                />
                                Invite
                            </AsyncButton>
                            <AsyncButton
                                isPrimary={true}
                                onClick={() =>
                                    navigate(
                                        `/${organization.url}/admin/roster/join-requests`,
                                    )
                                }
                            >
                                Join Requests
                                {pendingCount > 0 && ` (${pendingCount})`}
                            </AsyncButton>
                        </div>
                    )}
                </section>
                {readOnly ? (
                    <p>
                        You are viewing this roster as a Clubs & Pubs
                        administrator. You can copy emails, but only this
                        Activity's admins can change it.
                    </p>
                ) : (
                    <p>
                        See your members, manage them, or change your club's
                        public status here.
                    </p>
                )}
            </header>

            <InviteMembersDialog
                open={inviteOpen}
                onClose={() => setInviteOpen(false)}
            />

            <UserDialog
                title={
                    joinableState
                        ? "Make Activity Private?"
                        : "Make Activity Public?"
                }
                description={
                    joinableState
                        ? "This Activity is currently public. Are you sure you want to make it private? Members may no longer request to join this Activity."
                        : "This Activity is currently private. Are you sure you want to make it public? Anyone will be able to send join requests."
                }
                imageSrc={`${PUBLIC_URL}/symbols/warning.png`}
                open={confirmingVisibility}
                onClose={() => setConfirmingVisibility(false)}
                onConfirm={toggleJoinable}
                confirmText={joinableState ? "Make Private" : "Make Public"}
            />

            <MemberToolbar
                query={query}
                onQueryChange={setQuery}
                sort={sort}
                onSortChange={setSort}
                leaderEmails={leader_emails}
                memberEmails={member_emails}
            />

            <ItemList height={"auto"}>
                {sort === "default" && !searching ? (
                    roles.map((role) => {
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
                                {group.map((member) =>
                                    renderMember(
                                        member,
                                        !readOnly &&
                                            canReorder &&
                                            group.length > 1,
                                        () =>
                                            saveOrder(
                                                role,
                                                group.map(
                                                    (m) =>
                                                        m.membershipId as number,
                                                ),
                                            ),
                                    ),
                                )}
                            </Reorder.Group>
                        );
                    })
                ) : visibleMembers.length === 0 ? (
                    <p className={"py-8 text-center"}>
                        No members match your search.
                    </p>
                ) : (
                    <Reorder.Group
                        as="div"
                        axis="y"
                        values={visibleMembers.map(
                            (member) => member.membershipId as number,
                        )}
                        onReorder={() => {}}
                        className="flex flex-col gap-0.5"
                    >
                        {visibleMembers.map((member) =>
                            renderMember(member, false, () => {}),
                        )}
                    </Reorder.Group>
                )}
            </ItemList>
            <div className="mt-8 xl:hidden">
                <OrgAdvisors editable={canToggleJoinable && !readOnly} />
            </div>
        </div>
    );
};

export default Roster;
