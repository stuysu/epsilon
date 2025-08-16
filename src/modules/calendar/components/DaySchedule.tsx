import { Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ScheduleMeeting from "./ScheduleMeeting";
import { Dayjs } from "dayjs";
import { monthNames } from "../../../utils/TimeStrings";
import React from "react";
import ContentUnavailable from "../../../components/ui/ContentUnavailable";

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
        <div className={"bg-layer-1 rounded-xl shadow-module p-1"}>
            <div className={"pl-5 py-3"}>
                <Typography>{`${monthNames[day.month()]} ${day.date()}`}</Typography>
            </div>
            <Stack
                component={motion.div}
                layout
                direction="column"
                spacing={0.3}
                borderRadius={2}
                overflow="hidden"
            >
                {meetings.length ? (
                    meetings
                        .sort(compareTimes)
                        .map((meeting, i) => (
                            <ScheduleMeeting meeting={meeting} key={i} />
                        ))
                ) : (
                    <ContentUnavailable
                        title={"Nothing to See!"}
                        description={`There are no public events taking place on ${monthNames[day.month()]} ${day.date()}.`}
                    ></ContentUnavailable>
                )}
            </Stack>
        </div>
    );
};

export default DaySchedule;
