import { Box, Paper, Typography } from "@mui/material";

import { useState } from "react";
import dayjs from "dayjs";

import MeetingPreview from "../../ui/meetings/MeetingPreview";
import AsyncButton from "../../ui/AsyncButton";

type Props = {
    id?: number;
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    is_public?: boolean;
    room_name?: string;
    org_name?: string;
    org_picture?: string;
    isMobile?: boolean;
    onlyUpcoming?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
};

const OrgMeeting = ({
    id,
    title,
    description,
    start_time,
    end_time,
    is_public,
    room_name,
    org_name,
    org_picture,
    isMobile,
    onlyUpcoming,
    onEdit,
    onDelete,
}: Props) => {
    const [open, setOpen] = useState(false);
    let startTime = dayjs(start_time).format("L LT");
    let endTime = dayjs(end_time).format("LT");
    let today = dayjs().startOf("day");

    if (onlyUpcoming && today.isAfter(dayjs(start_time))) {
        return <></>;
    }

    return (
        <Paper
            elevation={1}
            sx={{
                maxWidth: isMobile ? "100vw" : "450px",
                width: isMobile ? "100%" : "50%",
                height: "225px",
                borderRadius: "7px",
                marginBottom: "15px",
                padding: "10px",
                paddingLeft: "20px",
                display: "flex",
                flexWrap: "wrap",
                margin: "10px",
            }}
        >
            <Box sx={{ width: "100%", height: "165px" }}>
                <Typography variant="h5">{title}</Typography>
                <Typography>
                    {startTime} to {endTime}
                </Typography>
                <Typography>Location: {room_name || "Virtual"}</Typography>
                {is_public ? (
                    <Typography>Public</Typography>
                ) : (
                    <Typography>Private</Typography>
                )}
            </Box>
            <Box sx={{ height: "60px", width: "100%" }}>
                <AsyncButton variant="contained" onClick={() => setOpen(true)}>
                    View More
                </AsyncButton>
                {onEdit && (
                    <AsyncButton
                        variant="contained"
                        onClick={onEdit}
                        sx={{ marginLeft: "10px" }}
                    >
                        Edit
                    </AsyncButton>
                )}
                {onDelete && (
                    <AsyncButton
                        variant="contained"
                        onClick={onDelete}
                        sx={{ marginLeft: "10px" }}
                    >
                        Delete
                    </AsyncButton>
                )}
            </Box>
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
        </Paper>
    );
};

export default OrgMeeting;
