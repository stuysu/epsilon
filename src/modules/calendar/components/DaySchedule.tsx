import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ScheduleMeeting from "./ScheduleMeeting";
import { Dayjs } from "dayjs";
import { monthNames } from "../../../utils/TimeStrings";
import React from "react";

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
                    <div className={"px-5 pt-7 pb-20"}>
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <i className="bx bx-dots-horizontal-rounded bx-lg text-blue-500 mb-5"></i>
                            <Typography
                                variant="h1"
                                marginBottom={3}
                                align={"center"}
                            >
                                No Meetings Scheduled
                            </Typography>
                            <Typography variant="body1" align={"center"}>
                                {`No Activity meetings are taking place on ${monthNames[day.month()]} ${day.date()}.`}
                            </Typography>
                        </Box>
                    </div>
                )}
            </Stack>
        </Box>
    );
};

export default DaySchedule;
