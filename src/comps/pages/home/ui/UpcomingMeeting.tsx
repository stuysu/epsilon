import {
    Avatar,
    Box,
    Chip,
    ListItem,
    ListItemAvatar,
    Typography,
} from "@mui/material";
import { useState } from "react";
import MeetingPreview from "../../../ui/meetings/MeetingPreview";
import dayjs from "dayjs";
import { monthNames } from "../../../../utils/TimeStrings";

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
    sx,
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
    sx?: object;
}) => {
    const [open, setOpen] = useState(false);

    let start = dayjs(start_time);
    let end = dayjs(end_time);

    return (
        <Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    backgroundColor: "#36363650",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "background-color 0.1s ease-in-out",
                    "&:hover": {
                        backgroundColor: "#4d4d4d50",
                    },
                }}
            >
                <ListItem
                    onClick={() => setOpen(true)}
                    sx={{
                        padding: "20px 25px",
                        display: "flex",
                        flexDirection: "row",
                        cursor: "pointer",
                        justifyContent: "space-between",
                        ...sx,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar
                                alt={org_name}
                                src={org_picture || ""}
                                sx={{ objectFit: "cover", borderRadius: "5px" }}
                            >
                                {org_name.charAt(0).toUpperCase()}
                            </Avatar>
                        </ListItemAvatar>

                        <div>
                            <div className={"relative top-0.5"}>
                                <Typography variant={"h4"}>{title}</Typography>
                                <Typography variant={"body1"}>
                                    {org_name}
                                </Typography>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {is_public ? "Public" : "Private"}
                        <Chip
                            label={`${monthNames[start.month()]} ${start.date()}, ${start.year()}`}
                        />
                        <Chip
                            label={`${start.format("LT")} to ${end.format("LT")}`}
                        />
                    </div>
                </ListItem>
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
            </Box>
        </Box>
    );
};

export default UpcomingMeeting;
