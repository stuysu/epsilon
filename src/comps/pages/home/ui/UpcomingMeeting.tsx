import { Box, Button, Card, Typography } from "@mui/material";
import { useState } from "react";
import MeetingPreview from "../../../ui/meetings/MeetingPreview";

const UpcomingMeeting = (
    {
        id,
        title,
        description,
        start_time,
        end_time,
        org_name,
        org_picture,
        room_name,
        is_public
    } :
    {
        id: number;
        title: string;
        description: string;
        start_time: string;
        end_time: string;
        org_name: string;
        org_picture: string;
        room_name?: string;
        is_public: boolean;
    }
) => {

    const [open, setOpen] = useState(false);

    return (
        <Box sx={{ width: "100%", padding: "20px"}}>
            <Card
                elevation={2}
                sx={{
                    width: "100%",
                    height: "250px",
                    padding: "20px"
                }}
            >
                <Box>
                    <Typography variant="h2">{org_name}</Typography>
                </Box>
                <Box>
                    <Box>
                        {title}
                    </Box>
                    <Box>
                        {start_time} - {end_time}
                    </Box>
                </Box>
                <Button variant="contained" onClick={() => setOpen(true)}>Show</Button>
                <MeetingPreview
                    id={id}
                    title={title}
                    open={open}
                    isPublic={is_public}
                    description={description}
                    startTime={start_time}
                    endTime={end_time}
                    organizationPicture={org_picture}
                    organizationName={org_name}
                    roomName={room_name}
                    onClose={() => setOpen(false)}
                />
            </Card>
        </Box>
    );
}

export default UpcomingMeeting;