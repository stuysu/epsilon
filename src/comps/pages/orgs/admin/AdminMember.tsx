import { ChangeEvent, useContext, useState } from "react";
import UserContext from "../../../context/UserContext";

import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material";
import { supabase } from "../../../../supabaseClient";
import { useSnackbar } from "notistack";
import OrgMember from "../OrgMember";
import OrgContext from "../../../context/OrgContext";
import ConfirmationDialog from "../../../ui/ConfirmationDialog";
import AsyncButton from "../../../ui/AsyncButton";

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
}) => {
    const user = useContext(UserContext);
    const organization = useContext(OrgContext);

    const { enqueueSnackbar } = useSnackbar();
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
        const { error } = await supabase
            .from("memberships")
            .update({ role: editState.role, role_name: editState.role_name })
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
        <Box
            sx={{
                width: "100%",
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
            }}
        >
            <Box sx={{ width: "100%" }}>
                <OrgMember
                    role={role}
                    role_name={role_name}
                    email={email}
                    picture={picture}
                    first_name={first_name}
                    last_name={last_name}
                    is_faculty={is_faculty}
                />
            </Box>
            <Box
                sx={{
                    width: "200px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {(isCreator ||
                    role === "MEMBER" ||
                    role === "ADVISOR" ||
                    userId === user.id) && (
                    <div onClick={handleEdit}>
                        <i className={"bx bx-pencil bx-md"}></i>
                    </div>
                )}

                {userId !== user.id &&
                    (isCreator || role === "MEMBER" || role === "ADVISOR") && (
                        <AsyncButton
                            onClick={() => setKickConfirmOpen(true)}
                            variant="contained"
                            sx={{
                                height: "40px",
                                marginLeft: "10px",
                                position: "relative",
                                bottom: "2px",
                            }}
                        >
                            Kick
                        </AsyncButton>
                    )}
            </Box>
            <ConfirmationDialog
                open={kickConfirmOpen}
                title={`Kick ${first_name} ${last_name}?`}
                description={"This action can't be reversed."}
                onConfirm={handleKick}
                onClose={() => setKickConfirmOpen(false)}
            />
            <Dialog open={editState.editing} onClose={handleClose}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        value={editState.role_name}
                        onChange={handleType}
                        label="Role Name"
                    />
                    {((isCreator && userId !== user.id) ||
                        (isAdmin &&
                            role !== "ADMIN" &&
                            role !== "CREATOR" &&
                            userId !== user.id)) && (
                        <Select
                            value={editState.role}
                            label="Role"
                            onChange={handleSelect}
                        >
                            <MenuItem value={"MEMBER"}>Member</MenuItem>
                            <MenuItem value={"ADVISOR"}>Advisor</MenuItem>
                            {isCreator && (
                                <MenuItem value={"ADMIN"}>Admin</MenuItem>
                            )}
                        </Select>
                    )}
                </DialogContent>
                <DialogActions>
                    <AsyncButton variant="contained" onClick={handleClose}>
                        Cancel
                    </AsyncButton>
                    <AsyncButton variant="contained" onClick={handleSave}>
                        Save
                    </AsyncButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminMember;
