import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from "@mui/material";

import { Close } from "@mui/icons-material";

import dayjs from "dayjs";
import { daysOfWeek, monthNames } from "../../../utils/TimeStrings";

type Props = {
    id?: number;
    url?: string;
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

const MeetingPreview = ({
    id,
    url,
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
            <DialogTitle variant="h2" color={"secondary"}>
                <a
                    href={url}
                    className={
                        "hover:opacity-75 transition-opacity cursor-alias"
                    }
                >
                    {organizationName || "Untitled Organization"}
                </a>
            </DialogTitle>
            <IconButton
                sx={{
                    position: "absolute",
                    right: 8,
                    top: 10,
                }}
                onClick={onClose}
            >
                <Close />
            </IconButton>
            <DialogContent dividers>
                <Typography variant="h1">
                    {title || "Untitled Meeting"}
                </Typography>
                <div
                    className={
                        "bg-neutral-600 bg-opacity-30 rounded-xl py-3 px-5 mt-5 -mx-5"
                    }
                >
                    <Typography className={"relative top-0.5"}>
                        {daysOfWeek[start.day()]}, {monthNames[start.month()]}{" "}
                        {start.date()} {start.year()}, {start.format("LT")} to{" "}
                        {end.format("LT")} <br />
                        Location: {roomName || "Virtual"} <br />
                        {isPublic ? "Public Meeting" : "Private Meeting"}
                    </Typography>
                </div>
                <Typography sx={{ marginTop: "20px", marginBottom: "10px" }}>
                    {description || "No Description"}
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default MeetingPreview;
