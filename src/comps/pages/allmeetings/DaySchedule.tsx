import { Box, Stack, Typography } from "@mui/material";
import ScheduleMeeting from "./ScheduleMeeting";
import { Dayjs } from "dayjs";
import { monthNames } from "../../../utils/TimeStrings";

type Props = {
    day: Dayjs;
    meetings: CalendarMeeting[];
};

function compareTimes(a: CalendarMeeting, b: CalendarMeeting) {
    if (a.start_time < b.start_time) {
        return -1;
    } else if (a.start_time > b.start_time) {
        return 1;
    }

    return 0;
}

/* Schedule of meetings for a given day */
const DaySchedule = ({ day, meetings }: Props) => {
    return (
        <Box
            bgcolor="#1f1f1f80"
            padding={0.5}
            borderRadius={3}
            marginBottom={10}
            boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
            sx={{ position: "relative" }}
        >
            <Stack
                direction="column"
                spacing={0.3}
                borderRadius={2}
                overflow="hidden"
            >
                <div className={"pl-5 py-3"}>
                    <Typography>{`${monthNames[day.month()]} ${day.date()}`}</Typography>
                </div>
                {meetings.length ? (
                    meetings
                        .sort(compareTimes)
                        .map((meeting, i) => (
                            <ScheduleMeeting meeting={meeting} key={i} />
                        ))
                ) : (
                    <h1>No Meetings</h1>
                )}
            </Stack>
        </Box>
    );
};

export default DaySchedule;
