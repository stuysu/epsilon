import { ChangeEvent, useContext, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import UserContext from "../../../../../contexts/UserContext";

import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import OrgMember from "../../components/OrgMember";
import OrgContext from "../../../../../contexts/OrgContext";
import UserDialog from "../../../../../components/ui/overlays/UserDialog";
import { PUBLIC_URL } from "../../../../../config/constants";
import SelectField from "../../../../../components/ui/input/SelectField";
import TextField from "../../../../../components/ui/input/TextField";

const AdminMember = ({
    id,
    userId,
    first_name,
    last_name,
    email,
    picture,
    role,
    role_name,
    isCreator, // referring to client user
    isAdmin, // referring to client user
    is_faculty,
    canDrag,
    onDragEnd,
    readOnly = false,
}: {
    id: number;
    userId: number;
    first_name: string;
    last_name: string;
    email: string;
    picture?: string;
    role: Membership["role"];
    role_name?: string;
    isCreator: boolean;
    isAdmin: boolean;
    is_faculty?: boolean;
    onDragEnd: () => void;
    canDrag: boolean;
    readOnly?: boolean;
}) => {
    const user = useContext(UserContext);
    const organization = useContext(OrgContext);

    const { enqueueSnackbar } = useSnackbar();
    const dragControls = useDragControls();
    const [editState, setEditState] = useState({
        id: -1,
        role: "",
        role_name: "",
        editing: false,
    });

    /* KICK CONFIRMATION */
    const [kickConfirmOpen, setKickConfirmOpen] = useState(false);

    const handleEdit = () => {
        setEditState({
            id: user.id,
            role,
            role_name: role_name || "",
            editing: true,
        });
    };

    const handleKick = async () => {
        /* select the deleted row: if the database didn't allow it, nothing is
           deleted and there's no error, just no rows */
        const { data: kicked, error } = await supabase
            .from("memberships")
            .delete()
            .eq("id", id)
            .select("id");

        if (error || !kicked?.length) {
            enqueueSnackbar(
                "Could not kick member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        if (organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: organization.memberships.filter(
                    (m) => m.id !== id,
                ),
            });
        }

        enqueueSnackbar("Member kicked!", { variant: "success" });
    };

    const handleSelect = (role: string) => {
        setEditState({
            ...editState,
            role,
        });
    };

    const handleType = (event: ChangeEvent<HTMLInputElement>) => {
        setEditState({
            ...editState,
            role_name: event.target.value,
        });
    };

    const handleClose = () => {
        setEditState({
            id: -1,
            role: "",
            role_name: "",
            editing: false,
        });
    };

    const handleSave = async () => {
        // admins can't update other admins' rows, they can only change the role name
        const adminEditingAdmin =
            isAdmin && role === "ADMIN" && userId !== user.id;

        let error: unknown = null;
        if (adminEditingAdmin) {
            ({ error } = await supabase.rpc("set_membership_role_name", {
                membership_id: id,
                new_role_name: editState.role_name,
            }));
        } else {
            /* a blocked update changes no rows and returns no error */
            const result = await supabase
                .from("memberships")
                .update({
                    role: editState.role,
                    role_name: editState.role_name,
                })
                .eq("id", id)
                .select("id");
            error = result.error || (!result.data?.length ? "no rows" : null);
        }

        if (error) {
            enqueueSnackbar(
                "Could not update member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        if (organization.setOrg) {
            const existingMemberIndex = organization.memberships.findIndex(
                (m) => m.id === id,
            );
            if (!~existingMemberIndex) {
                enqueueSnackbar(
                    "Could not update frontend. Refresh to see changes.",
                    { variant: "warning" },
                );
                handleClose();
                return;
            }

            const existingMember =
                organization.memberships[existingMemberIndex];

            organization.setOrg({
                ...organization,
                memberships: [
                    ...organization.memberships.slice(0, existingMemberIndex),
                    {
                        ...existingMember,
                        role: editState.role,
                        role_name: editState.role_name,
                    },
                    ...organization.memberships.slice(existingMemberIndex + 1),
                ],
            });
        }

        enqueueSnackbar("Member updated!", { variant: "success" });
        handleClose();
    };

    return (
        <Reorder.Item
            as="div"
            value={id}
            dragListener={false}
            dragControls={dragControls}
            onDragEnd={onDragEnd}
            className="w-full flex flex-nowrap items-center h-fit"
        >
            <div className={"w-full min-w-0 flex items-center bg-layer-2"}>
                <div className={"w-full min-w-0"}>
                    <OrgMember
                        role={role}
                        role_name={role_name}
                        email={email}
                        picture={picture}
                        first_name={first_name}
                        last_name={last_name}
                        is_faculty={is_faculty}
                    />
                </div>
                {!readOnly && (
                    <>
                        {/* always rendered so the rows line up when there is no handle */}
                        <div
                            className={
                                "w-6 sm:w-8 shrink-0 flex justify-center " +
                                (canDrag ? "cursor-grab touch-none" : "")
                            }
                            onPointerDown={(e) =>
                                canDrag && dragControls.start(e)
                            }
                        >
                            {canDrag && (
                                <p>
                                    <i className={"bx bx-menu bx-sm"}></i>
                                </p>
                            )}
                        </div>
                        <div
                            className={
                                "px-1.5 sm:px-3 flex w-[4.5rem] sm:w-28 shrink-0"
                            }
                        >
                            {(isCreator ||
                                role === "MEMBER" ||
                                role === "ADVISOR" ||
                                (isAdmin && role === "ADMIN") ||
                                userId === user.id) && (
                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    aria-label={`Edit ${first_name} ${last_name}`}
                                    title="Edit member"
                                    className="flex rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                                >
                                    <i
                                        className={
                                            "bx bx-pencil bx-sm sm:hover:opacity-75 cursor-pointer"
                                        }
                                        aria-hidden="true"
                                    ></i>
                                </button>
                            )}

                            {userId !== user.id &&
                                (isCreator ||
                                    role === "MEMBER" ||
                                    role === "ADVISOR") && (
                                    <button
                                        type="button"
                                        onClick={() => setKickConfirmOpen(true)}
                                        aria-label={`Remove ${first_name} ${last_name}`}
                                        title="Remove member"
                                        className="ml-3 flex rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                                    >
                                        <i
                                            className={
                                                "bx bx-user-x bx-sm text-red sm:hover:opacity-75 cursor-pointer"
                                            }
                                            aria-hidden="true"
                                        ></i>
                                    </button>
                                )}
                        </div>
                    </>
                )}
            </div>
            <UserDialog
                imageSrc={`${PUBLIC_URL}/symbols/warning.png`}
                open={kickConfirmOpen}
                title={`Kick ${first_name} ${last_name}?`}
                description={
                    "This action can't be reversed. This member will have to request to join again."
                }
                onConfirm={handleKick}
                onClose={() => setKickConfirmOpen(false)}
            />
            <UserDialog
                open={editState.editing}
                title="Edit User"
                description="Make changes to this user's role and role name."
                onClose={handleClose}
                onCancel={handleClose}
                onConfirm={handleSave}
                confirmText="Save"
                cancelText="Cancel"
            >
                <div className="flex flex-col gap-4">
                    <TextField
                        value={editState.role_name}
                        onChange={handleType}
                        label="Role Name"
                        fullWidth
                    />

                    {((isCreator && userId !== user.id) ||
                        (isAdmin &&
                            role !== "ADMIN" &&
                            role !== "CREATOR" &&
                            userId !== user.id)) && (
                        <SelectField
                            label="Role"
                            fullWidth
                            value={editState.role}
                            onChange={handleSelect}
                            options={[
                                { value: "MEMBER", label: "Member" },
                                { value: "ADVISOR", label: "Advisor" },
                                ...(isCreator
                                    ? [{ value: "ADMIN", label: "Admin" }]
                                    : []),
                            ]}
                        />
                    )}
                </div>
            </UserDialog>
        </Reorder.Item>
    );
};

export default AdminMember;
