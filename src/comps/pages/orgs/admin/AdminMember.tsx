import { useContext, useState, ChangeEvent } from "react";
import UserContext from "../../../context/UserContext";

import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogContentText,
    TextField,
    Select,
    MenuItem,
    SelectChangeEvent,
    DialogActions,
    Box,
} from "@mui/material";
import { supabase } from "../../../../supabaseClient";
import { useSnackbar } from "notistack";
import OrgMember from "../OrgMember";
import OrgContext from "../../../context/OrgContext";

const AdminMember = ({
    id,
    userId,
    first_name,
    last_name,
    email,
    picture,
    role,
    role_name,
    isCreator,
    is_faculty
}: {
    id: number;
    userId: number;
    first_name: string;
    last_name: string;
    email: string;
    picture?: string;
    role: Membership['role'];
    role_name?: string;
    isCreator: boolean;
    is_faculty?: boolean;
}) => {
    const user = useContext(UserContext);
    const organization = useContext(OrgContext)

    const { enqueueSnackbar } = useSnackbar();
    const [editState, setEditState] = useState({
        id: -1,
        role: "",
        role_name: "",
        editing: false,
    });

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
            organization.setOrg(
                {
                    ...organization,
                    memberships: organization.memberships.filter(m => m.id !== id)
                }
            )
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
            let existingMemberIndex = organization.memberships.findIndex(m => m.id === id);
            if (!~existingMemberIndex) {
                enqueueSnackbar(
                    "Could not update frontend. Refresh to see changes.",
                    { variant: "warning" }
                );
                handleClose();
                return;
            }

            let existingMember = organization.memberships[existingMemberIndex];

            organization.setOrg(
                {
                    ...organization,
                    memberships: [
                        ...organization.memberships.slice(0, existingMemberIndex),
                        {
                            ...existingMember,
                            role: editState.role,
                            role_name: editState.role_name
                        },
                        ...organization.memberships.slice(existingMemberIndex+1) 
                    ]
                }
            )
        }

        enqueueSnackbar("Member updated!", { variant: "success" });
        handleClose();
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexWrap: 'nowrap', alignItems: 'center' }}>
            <Box sx={{ width: '100%'}}>
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
            <Box sx={{ width: '200px' }}>
                {role !== "CREATOR" || isCreator ? (
                    <Button onClick={handleEdit} variant="contained" sx={{ height: '40px'}}>
                        Edit
                    </Button>
                ) : (
                    <></>
                )}

                {userId !== user.id &&
                (isCreator || role === "MEMBER" || role === "ADVISOR") ? (
                    <Button onClick={handleKick} variant="contained" sx={{ height: '40px', marginLeft: '10px'}}>
                        Kick
                    </Button>
                ) : (
                    <></>
                )}
            </Box>
            <Dialog open={editState.editing} onClose={handleClose}>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <DialogContentText>Role Name</DialogContentText>
                    <TextField
                        value={editState.role_name}
                        onChange={handleType}
                        label="Role Name"
                    />
                    {!(isCreator && user.id === userId) && (
                        <Select
                            value={editState.role}
                            label="Role"
                            onChange={handleSelect}
                        >
                            <MenuItem value={"MEMBER"}>Member</MenuItem>
                            <MenuItem value={"ADVISOR"}>Advisor</MenuItem>
                            <MenuItem value={"ADMIN"}>Admin</MenuItem>
                        </Select>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSave}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminMember;
