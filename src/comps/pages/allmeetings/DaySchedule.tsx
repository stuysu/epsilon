import { Box } from "@mui/material";
import { Dayjs } from "dayjs";

type Props = {
    day: Dayjs,
    meetings: CalendarMeeting[],
}

/* Schedule of meetings for a given day */
const DaySchedule = ({
    day,
    meetings
} : Props) => {
    return (
        <Box>

        </Box>
    )
}

export default DaySchedule;