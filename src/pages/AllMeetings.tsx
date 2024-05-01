import { useEffect, useState } from "react";

import { supabase } from "../supabaseClient";

import { useSnackbar } from "notistack";

import { Box, useMediaQuery, Typography } from "@mui/material";

import { DateCalendar } from "@mui/x-date-pickers";

import dayjs, { Dayjs } from "dayjs";
import DaySchedule from "../comps/pages/allmeetings/DaySchedule";

type CachedMeetings = {
    [date: string]: CalendarMeeting[];
};

const AllMeetings = () => {
    const { enqueueSnackbar } = useSnackbar();
    const isMobile = useMediaQuery("(max-width: 800px)");

    /* meetings for a given day */
    /* cache after fetching once */
    const [cachedMeetings, setCachedMeetings] = useState<CachedMeetings>({});
    const [meetings, setMeetings] = useState<CalendarMeeting[]>([]);

    /* month adjuster */
    const [time, setTime] = useState<Dayjs>(dayjs());

    useEffect(() => {
        let dayString = `${time.year()}/${time.month()}/${time.date()}`;
        if (cachedMeetings[dayString]) {
            return setMeetings(cachedMeetings[dayString]);
        }

        let dayStart = new Date(time.year(), time.month(), time.date());
        let nextDayStart = new Date(time.year(), time.month(), time.date() + 1);

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
        <Box sx={{ width: "100%", paddingLeft: "20px" }}>
            <Typography variant="h1">All Meetings</Typography>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    marginBottom: "20px",
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
                        marginRight: "10px",
                        height: "320px",
                    }}
                >
                    <DateCalendar
                        views={["day"]}
                        onChange={(newValue) => setTime(newValue)}
                        sx={{ width: "100%" }}
                    />
                </Box>
                <Box sx={{ width: "100%" }}>
                    <DaySchedule day={time} meetings={meetings} />
                </Box>
            </Box>
        </Box>
    );
};

export default AllMeetings;
