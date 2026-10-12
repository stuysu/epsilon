import { ChangeEvent, useContext, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import UserContext from "../../../../../contexts/UserContext";

import { MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import OrgMember from "../../components/OrgMember";
import OrgContext from "../../../../../contexts/OrgContext";
import UserDialog from "../../../../../components/ui/overlays/UserDialog";
import { PUBLIC_URL } from "../../../../../config/constants";

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
        const { error } = await supabase
            .from("memberships")
            .delete()
            .eq("id", id);

        if (error) {
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

    const handleSelect = (event: SelectChangeEvent) => {
        setEditState({
            ...editState,
            role: event.target.value,
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

        const { error } = adminEditingAdmin
            ? await supabase.rpc("set_membership_role_name", {
                  membership_id: id,
                  new_role_name: editState.role_name,
              })
            : await supabase
                  .from("memberships")
                  .update({
                      role: editState.role,
                      role_name: editState.role_name,
                  })
                  .eq("id", id);

        if (error) {
            enqueueSnackbar(
                "Could not update member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        if (organization.setOrg) {
            let existingMemberIndex = organization.memberships.findIndex(
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

            let existingMember = organization.memberships[existingMemberIndex];

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
                                <div onClick={handleEdit}>
                                    <p>
                                        <i
                                            className={
                                                "bx bx-pencil bx-sm sm:hover:opacity-75 cursor-pointer"
                                            }
                                        ></i>
                                    </p>
                                </div>
                            )}

                            {userId !== user.id &&
                                (isCreator ||
                                    role === "MEMBER" ||
                                    role === "ADVISOR") && (
                                    <div
                                        onClick={() => setKickConfirmOpen(true)}
                                    >
                                        <p>
                                            <i
                                                className={
                                                    "bx bx-user-x bx-sm ml-3 text-red sm:hover:opacity-75 cursor-pointer"
                                                }
                                            ></i>
                                        </p>
                                    </div>
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
                        <Select
                            value={editState.role}
                            onChange={handleSelect}
                            displayEmpty
                            MenuProps={{
                                disablePortal: true,
                                anchorOrigin: {
                                    vertical: "center",
                                    horizontal: "left",
                                },
                                PaperProps: {
                                    sx: { mt: "-180px", ml: "-12vw" },
                                },
                            }}
                            // Temporary fix for menu being off center. migrate to radix.
                        >
                            <MenuItem value={"MEMBER"}>Member</MenuItem>
                            <MenuItem value={"ADVISOR"}>Advisor</MenuItem>
                            {isCreator && (
                                <MenuItem value={"ADMIN"}>Admin</MenuItem>
                            )}
                        </Select>
                    )}
                </div>
            </UserDialog>
        </Reorder.Item>
    );
};

export default AdminMember;
