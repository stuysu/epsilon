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
} from "@mui/material";
import { supabase } from "../../../../supabaseClient";
import { useSnackbar } from "notistack";

const AdminMember = ({
  id,
  userId,
  name,
  email,
  picture,
  role,
  role_name,
  isCreator,
}: {
  id: number;
  userId: number;
  name: string;
  email: string;
  picture?: string;
  role: string;
  role_name?: string;
  isCreator: boolean;
}) => {
  const user = useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();
  const [editState, setEditState] = useState({
    role: "",
    role_name: "",
    editing: false,
  });

  const handleEdit = () => {
    setEditState({
      role,
      role_name: "",
      editing: true,
    });
  };

  const handleKick = async () => {
    const { error } = await supabase.from("memberships").delete().eq("id", id);

    if (error) {
      enqueueSnackbar(
        "Could not kick member. Contact it@stuysu.org for support.",
        { variant: "error" }
      );
      return;
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
        { variant: "error" }
      );
      return;
    }

    enqueueSnackbar("Member updated!", { variant: "success" });
    handleClose();
  };

  return (
    <div>
      <p>
        {name} - {email} - role nickname: {role_name || "None"}, role: {role}
      </p>
      {role !== "CREATOR" || isCreator ? (
        <Button onClick={handleEdit} variant="contained">
          Edit
        </Button>
      ) : (
        <div></div>
      )}

      {userId !== user.id &&
      (isCreator || role === "MEMBER" || role === "ADVISOR") ? (
        <Button onClick={handleKick} variant="contained">
          Kick
        </Button>
      ) : (
        <div></div>
      )}
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
            <Select value={editState.role} label="Role" onChange={handleSelect}>
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
    </div>
  );
};

export default AdminMember;
