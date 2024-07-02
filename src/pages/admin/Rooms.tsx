import { Box, Card, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSnackbar } from "notistack";
import AdminRoom from "../../comps/admin/AdminRoom";

type ApiRoom = {
    id: number;
    name: string;
    floor?: number;
    approval_required: boolean;
    available_days: string;
    comments?: string;
}

const Rooms = () => {
    const [rooms, setRooms] = useState<ApiRoom[]>([]);
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        const fetchRooms = async () => {
            const { data: roomData, error: roomFetchError } = await supabase.from("rooms")
                .select("*")
                .returns<ApiRoom[]>();
            
            if (roomFetchError || !roomData) {
                enqueueSnackbar("Failed to fetch rooms", { variant: "error" });
                return;
            }

            setRooms(roomData);
        }

        fetchRooms();
    }, []);

    return (
        <Box>
            <Typography variant="h1" width="100%" align="center">Rooms</Typography>
            
            <AdminRoom

                create 
                onCreate={(room) => setRooms([...rooms, room as ApiRoom])}
            />
            <Box sx={{ width: "100%", display: 'flex', flexWrap: "wrap" }}>
                {
                    rooms.map((room) => (
                        <AdminRoom
                            key={room.id} 
                            roomId={room.id}
                            name={room.name}
                            floor={room.floor as number}
                            availableDays={room.available_days.split(", ") as Room['available_days']}
                            comments={room.comments}
                            approvalRequired={room.approval_required}
                            onDelete={() => setRooms(rooms.filter(r => r.id !== room.id))}
                        />
                    ))
                }
            </Box>
        </Box>
    )
}

export default Rooms;