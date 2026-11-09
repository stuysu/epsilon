import { motion } from "framer-motion";
import { Dayjs } from "dayjs";
import { monthNames } from "../../../utils/TimeStrings";
import React, { useEffect, useState } from "react";
import ContentUnavailable from "../../../components/ui/content/ContentUnavailable";
import AsyncButton from "../../../components/ui/buttons/AsyncButton";
import Skeleton from "../../../components/ui/Skeleton";
import UpcomingMeeting from "../../home/components/UpcomingMeeting";
import { sortRooms } from "../../../utils/DataFormatters";

type Props = {
    day: Dayjs;
    // undefined while the day loads
    meetings?: CalendarMeeting[];
    failed?: boolean;
    onRetry?: () => void;
};

function compareTimes(a: CalendarMeeting, b: CalendarMeeting) {
    if (a.start_time < b.start_time) {
        return -1;
    } else if (a.start_time > b.start_time) {
        return 1;
    }

    return 0;
}

/* virtual meetings and meetings without a room are listed after the rest */
const isVirtualOrUnknown = (roomName?: string) =>
    !roomName || /virtual/i.test(roomName.trim());

/* rooms in order (reversed when descending), earliest meeting first within a room */
export const sortMeetingsByRoom = (
    meetings: CalendarMeeting[],
    descending: boolean,
) => {
    const inRooms = meetings.filter((m) => !isVirtualOrUnknown(m.rooms?.name));
    const virtual = meetings.filter((m) => isVirtualOrUnknown(m.rooms?.name));

    inRooms.sort((a, b) => {
        const byRoom = sortRooms(a.rooms, b.rooms);
        if (byRoom) return descending ? -byRoom : byRoom;
        return compareTimes(a, b);
    });
    virtual.sort(compareTimes);

    return [...inRooms, ...virtual];
};

/* Schedule of meetings for a given day */
const DaySchedule = ({ day, meetings, failed, onRetry }: Props) => {
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

    const sortedMeetings = React.useMemo(
        () => sortMeetingsByRoom(meetings ?? [], sortDesc),
        [meetings, sortDesc],
    );

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
                            "px-2 py-1 rounded bg-transparent hover:bg-layer-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1 flex items-center"
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

            <motion.div
                layout
                className="flex flex-col gap-[2.4px] overflow-hidden rounded-lg"
                aria-busy={!meetings && !failed}
            >
                {failed ? (
                    <ContentUnavailable
                        headingLevel="h2"
                        icon="bx-error-circle"
                        iconColor="text-red"
                        title="Meetings could not load"
                        description={`Meetings for ${monthNames[day.month()]} ${day.date()} could not load. Check your connection and try again.`}
                        action={
                            onRetry && (
                                <AsyncButton onClick={onRetry}>
                                    Try Again
                                </AsyncButton>
                            )
                        }
                    />
                ) : !meetings ? (
                    <>
                        <span className="sr-only" role="status">
                            Loading meetings
                        </span>
                        {Array.from({ length: 3 }, (_, i) => (
                            <Skeleton key={i} className="h-24 rounded-lg" />
                        ))}
                    </>
                ) : sortedMeetings.length ? (
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
                            advisor={meeting.advisor}
                        ></UpcomingMeeting>
                    ))
                ) : (
                    <ContentUnavailable
                        headingLevel="h2"
                        icon="bx-calendar-x"
                        iconColor="text-typography-2"
                        title={"No events or meetings on this day"}
                        description={`There are no public events taking place on ${monthNames[day.month()]} ${day.date()}.`}
                    ></ContentUnavailable>
                )}
            </motion.div>
        </div>
    );
};

export default DaySchedule;
