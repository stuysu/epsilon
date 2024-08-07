import { Box } from "@mui/material";
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
            sx={{
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                paddingLeft: "10px",
            }}
        >
            <Box sx={{ width: "100%" }}>
                <h1>{`${monthNames[day.month()]} ${day.date()}`}</h1>
            </Box>
            {meetings.length ? (
                meetings
                    .sort(compareTimes)
                    .map((meeting, i) => (
                        <ScheduleMeeting meeting={meeting} key={i} />
                    ))
            ) : (
                <h1>No Meetings</h1>
            )}
        </Box>
    );
};

export default DaySchedule;
