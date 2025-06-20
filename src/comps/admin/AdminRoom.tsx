import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    TextField,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";

import { supabase } from "../../supabaseClient";
import AsyncButton from "../ui/AsyncButton";
import ConfirmationDialog from "../ui/ConfirmationDialog";

const AdminRoom = ({
    roomId,
    name,
    floor,
    availableDays,
    comments,
    approvalRequired,
    onDelete,
    create,
    onCreate,
}: {
    roomId?: number;
    name?: string;
    floor?: number;
    availableDays?: Room["available_days"];
    comments?: string;
    approvalRequired?: boolean;
    onDelete?: () => void;
    create?: boolean;
    onCreate?: (room: {
        name: string;
        floor: number;
        available_days: string;
        comments: string;
        approval_required: boolean;
    }) => void;
}) => {
    const { enqueueSnackbar } = useSnackbar();

    const [roomName, setRoomName] = useState(name);
    const [roomFloor, setRoomFloor] = useState(floor);
    const [roomAvailableDays, setRoomAvailableDays] = useState(
        availableDays || [],
    );
    const [roomApprovalRequired, setRoomApprovalRequired] =
        useState(approvalRequired);

    const [isChanged, setIsChanged] = useState(false);

    const [confirm, setConfirm] = useState(false);

    const saveRoom = async () => {
        if (!isChanged) return;

        if (!roomName) {
            enqueueSnackbar("Room name is required", { variant: "error" });
            return;
        }

        if (!roomFloor) {
            enqueueSnackbar("Room floor is required", { variant: "error" });
            return;
        }

        const { error: saveError } = await supabase.functions.invoke(
            "update-room",
            {
                body: {
                    room_id: roomId,
                    name: roomName,
                    floor: roomFloor,
                    available_days: roomAvailableDays,
                    comments,
                    approval_required: roomApprovalRequired,
                },
            },
        );

        if (saveError) {
            enqueueSnackbar("Failed to save room", { variant: "error" });
            return;
        }

        setIsChanged(false);
        enqueueSnackbar(`Room ${roomName} saved!`, { variant: "success" });
    };

    const deleteRoom = async () => {
        const { error: deleteError } = await supabase.functions.invoke(
            "delete-room",
            {
                body: {
                    room_id: roomId,
                },
            },
        );

        if (deleteError) {
            enqueueSnackbar("Failed to delete room", { variant: "error" });
            return;
        }

        enqueueSnackbar(`Room ${roomName} deleted!`, { variant: "success" });

        if (onDelete) onDelete();
    };

    const createRoom = async () => {
        const { error: createError } = await supabase.from("rooms").insert({
            name: roomName,
            floor: roomFloor,
            available_days: roomAvailableDays.join(", "),
            comments,
            approval_required: roomApprovalRequired,
        });
        if (createError) {
            enqueueSnackbar("Failed to create room", { variant: "error" });
            return;
        }

        enqueueSnackbar(`Room ${roomName} created!`, { variant: "success" });
        if (onCreate) {
            onCreate({
                name: roomName || "",
                floor: roomFloor || -1,
                available_days: roomAvailableDays.join(", "),
                comments: "",
                approval_required: roomApprovalRequired || false,
            });
        }
    };

    return (
        <div
            className={"w-96 flex flex-wrap p-7 m-4 bg-neutral-800 rounded-md"}
        >
            <div className={"w-full flex"}>
                <TextField
                    sx={{ width: "50%", marginRight: "10px" }}
                    label="Room Name"
                    value={roomName}
                    onChange={(e) => {
                        setRoomName(e.target.value);
                        setIsChanged(true);
                    }}
                />

                <TextField
                    sx={{ width: "50%" }}
                    label="Floor"
                    value={roomFloor || ""}
                    onChange={(e) => {
                        setRoomFloor(parseInt(e.target.value));
                        setIsChanged(true);
                    }}
                />
            </div>

            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={roomApprovalRequired}
                            onChange={(e) => {
                                setRoomApprovalRequired(e.target.checked);
                                setIsChanged(true);
                            }}
                        />
                    }
                    label={"Approval Required?"}
                />
            </FormGroup>

            <FormControl>
                <FormLabel>Available Days</FormLabel>
                <FormGroup row>
                    {(
                        [
                            "MONDAY",
                            "TUESDAY",
                            "WEDNESDAY",
                            "THURSDAY",
                            "FRIDAY",
                        ] as Room["available_days"]
                    ).map((day, i) => (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    key={i}
                                    checked={roomAvailableDays?.includes(day)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setRoomAvailableDays([
                                                ...roomAvailableDays,
                                                day,
                                            ]);
                                        } else {
                                            setRoomAvailableDays(
                                                roomAvailableDays?.filter(
                                                    (d) => d !== day,
                                                ),
                                            );
                                        }

                                        setIsChanged(true);
                                    }}
                                />
                            }
                            label={day}
                        />
                    ))}
                </FormGroup>
            </FormControl>

            <div className={"w-full pl-2.5"}>
                {create ? (
                    <AsyncButton onClick={createRoom} variant="contained">
                        Create
                    </AsyncButton>
                ) : (
                    <>
                        <AsyncButton
                            onClick={saveRoom}
                            disabled={!isChanged}
                            variant="contained"
                            sx={{ marginRight: "10px" }}
                        >
                            Save
                        </AsyncButton>
                        <AsyncButton
                            onClick={() => setConfirm(true)}
                            variant="contained"
                            color="error"
                        >
                            Delete
                        </AsyncButton>
                    </>
                )}
            </div>

            <ConfirmationDialog
                title="Delete Room?"
                description={`Are you sure you want to delete ${roomName}?`}
                onConfirm={deleteRoom}
                onClose={() => setConfirm(false)}
                open={confirm}
            />
        </div>
    );
};

export default AdminRoom;
