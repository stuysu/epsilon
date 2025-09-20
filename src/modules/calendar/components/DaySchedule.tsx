import { Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Dayjs } from "dayjs";
import { monthNames } from "../../../utils/TimeStrings";
import React from "react";
import ContentUnavailable from "../../../components/ui/content/ContentUnavailable";
import UpcomingMeeting from "../../home/components/UpcomingMeeting";

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
        <div className={"bg-layer-1 rounded-xl shadow-prominent p-1"}>
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
                            <UpcomingMeeting
                                id={i}
                                url={meeting.organizations.url}
                                title={meeting.title}
                                description={meeting.description}
                                start_time={meeting.start_time}
                                end_time={meeting.end_time}
                                org_name={meeting.organizations.name}
                                org_picture={meeting.organizations.picture}
                                is_public={meeting.is_public}
                                room_name={meeting.rooms?.name}
                            ></UpcomingMeeting>
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
