import React, { useEffect, useState } from "react";

import { supabase } from "../../lib/supabaseClient";
import useCachedQuery, { useCacheScope } from "../../lib/useCachedQuery";
import { fetchCached, hashKey } from "../../lib/queryCache";

import { useSnackbar } from "notistack";
import { DayPicker } from "react-day-picker";
import dayjs, { Dayjs } from "dayjs";
import { isoToWallClock, wallClockToISO } from "../../utils/NewYorkTime";
import DaySchedule from "./components/DaySchedule";
import LoginGate from "../../components/ui/content/LoginGate";
import { Helmet } from "react-helmet";

const CALENDAR_STALE = 2 * 60_000;

const dayKey = (day: Dayjs) => ["calendar", "day", day.format("YYYY-MM-DD")];

const loadDay = async (day: Dayjs) => {
    const dayStart = wallClockToISO(day.startOf("day"));
    const nextDayStart = wallClockToISO(day.add(1, "day").startOf("day"));
    const { data, error } = await supabase
        .from("meetings")
        .select(
            `
      id,
      title,
      description,
      is_public,
      start_time,
      end_time,
      rooms (
        id,
        name,
        floor
      ),
      organizations!inner (
        id,
        url,
        name,
        picture
      ),
      advisor
    `,
        )
        .neq("organizations.url", "epsilon") // internal maintenance meetings
        .gte("start_time", dayStart)
        .lt("start_time", nextDayStart);
    if (error || !data) throw error ?? new Error("No meetings returned");
    return data as unknown as CalendarMeeting[];
};

const Index = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [time, setTime] = useState<Dayjs>(isoToWallClock().startOf("day"));

    const [currentMonth, setCurrentMonth] = useState<Date>(
        new Date(time.year(), time.month(), 1),
    );

    const highlightedDays =
        useCachedQuery(
            [
                "calendar",
                "days",
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
            ],
            async () => {
                const { data, error } = await supabase.rpc(
                    "get_unique_meeting_days",
                    {
                        month: currentMonth.getMonth() + 1,
                        year: currentMonth.getFullYear(),
                    },
                );
                if (error) {
                    enqueueSnackbar("Error fetching meeting days", {
                        variant: "error",
                    });
                    throw error;
                }
                return (data ?? []) as number[];
            },
            { staleTime: CALENDAR_STALE },
        ).data ?? [];

    const dayQuery = useCachedQuery(
        dayKey(time),
        async () => {
            try {
                return await loadDay(time);
            } catch (error) {
                enqueueSnackbar(
                    "Error fetching meetings. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                throw error;
            }
        },
        { staleTime: CALENDAR_STALE },
    );

    // the days on either side load in the background, so stepping through is instant
    const scope = useCacheScope();
    useEffect(() => {
        if (!dayQuery.data) return;
        for (const day of [time.subtract(1, "day"), time.add(1, "day")]) {
            fetchCached(
                hashKey(scope, dayKey(day)),
                () => loadDay(day),
                CALENDAR_STALE,
            ).catch(() => {});
        }
    }, [dayQuery.data, time, scope]);

    // the last loaded day stays up, dimmed, until the next one arrives
    const [shown, setShown] = useState<{
        day: string;
        meetings: CalendarMeeting[];
    }>();
    useEffect(() => {
        if (dayQuery.data)
            setShown({
                day: time.format("YYYY-MM-DD"),
                meetings: dayQuery.data,
            });
    }, [dayQuery.data, time]);
    const pending = !dayQuery.data && !dayQuery.error && !!shown;

    return (
        <div>
            <Helmet>
                <title>Calendar - Epsilon</title>
                <meta
                    name="description"
                    content="Happenings at Stuyvesant High School."
                />
            </Helmet>
            <LoginGate sx={{ width: "100%" }} page={"view the calendar"}>
                <h1 className="sr-only">Calendar</h1>
                <div
                    className={
                        "m-4 sm:m-12 flex items-start gap-8 min-h-screen max-md:flex-col"
                    }
                >
                    <DayPicker
                        mode="single"
                        month={currentMonth}
                        selected={time.toDate()}
                        today={isoToWallClock().toDate()}
                        onSelect={(date) => {
                            if (!date) return;
                            setTime(dayjs(date));
                        }}
                        onMonthChange={(month) => {
                            setCurrentMonth(month);
                        }}
                        // other months' days aren't shown: they couldn't be chosen,
                        // and dimmed they read as unavailable yet were announced as
                        // working buttons
                        weekStartsOn={1}
                        // the arrows are drawn at 24px, so a larger invisible area takes the tap
                        classNames={{
                            // fills the card on phones, so it fits any screen or text size
                            month_grid: "max-sm:w-full max-sm:table-fixed",
                            button_previous:
                                "fill-typography-1 z-10 relative sm:hover:bg-layer-2 rounded-full before:absolute before:-inset-1.5 before:content-['']",
                            button_next:
                                "fill-typography-1 z-10 relative sm:hover:bg-layer-2 rounded-full before:absolute before:-inset-1.5 before:content-['']",
                            root: "rounded-xl p-3 bg-layer-1 shadow-control relative max-md:w-full",
                            nav: "absolute flex gap-2 ml-16 right-5 top-3.5",
                            month_caption:
                                "relative -top-1 mb-3 pr-16 text-typography-1 important",
                            weekday: "font-normal text-typography-2",
                            day: "p-0 text-center text-typography-1",
                            day_button:
                                "sm:size-10 max-sm:h-11 max-sm:w-full grid place-items-center rounded-md transition-colors sm:hover:bg-layer-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1",
                            selected:
                                "bg-accent text-white rounded-md pointer-events-none",
                            outside: "opacity-50 pointer-events-none",
                            today: "important rounded-md",
                        }}
                        /* underline markers for meeting days */
                        modifiers={{
                            hasMeetings: (date) =>
                                date.getMonth() === currentMonth.getMonth() &&
                                date.getFullYear() ===
                                    currentMonth.getFullYear() &&
                                highlightedDays.includes(date.getDate()),
                        }}
                        modifiersClassNames={{
                            hasMeetings:
                                'relative after:content-[""] after:left-1/2 after:absolute after:-translate-x-1/2 after:bottom-1 after:w-1 after:h-1 after:rounded-full after:bg-yellow scheme-light:after:size-1.5 scheme-light:after:bg-[#6b4700] data-[selected]:after:bg-white scheme-light:data-[selected]:after:bg-white',
                        }}
                    />

                    <div className={"w-full"}>
                        <DaySchedule
                            day={time}
                            meetings={
                                dayQuery.data ??
                                (dayQuery.error ? undefined : shown?.meetings)
                            }
                            shownDay={
                                dayQuery.data
                                    ? time.format("YYYY-MM-DD")
                                    : shown?.day
                            }
                            pending={pending}
                            failed={!dayQuery.data && !!dayQuery.error}
                            onRetry={dayQuery.refetch}
                        />
                    </div>
                </div>
            </LoginGate>
        </div>
    );
};

export default Index;
