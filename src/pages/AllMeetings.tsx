import { useEffect, useState } from "react";

import { supabase } from "../supabaseClient";

import { useSnackbar } from "notistack";

import { Badge, Box, useMediaQuery } from "@mui/material";

import {
    DateCalendar,
    DayCalendarSkeleton,
    PickersDay,
    PickersDayProps,
} from "@mui/x-date-pickers";

import dayjs, { Dayjs } from "dayjs";
import DaySchedule from "../comps/pages/allmeetings/DaySchedule";
import LoginGate from "../comps/ui/LoginGate";

type CachedMeetings = {
    [date: string]: CalendarMeeting[];
};

function ServerDay(
    props: PickersDayProps<Dayjs> & { highlightedDays?: number[] },
) {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

    const isSelected =
        !props.outsideCurrentMonth &&
        highlightedDays.indexOf(props.day.date()) >= 0;

    return (
        <Badge
            key={props.day.toString()}
            overlap="circular"
            badgeContent={isSelected ? "🔴" : undefined}
        >
            <PickersDay
                {...other}
                outsideCurrentMonth={outsideCurrentMonth}
                day={day}
            />
        </Badge>
    );
}

const AllMeetings = () => {
    const { enqueueSnackbar } = useSnackbar();
    const isMobile = useMediaQuery("(max-width: 800px)");

    /* meetings for a given day */
    /* cache after fetching once */
    const [cachedMeetings, setCachedMeetings] = useState<CachedMeetings>({});
    const [meetings, setMeetings] = useState<CalendarMeeting[]>([]);

    /* month adjuster */
    const [time, setTime] = useState<Dayjs>(dayjs());

    /* days with meetings */
    const [loading, setLoading] = useState(false);
    const [highlightedDays, setHighlightedDays] = useState<number[]>([]);

    const updateHighlightedDays = async (month: number, year: number) => {
        const { data, error } = await supabase.rpc("get_unique_meeting_days", {
            month: month + 1,
            year,
        });

        /* database function returns null if can't find any meetings */
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
    }, [time, enqueueSnackbar, cachedMeetings]);

    return (
        <LoginGate sx={{ width: "100%" }} page={"view the calendar"}>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    padding: isMobile ? "20px" : "40px",
                    marginBottom: "250px",
                    flexWrap: isMobile ? "wrap" : "nowrap",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "320px",
                        minWidth: "250px",
                        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                        borderRadius: "7px",
                        backgroundColor: "#232323",
                        marginRight: "10px",
                        height: "320px",
                    }}
                >
                    <DateCalendar
                        views={["day"]}
                        onChange={(newValue) => setTime(newValue)}
                        onMonthChange={(date: Dayjs) => {
                            let month = date.month();
                            let year = date.year();

                            setLoading(true);
                            updateHighlightedDays(month, year);
                        }}
                        loading={loading}
                        renderLoading={() => <DayCalendarSkeleton />}
                        slots={{
                            day: ServerDay,
                        }}
                        slotProps={{
                            day: {
                                highlightedDays,
                            } as any,
                        }}
                        sx={{ width: "100%" }}
                    />
                </Box>
                <Box
                    sx={{ width: "100%", marginTop: isMobile ? "40px" : "0px" }}
                >
                    <DaySchedule day={time} meetings={meetings} />
                </Box>
            </Box>
        </LoginGate>
    );
};

export default AllMeetings;
