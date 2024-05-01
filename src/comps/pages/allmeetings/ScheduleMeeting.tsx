import { useState } from "react";
import { Paper, Box, Button } from "@mui/material";
import dayjs from "dayjs";
import MeetingPreview from "../../ui/meetings/MeetingPreview";

type Props = {
    meeting: CalendarMeeting;
};

const ScheduleMeeting = ({ meeting }: Props) => {
    const [open, setOpen] = useState(false);
    let startTime = dayjs(meeting.start_time).format("LT");
    let endTime = dayjs(meeting.end_time).format("LT");

    return (
        <Paper
            elevation={1}
            sx={{
                width: "95%",
                height: "80px",
                borderRadius: "7px",
                marginBottom: "15px",
                padding: "10px",
                display: "flex",
                flexWrap: "nowrap",
            }}
        >
            <Box
                sx={{
                    width: "90%",
                    display: "flex",
                    flexWrap: "wrap",
                }}
            >
                <Box sx={{ width: "100%", height: "50%" }}>
                    <b>{meeting.organizations.name}</b> {startTime} - {endTime}
                </Box>
                <Box sx={{ width: "100%", height: "50%" }}>
                    <Box sx={{ width: "100%", height: "100%" }}>
                        {meeting.title}
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    width: "10%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: "10px",
                }}
            >
                <Button variant="contained" onClick={() => setOpen(true)}>
                    View
                </Button>
            </Box>
            <MeetingPreview
                id={meeting.id}
                title={meeting.title}
                open={open}
                isPublic={meeting.is_public}
                description={meeting.description}
                startTime={meeting.start_time}
                endTime={meeting.end_time}
                organizationPicture={meeting.organizations?.picture}
                organizationName={meeting.organizations?.name}
                roomName={meeting.rooms?.name}
                onClose={() => setOpen(false)}
            />
        </Paper>
    );
};

export default ScheduleMeeting;
