import { Box, Button } from "@mui/material";
import dayjs from "dayjs";

type Props = {
    meeting: CalendarMeeting
}

const ScheduleMeeting = (
    {
        meeting
    } : Props
) => {
    let startTime = dayjs(meeting.start_time).format('LT');
    let endTime = dayjs(meeting.end_time).format('LT');

    return (
        <Box 
            sx={{ 
                width: "95%", 
                height: "80px", 
                boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px', 
                marginBottom: "15px", 
                padding: "10px",
                display: "flex",
                flexWrap: "nowrap"
            }}
        >
            <Box
                sx={{
                    width: "90%",
                    display: "flex",
                    flexWrap: "wrap"
                }}
            >
                <Box sx={{ width: "100%", height: "50%"}}><b>{meeting.organizations.name}</b> {startTime} - {endTime}</Box>
                <Box sx={{ width: "100%", height: "50%"}}>
                    <Box sx={{ width: "100%", height: "100%"}}>{meeting.title}</Box>
                </Box>
            </Box>
            <Box
                sx={{
                    width: "10%",
                    height: "100%",
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: "10px"
                }}
            >
                <Button variant="contained">
                    View
                </Button>
            </Box>
        </Box>
    )
}

export default ScheduleMeeting;