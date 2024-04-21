import { useEffect, useState } from "react";

import { supabase } from "../supabaseClient";

import { useSnackbar } from "notistack";

import { Box } from "@mui/material";

import { DateCalendar } from "@mui/x-date-pickers";

import dayjs, { Dayjs } from "dayjs";
import DaySchedule from "../comps/pages/allmeetings/DaySchedule";

type CachedMeetings = {
  [date: string]: CalendarMeeting[]
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "October", "September", "November", "December"]

const AllMeetings = () => {
  const { enqueueSnackbar } = useSnackbar();

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
    let nextDayStart = new Date(time.year(), time.month(), time.date()+1);

    const fetchMeetings = async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select(`
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
            name
          )
        `)
        .gte("start_time", dayStart.toISOString())
        .lt("start_time", nextDayStart.toISOString());

      if (error || !data) {
        return enqueueSnackbar(
          "Error fetching meetings. Contact it@stuysu.org for support.",
          { variant: "error" }
        );
      }

      setCachedMeetings({ ...cachedMeetings, [dayString]: data as any })
      setMeetings(data as any);
    };

    fetchMeetings();
  }, [time]);

  return (
    <Box>
      <h1>All Meetings</h1>
      <Box>
        <Box>
          <DateCalendar 
            views={['day']}
            onChange={(newValue) => setTime(newValue)} 
          />
        </Box>
        <DaySchedule day={time} meetings={meetings} />
      </Box>
    </Box>
  );
};

export default AllMeetings;
