import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const SCHOOL_TIMEZONE = "America/New_York";

const WALL_CLOCK_FORMAT = "YYYY-MM-DDTHH:mm:ss";

/*
the date/time pickers hold plain wall clock values, so what is shown on them
is always read as New York time, wherever the browser happens to be
*/
export const wallClockToISO = (value: Dayjs) =>
    dayjs.tz(value.format(WALL_CLOCK_FORMAT), SCHOOL_TIMEZONE).toISOString();

/* a timestamp (or right now) as New York time, for showing meeting times */
export const toNewYork = (value?: string | Date) =>
    dayjs(value).tz(SCHOOL_TIMEZONE);

/* the inverse: a stored timestamp, as its New York wall clock time for the pickers */
export const isoToWallClock = (iso?: string) =>
    dayjs(dayjs(iso).tz(SCHOOL_TIMEZONE).format(WALL_CLOCK_FORMAT));

/* whether the browser keeps the same clock as New York, in both winter and summer */
export const usesNewYorkTime = () => {
    const year = new Date().getFullYear();
    return [new Date(year, 0, 1), new Date(year, 6, 1)].every(
        (date) =>
            dayjs(date).utcOffset() ===
            dayjs(date).tz(SCHOOL_TIMEZONE).utcOffset(),
    );
};
