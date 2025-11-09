import { Stack } from "@mui/material";
import { motion } from "framer-motion";
import { Dayjs } from "dayjs";
import { monthNames } from "../../../utils/TimeStrings";
import React, { useEffect, useState } from "react";
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

const getRoomNameKey = (roomName?: string) => {
    if (!roomName) return { isVirtualOrUnknown: true, normalized: "" };
    const name = String(roomName).trim();
    if (/^virtual$/i.test(name) || /virtual/i.test(name)) {
        // if room is virtual, send to bottom
        return { isVirtualOrUnknown: true, normalized: "" };
    }
    return { isVirtualOrUnknown: false, normalized: name.toLowerCase() };
};

const compareByRoomNameThenTime = (a: CalendarMeeting, b: CalendarMeeting) => {
    const ra = getRoomNameKey(a.rooms?.name);
    const rb = getRoomNameKey(b.rooms?.name);

    if (ra.isVirtualOrUnknown && rb.isVirtualOrUnknown) {
        return compareTimes(a, b);
    }

    if (ra.isVirtualOrUnknown) return 1;
    if (rb.isVirtualOrUnknown) return -1;

    const cmp = ra.normalized.localeCompare(rb.normalized);
    if (cmp !== 0) return cmp;

    return compareTimes(a, b);
};

/* Schedule of meetings for a given day */
const DaySchedule = ({ day, meetings }: Props) => {
    const STORAGE_KEY = "epsilon_daySchedule_sortDesc";
    const [sortDesc, setSortDesc] = useState<boolean>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === "true";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, sortDesc ? "true" : "false");
        } catch {}
    }, [sortDesc]);

    const toggleSort = () => setSortDesc((s) => !s);

    const sortedMeetings = React.useMemo(() => {
        const copy = meetings.slice();

        const keyed = copy.map((m) => ({
            m,
            key: getRoomNameKey(m.rooms?.name),
        }));

        const virtualItems = keyed
            .filter((k) => k.key.isVirtualOrUnknown)
            .map((k) => k.m);
        const nonVirtualItems = keyed
            .filter((k) => !k.key.isVirtualOrUnknown)
            .map((k) => k.m);

        nonVirtualItems.sort(compareByRoomNameThenTime);
        if (sortDesc) nonVirtualItems.reverse();

        virtualItems.sort(compareTimes);

        return [...nonVirtualItems, ...virtualItems];
    }, [meetings, sortDesc]);

    return (
        <div className={"bg-layer-1 rounded-xl shadow-prominent p-1"}>
            <div className={"flex items-center justify-between pl-5 py-3.5"}>
                <h4 className="m-0">{`${monthNames[day.month()]} ${day.date()}`}</h4>
                <div className="mr-4">
                    <button
                        type="button"
                        onClick={toggleSort}
                        aria-pressed={sortDesc}
                        aria-label={`Sort meetings by room name ${sortDesc ? "descending" : "ascending"}`}
                        title={`Sort ${sortDesc ? "descending" : "ascending"}`}
                        className={
                            "px-2 py-1 rounded bg-transparent hover:bg-layer-2 focus:outline-none flex items-center"
                        }
                    >
                        <span className="font-semibold text-base">Room</span>
                        <span
                            className="ml-2 text-2xl leading-none"
                            aria-hidden="true"
                        >
                            <i
                                className={`bx ${
                                    sortDesc
                                        ? "bx-down-arrow-alt"
                                        : "bx-up-arrow-alt"
                                }`}
                                aria-hidden="true"
                            />
                        </span>
                    </button>
                </div>
            </div>

            <Stack
                component={motion.div}
                layout
                direction="column"
                spacing={0.3}
                borderRadius={2}
                overflow="hidden"
            >
                {sortedMeetings.length ? (
                    sortedMeetings.map((meeting, i) => (
                        <UpcomingMeeting
                            key={meeting.id ?? i}
                            id={meeting.id ?? i}
                            url={meeting.organizations?.url}
                            title={meeting.title}
                            description={meeting.description}
                            start_time={meeting.start_time}
                            end_time={meeting.end_time}
                            org_name={meeting.organizations?.name}
                            org_picture={meeting.organizations?.picture}
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
