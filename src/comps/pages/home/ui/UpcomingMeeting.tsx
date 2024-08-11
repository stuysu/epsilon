import {
    Box,
    Card,
    Typography,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
} from "@mui/material";
import { useState } from "react";
import MeetingPreview from "../../../ui/meetings/MeetingPreview";
import dayjs from "dayjs";
import AsyncButton from "../../../ui/AsyncButton";
import { daysOfWeek, monthNames } from "../../../../utils/TimeStrings";

const UpcomingMeeting = ({
    id,
    title,
    description,
    start_time,
    end_time,
    org_name,
    org_picture,
    room_name,
    is_public,
}: {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    org_name: string;
    org_picture: string;
    room_name?: string;
    is_public: boolean;
}) => {
    const [open, setOpen] = useState(false);

    let start = dayjs(start_time);
    let end = dayjs(end_time);

    return (
        <Box
            sx={{
                width: "100%",
                paddingLeft: "30px",
                paddingRight: "30px",
                paddingTop: "10px",
                paddingBottom: "10px",
            }}
        >
            <Card
                elevation={2}
                sx={{
                    width: "100%",
                    height: "300px",
                    padding: "20px",
                }}
            >
                <ListItem>
                    <ListItemAvatar>
                        <Avatar
                            alt={org_name}
                            src={org_picture || ""}
                            sx={{ objectFit: "cover" }}
                        >
                            {org_name.charAt(0).toUpperCase()}
                        </Avatar>
                    </ListItemAvatar>

                    <ListItemText primary={org_name} />
                </ListItem>
                <Box sx={{ height: "150px" }}>
                    <Typography variant="h3">{title}</Typography>
                    <Typography>
                        {daysOfWeek[start.day()]}, {monthNames[start.month()]}{" "}
                        {start.date()} {start.year()}, {start.format("LT")} to{" "}
                        {end.format("LT")} <br />
                        Location: {room_name || "Virtual"} <br />
                        {is_public ? "Public" : "Private"}
                    </Typography>
                </Box>
                <AsyncButton variant="contained" onClick={() => setOpen(true)}>
                    Show
                </AsyncButton>
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
};

export default UpcomingMeeting;
