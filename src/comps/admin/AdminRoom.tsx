import { 
    Box, 
    Button, 
    TextField,
    FormGroup,
    FormControlLabel,
    Checkbox,
    FormHelperText, 
    FormControl,
    FormLabel,
    Card
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";

import { supabase } from "../../supabaseClient";

const AdminRoom = (
    {
        roomId,
        name,
        floor,
        availableDays,
        comments,
        approvalRequired
    } :
    {
        roomId: number,
        name: string,
        floor?: number,
        availableDays: Room['available_days'],
        comments?: string,
        approvalRequired: boolean
    }
) => {
    const { enqueueSnackbar } = useSnackbar();

    const [roomName, setRoomName] = useState(name);
    const [roomFloor, setRoomFloor] = useState(floor);
    const [roomAvailableDays, setRoomAvailableDays] = useState(availableDays);
    const [roomApprovalRequired, setRoomApprovalRequired] = useState(approvalRequired);

    const [isChanged, setIsChanged] = useState(false);

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
                    approval_required: roomApprovalRequired
                }
            }
        );

        if (saveError) {
            enqueueSnackbar("Failed to save room", { variant: "error" });
            return;
        }

        setIsChanged(false);
        enqueueSnackbar(`Room ${roomName} saved!`, { variant: "success" });
    }

    return (
        <Card sx={{ width: "600px", display: "flex", flexWrap: "wrap", padding: "25px", margin: "15px"}}>
            <Box sx={{ width: "100%", display: "flex" }}>
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
                    value={roomFloor}
                    onChange={(e) => {
                        setRoomFloor(parseInt(e.target.value));
                        setIsChanged(true);
                    }}
                />
            </Box>

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
                    {
                        (["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as Room['available_days'])
                            .map((day, i) => 
                                (
                                    <FormControlLabel
                                        control={
                                            <Checkbox 
                                                key={i}
                                                
                                                checked={roomAvailableDays?.includes(day)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setRoomAvailableDays([...roomAvailableDays, day]);
                                                    } else {
                                                        setRoomAvailableDays(roomAvailableDays.filter((d) => d !== day));
                                                    }

                                                    setIsChanged(true);
                                                }}
                                            />
                                        }
                                        label={day}
                                    />
                                )
                            )
                    }
                </FormGroup>
            </FormControl>

            <Button onClick={saveRoom} disabled={!isChanged} variant="contained">
                Save
            </Button>
                
            
        </Card>
    )
}

export default AdminRoom;