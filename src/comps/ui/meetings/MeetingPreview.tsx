import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Button,
    IconButton,
} from "@mui/material";

import { Close } from "@mui/icons-material";

import dayjs from "dayjs";

type Props = {
    id?: number;
    title?: string;
    open: boolean;
    isPublic?: boolean;
    description?: string;
    startTime?: string;
    endTime?: string;
    organizationPicture?: string;
    organizationName?: string;
    roomName?: string;
    onClose: () => void;
};

const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "October",
    "September",
    "November",
    "December",
];

const MeetingPreview = ({
    id,
    title,
    open,
    isPublic,
    description,
    startTime,
    endTime,
    organizationPicture,
    organizationName,
    roomName,
    onClose,
}: Props) => {
    let start = dayjs(startTime);
    let end = dayjs(endTime);

    return (
        <Dialog open={open}>
            <DialogTitle variant="h2">{organizationName || "Untitled Organization"}</DialogTitle>
            <IconButton
                sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                }}
                onClick={onClose}
            >
                <Close />
            </IconButton>
            <DialogContent dividers>
                <Typography variant="h1" align="center">
                    {title || "Untitled Meeting"}
                </Typography>
                <Typography color="secondary.main" align="center">
                    {daysOfWeek[start.day()]}, {monthNames[start.month()]}{" "}
                    {start.date()} {start.year()}, {start.format("LT")} to{" "}
                    {end.format("LT")} <br />
                    Location: {roomName || "Virtual"} <br />
                    {isPublic ? "Public" : "Private"}
                </Typography>
                <Typography align="center" sx={{ marginTop: "20px" }}>
                    {description || "No Description"}
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default MeetingPreview;
