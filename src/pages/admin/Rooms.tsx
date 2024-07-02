import { Box, Typography, TextField, MenuItem, Button } from "@mui/material";
import { TimePicker, DatePicker } from "@mui/x-date-pickers";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSnackbar } from "notistack";
import AdminRoom from "../../comps/admin/AdminRoom";
import OrgSelector from "../../comps/admin/OrgSelector";

import dayjs, { Dayjs } from "dayjs";

type ApiRoom = {
    id: number;
    name: string;
    floor?: number;
    approval_required: boolean;
    available_days: string;
    comments?: string;
}

const getDefaultTime = () => {
    return dayjs().startOf("day").hour(15).minute(45);
};

const Rooms = () => {
    const [rooms, setRooms] = useState<ApiRoom[]>([]);
    const { enqueueSnackbar } = useSnackbar()

    /* force reservation data */
    const [forceOrgId, setForceOrgId] = useState<number | undefined>();
    const [forceOrgName, setForceOrgName] = useState<string | undefined>();
    const [forceRoomId, setForceRoomId] = useState<number | undefined>();
    const [allRooms, setAllRooms] = useState<ApiRoom[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    /* date inputs */
    const [startTime, setStartTime] = useState<Dayjs | null>(
        getDefaultTime(),
    );
    const [endTime, setEndTime] = useState<Dayjs | null>(
        getDefaultTime(),
    );

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

        const fetchAllRooms = async () => {
            const { data: roomData, error: roomFetchError } = await supabase.from("rooms")
                .select("*")
                .returns<ApiRoom[]>();
            
            if (roomFetchError || !roomData) {
                enqueueSnackbar("Failed to fetch rooms", { variant: "error" });
                return;
            }

            setAllRooms(prev => {
                setLoading(false);

                if (roomData.length) {
                    setForceRoomId(roomData[0].id);
                }

                return roomData;
            });
        }

        fetchRooms();
        fetchAllRooms();
    }, []);

    const forceReserve = async () => {
        const { error: reserveError } = await supabase.functions.invoke(
            'force-reserve', 
            {
                body: {
                    room_id: forceRoomId,
                    organization_id: forceOrgId,
                    start_time: startTime?.toISOString(),
                    end_time: endTime?.toISOString(),
                }
            }
        )

        if (reserveError) {
            enqueueSnackbar("Failed to force reserve room", { variant: "error" });
            return;
        }

        enqueueSnackbar("Room reserved successfully", { variant: "success" });
        
        /* reset state */
        setForceOrgId(undefined);
        setForceOrgName(undefined);
        setStartTime(getDefaultTime());
        setEndTime(getDefaultTime());
    }

    return (
        <Box>
            <Typography variant="h1" width="100%" align="center">Rooms</Typography>
            
            <Box sx={{ width: "100%",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "auto",
                        padding: "10px" }}>
                
                <Typography variant="h2" width="100%" align="center">Force Reservation</Typography>
                <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <OrgSelector 
                        onSelect={(orgId, orgName) => {
                            setForceOrgId(orgId);
                            setForceOrgName(orgName);
                        }}
                    />
                </Box>
                {forceOrgId && (
                    <Box sx={{ maxWidth: "600px", width: "100%", marginTop: "10px" }}>
                        <Typography variant="h4" width="100%">Force Reserve for {forceOrgName}:</Typography>
                        <DatePicker
                            label="Meeting Day"
                            value={startTime}
                            onChange={(newStartTime) => {
                                if (!newStartTime) return;

                                setStartTime(newStartTime);

                                // also change day of end time
                                if (!endTime) {
                                    setEndTime(newStartTime);
                                } else {
                                    setEndTime(
                                        endTime
                                            ?.year(newStartTime.year())
                                            .month(newStartTime.month())
                                            .date(newStartTime.date()),
                                    );
                                }
                            }}
                            sx={{
                                width: "100%",
                                marginTop: "10px",
                                marginBottom: "10px",
                            }}
                        />
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                flexWrap: "nowrap",
                                alignItems: "center",
                            }}
                        >
                            <TimePicker
                                label="Start"
                                value={startTime}
                                onChange={setStartTime}
                                sx={{ marginRight: "10px" }}
                            />

                            <TimePicker
                                label="End"
                                value={endTime}
                                onChange={setEndTime}
                            />
                            <TextField
                                value={!loading ? String(forceRoomId) : ""}
                                label="Room"
                                select
                                onChange={(event) =>
                                    setForceRoomId(Number(event.target.value) || undefined)
                                }
                                sx={{
                                    width: "30%",
                                    height: "60px",
                                    marginLeft: "10px",
                                }}
                            >
                                {allRooms.map((room) => (
                                    <MenuItem key={room.id} value={String(room.id)}>
                                        {room.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Button
                            onClick={forceReserve} 
                            sx={{ width: "100%", marginTop: "10px"}} 
                            variant="outlined"
                        >
                            Force Reservation
                        </Button>
                    </Box>)
                }
            </Box>
            
            <Typography variant="h2" width="100%" align="center" sx={{ marginTop: "20px" }}>Manage Rooms</Typography>
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