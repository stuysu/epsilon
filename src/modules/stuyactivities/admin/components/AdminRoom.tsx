import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";

import { supabase } from "../../../../lib/supabaseClient";
import UserDialog from "../../../../components/ui/overlays/UserDialog";

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
        if (
            roomFloor === undefined ||
            roomFloor === null ||
            Number.isNaN(roomFloor)
        ) {
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
        if (!roomName) {
            enqueueSnackbar("Room name is required", { variant: "error" });
            return;
        }
        if (
            roomFloor === undefined ||
            roomFloor === null ||
            Number.isNaN(roomFloor)
        ) {
            enqueueSnackbar("Room floor is required", { variant: "error" });
            return;
        }

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
        <div className="gap-3 border-b border-divider flex h-12 justify-between w-full pb-3 items-center">
            <input
                value={roomName || ""}
                className="text text-typography-1 w-52 rounded-md px-3 h-9 bg-layer-1 outline-none"
                placeholder="Room name"
                onChange={(e) => {
                    setRoomName(e.target.value);
                    setIsChanged(true);
                }}
            />

            <input
                value={roomFloor ?? ""}
                className="text text-typography-1 rounded-md px-3 w-16 h-9 bg-layer-1 outline-none"
                placeholder="Floor"
                inputMode="numeric"
                onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setRoomFloor(Number.isNaN(v) ? (undefined as any) : v);
                    setIsChanged(true);
                }}
            />

            <div className="w-36 flex justify-center">
                <Checkbox
                    checked={roomApprovalRequired}
                    onChange={(e) => {
                        setRoomApprovalRequired(e.target.checked);
                        setIsChanged(true);
                    }}
                />
            </div>

            <FormControl className="w-96">
                <FormGroup row className={"flex justify-center"}>
                    {(
                        [
                            "MONDAY",
                            "TUESDAY",
                            "WEDNESDAY",
                            "THURSDAY",
                            "FRIDAY",
                        ] as Room["available_days"]
                    ).map((day) => (
                        <FormControlLabel
                            key={day}
                            control={
                                <Checkbox
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
                            label={day.slice(0, 2)}
                        />
                    ))}
                </FormGroup>
            </FormControl>

            <div className="flex items-center pr-2 w-24">
                {create ? (
                    <button
                        aria-label="Create room"
                        className="h-9 w-9 grid place-items-center rounded-md sm:hover:bg-layer-2"
                        onClick={createRoom}
                    >
                        <i className="bx bx-plus text-green text-xl" />
                    </button>
                ) : (
                    <>
                        <button
                            aria-label="Save room"
                            disabled={!isChanged}
                            className={`h-9 w-9 grid place-items-center rounded-md ${
                                isChanged
                                    ? "sm:hover:bg-layer-2"
                                    : "opacity-40 cursor-not-allowed"
                            }`}
                            onClick={saveRoom}
                        >
                            <i className="bx bx-save text-typography-1 text-xl" />
                        </button>
                        <button
                            aria-label="Delete room"
                            className="h-9 w-9 grid place-items-center rounded-md sm:hover:bg-layer-2"
                            onClick={() => setConfirm(true)}
                        >
                            <i className="bx bx-trash text-red text-xl" />
                        </button>
                    </>
                )}
            </div>

            <UserDialog
                title="Delete Room?"
                description={`Are you sure you want to delete room ${
                    roomName || "this room"
                }?`}
                imageSrc="/symbols/warning.png"
                onConfirm={deleteRoom}
                onClose={() => setConfirm(false)}
                open={confirm}
            />
        </div>
    );
};

export default AdminRoom;
