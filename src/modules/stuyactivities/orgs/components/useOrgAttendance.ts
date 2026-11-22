import { useCallback, useEffect, useRef, useState } from "react";
import useLiveRefresh from "../../../../utils/useLiveRefresh";
import { supabase } from "../../../../lib/supabaseClient";

export type AttendanceMark = {
    user_id: number;
    late: boolean;
    left_early: boolean;
};

export type AttendanceMeeting = {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    rooms?: { name: string } | null;
    attendance: AttendanceMark[];
};

export const useOrgAttendance = (orgId?: number, poll = false) => {
    const [meetings, setMeetings] = useState<AttendanceMeeting[]>();
    const [error, setError] = useState(false);

    const request = useRef(0);

    const load = useCallback(async () => {
        if (!orgId || orgId === -1) return;
        const id = ++request.current;
        const { data, error } = await supabase
            .from("meetings")
            .select(
                "id, title, description, start_time, end_time, rooms (name), attendance (user_id, late, left_early)",
            )
            .eq("organization_id", orgId)
            .order("start_time", { ascending: false })
            .returns<AttendanceMeeting[]>();
        if (id !== request.current) return;
        if (error || !data) {
            setError(true);
            return;
        }
        setError(false);
        setMeetings(data);
    }, [orgId]);

    useEffect(() => {
        if (!poll) load();
    }, [load, poll]);
    useLiveRefresh(load, 3000, poll);

    return { meetings, error, reload: load };
};

/* share of active members present, over meetings that have already started;
   memberIds leaves out advisors and anyone who has left */
export const attendanceRates = (
    meetings: AttendanceMeeting[],
    memberIds: Set<number>,
    now = Date.now(),
) => {
    const held = meetings.filter(
        (m) => new Date(m.start_time).getTime() <= now,
    );
    const rate = (list: AttendanceMeeting[]) => {
        if (!list.length || !memberIds.size) return undefined;
        const present = list.reduce(
            (n, m) => n + countMembers(m, memberIds),
            0,
        );
        return Math.min(1, present / (list.length * memberIds.size));
    };
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    return {
        last: rate(
            held
                .filter((m) => new Date(m.end_time).getTime() < now)
                .slice(0, 1),
        ),
        month: rate(
            held.filter((m) => new Date(m.start_time).getTime() >= monthAgo),
        ),
        all: rate(held),
    };
};

export const countMembers = (
    meeting: AttendanceMeeting,
    memberIds: Set<number>,
    pick: (a: AttendanceMeeting["attendance"][number]) => boolean = () => true,
) =>
    meeting.attendance.filter((a) => memberIds.has(a.user_id) && pick(a))
        .length;

export const formatRate = (rate?: number) =>
    rate === undefined ? "—" : `${Math.round(rate * 1000) / 10}%`;
