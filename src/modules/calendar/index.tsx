import React, { useEffect, useState } from "react";

import { supabase } from "../../lib/supabaseClient";

import { useSnackbar } from "notistack";
import { DayPicker } from "react-day-picker";
import dayjs, { Dayjs } from "dayjs";
import DaySchedule from "./components/DaySchedule";
import LoginGate from "../../components/ui/content/LoginGate";

type CachedMeetings = {
    [date: string]: CalendarMeeting[];
};

const Index = () => {
    const { enqueueSnackbar } = useSnackbar();

    /* meetings for a given day */
    /* cache after fetching once */
    const [cachedMeetings, setCachedMeetings] = useState<CachedMeetings>({});
    const [meetings, setMeetings] = useState<CalendarMeeting[]>([]);

    /* month adjuster */
    const [time, setTime] = useState<Dayjs>(dayjs());

    const [currentMonth, setCurrentMonth] = useState<Date>(
        new Date(time.year(), time.month(), 1),
    );

    /* days with meetings */
    const [loading, setLoading] = useState(false);
    const [highlightedDays, setHighlightedDays] = useState<number[]>([]);

    const updateHighlightedDays = async (month: number, year: number) => {
        const { data, error } = await supabase.rpc("get_unique_meeting_days", {
            month: month + 1,
            year,
        });

        if (!data) {
            setHighlightedDays([]);
            setLoading(false);
            return;
        }

        if (error) {
            enqueueSnackbar("Error fetching meeting days", {
                variant: "error",
            });

            setHighlightedDays([]);
            return;
        }

        setHighlightedDays(data as number[]);
        setLoading(false);
    };

    useEffect(() => {
        let dayString = `${time.year()}/${time.month()}/${time.date()}`;
        if (cachedMeetings[dayString]) {
            return setMeetings(cachedMeetings[dayString]);
        }

        let dayStart = new Date(time.year(), time.month(), time.date());
        let nextDayStart = new Date(time.year(), time.month(), time.date() + 1);

        updateHighlightedDays(time.month(), time.year());

        const fetchMeetings = async () => {
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
            name
          ),
          organizations (
            id,
            url,
            name,
            picture
          )
        `,
                )
                .gte("start_time", dayStart.toISOString())
                .lt("start_time", nextDayStart.toISOString());

            if (error || !data) {
                return enqueueSnackbar(
                    "Error fetching meetings. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            setCachedMeetings({ ...cachedMeetings, [dayString]: data as any });
            setMeetings(data as any);
        };

        fetchMeetings();
    }, [time]);

    return (
        <LoginGate sx={{ width: "100%" }} page={"view the calendar"}>
            <div
                className={
                    "m-4 sm:m-12 flex items-start gap-8 min-h-screen max-md:flex-col"
                }
            >
                <DayPicker
                    mode="single"
                    month={currentMonth}
                    selected={time.toDate()}
                    onSelect={(date) => {
                        if (!date) return;
                        setTime(dayjs(date));
                    }}
                    onMonthChange={(month) => {
                        setCurrentMonth(month);
                        setLoading(true);
                        updateHighlightedDays(
                            month.getMonth(),
                            month.getFullYear(),
                        );
                    }}
                    showOutsideDays
                    weekStartsOn={1}
                    classNames={{
                        button_previous:
                            "fill-typography-1 z-10 relative hover:bg-layer-2 rounded-full",
                        button_next:
                            "fill-typography-1 z-10 relative hover:bg-layer-2 rounded-full",
                        root: "p-5 rounded-xl p-3 bg-layer-1 shadow-control relative max-md:w-full",
                        nav: "absolute flex gap-2 ml-16 right-5 top-3.5",
                        month_caption:
                            "relative -top-1 mb-3 text-typography-1 important",
                        weekday: "font-normal text-typography-2",
                        day: "p-0 text-center text-typography-1",
                        day_button:
                            "sm:w-10 sm:h-10 w-8 h-8 grid place-items-center rounded-md transition-colors hover:bg-layer-2",
                        selected:
                            "bg-accent text-typography-1 rounded-md pointer-events-none",
                        outside: "opacity-50 pointer-events-none",
                        today: "important animate-pulse",
                    }}
                    /* underline markers for meeting days */
                    modifiers={{
                        hasMeetings: (date) =>
                            date.getMonth() === currentMonth.getMonth() &&
                            date.getFullYear() === currentMonth.getFullYear() &&
                            highlightedDays.includes(date.getDate()),
                    }}
                    modifiersClassNames={{
                        hasMeetings:
                            'relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-8 after:h-[4px] after:rounded-full after:bg-yellow',
                    }}
                />

                <div className={"w-full"}>
                    <DaySchedule day={time} meetings={meetings} />
                </div>
            </div>
        </LoginGate>
    );
};

export default Index;
