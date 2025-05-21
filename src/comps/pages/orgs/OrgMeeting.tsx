import { Box, Chip, Stack, Typography } from "@mui/material";

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
        <div style={{ width: "100%" }}>
            <Stack
                onClick={() => setOpen(true)}
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                sx={{
                    background: "#36363680",
                    transition: "background-color 0.1s ease-in-out",
                    "&:hover": {
                    backgroundColor: "#4d4d4d80"
                },
                    }}
                padding={3}
            >
                <Box sx={{ width: "100%" }}>
                    <Typography variant="h4">{title}</Typography>
                    <Typography>
                        {startTime} to {endTime}
                    </Typography>
                </Box>
                <Stack direction={"row"} gap={1}>
                    <Chip label={"Room " + room_name || "Virtual"}></Chip>
                    {is_public ? (
                        <Chip label="Public"></Chip>
                    ) : (
                        <Chip label="Private"></Chip>
                    )}
                </Stack>
                <Box>
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
            </Stack>
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
        </div>
    );
};

export default OrgMeeting;
