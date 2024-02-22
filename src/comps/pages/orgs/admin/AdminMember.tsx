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
    DialogActions
} from "@mui/material";
import { supabase } from "../../../../supabaseClient";

const capitalize = (s: string): string => { return s.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ") }

const AdminMember = (
    { id, name, email, picture, role, role_name, isCreator } :
    { 
        id: number, 
        name: string, 
        email: string, 
        picture: string | undefined, 
        role: string, 
        role_name: string | undefined, 
        isCreator: boolean
    }
) => {
    const user = useContext(UserContext);
    const [editState, setEditState] = useState({
        role: "",
        role_name: "",
        editing: false
    })

    const handleEdit = () => {
        setEditState({ role, role_name: role_name || capitalize(role), editing: true })
    }

    const handleKick = async () => {
        const { error } = await supabase
            .from('memberships')
            .delete()
            .eq('id', id)
        
        if (error) {
            user.setMessage("Could not kick member. Contact it@stuysu.org for support.");
            return;
        }

        user.setMessage("Member kicked!")
    }

    const handleSelect = (event: SelectChangeEvent) => {
        setEditState({
            ...editState,
            role: event.target.value
        })
    }

    const handleType = (event: ChangeEvent<HTMLInputElement>) => {
        setEditState({
            ...editState,
            role_name: event.target.value
        })
    }

    const handleClose = () => {
        setEditState({
            role: "",
            role_name: "",
            editing: false
        })
    }

    const handleSave = async () => {
        const { error } = await supabase
            .from('memberships')
            .update({ role: editState.role, role_name: editState.role_name })
            .eq('id', id)

        if (error) {
            user.setMessage("Could not update member. Contact it@stuysu.org for support.");
            return;
        }

        user.setMessage("Member updated!")
        handleClose()
    }

    return (
        <div>
            <p>{name} - {email} - role name: {role_name}, role: {role}</p>
            {
                (role !== 'CREATOR' || isCreator) ?
                (
                    <Button onClick={handleEdit} variant='contained'>Edit</Button>
                )
                :
                (
                    <div></div>
                )
            }
            
            {
                (
                    (id !== user.id) &&
                    (
                        (
                            isCreator
                        ) ||
                        (
                            role == 'MEMBER' || role == 'ADVISOR'
                        )
                    )
                ) ? (<Button onClick={handleKick} variant='contained'>Kick</Button>) : (<div></div>)
            }
            <Dialog
                open={editState.editing}
                onClose={handleClose}
            >
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <DialogContentText>Role Name</DialogContentText>
                    <TextField 
                        value={editState.role_name} 
                        onChange={handleType} 
                        label="Role Name"
                    />
                    {(isCreator && id === user.id) ? 
                        (<div></div>) :
                        (
                            <Select
                                value={editState.role}
                                label='Role'
                                onChange={handleSelect}
                            >
                                <MenuItem value={'MEMBER'}>Member</MenuItem>
                                <MenuItem value={'ADVISOR'}>Advisor</MenuItem>
                                <MenuItem value={'ADMIN'}>Admin</MenuItem>
                            </Select>
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' onClick={handleClose}>Cancel</Button>
                    <Button variant='contained' onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default AdminMember;