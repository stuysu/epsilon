import { toNewYork } from "../../../../utils/NewYorkTime";
import { attendanceRecord } from "./AttendanceRecord";
import { AttendanceMeeting } from "./useOrgAttendance";

export type CsvMember = {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    role?: string | null;
    joined_at?: string;
};

const ROLE_LABELS: Record<string, string> = {
    CREATOR: "Creator",
    ADMIN: "Admin",
    MEMBER: "Member",
};

/* a row per member and a column per meeting that has started, oldest first;
   blank cells are meetings from before they joined or not marked yet */
export const attendanceCsvRows = (
    meetings: AttendanceMeeting[],
    members: CsvMember[],
    now = Date.now(),
): (string | number)[][] => {
    const held = meetings
        .filter((m) => new Date(m.start_time).getTime() <= now)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    const header = [
        "First name",
        "Last name",
        "Email",
        "Role",
        "Meetings attended",
        "Meetings counted",
        "Attendance rate",
        ...held.map(
            (m) =>
                `${toNewYork(m.start_time).format("YYYY-MM-DD h:mm A")} ${m.title}`,
        ),
    ];
    const rows = members.map((member) => {
        const record = attendanceRecord(
            meetings,
            member.id,
            member.joined_at,
            now,
        );
        const byMeeting = new Map(record.map((r) => [r.meeting.id, r]));
        const counted = record.filter((r) => r.arrival !== "pending");
        const present = counted.filter((r) => r.arrival !== "absent").length;
        return [
            member.first_name ?? "",
            member.last_name ?? "",
            member.email ?? "",
            ROLE_LABELS[member.role ?? ""] ?? member.role ?? "",
            present,
            counted.length,
            counted.length
                ? `${Math.round((present / counted.length) * 1000) / 10}%`
                : "",
            ...held.map((m) => {
                const r = byMeeting.get(m.id);
                if (!r || r.arrival === "pending") return "";
                if (r.arrival === "absent") return "Absent";
                const base = r.arrival === "late" ? "Late" : "Present";
                return r.leftEarly ? `${base}, left early` : base;
            }),
        ];
    });
    return [header, ...rows];
};

export const attendanceCsvName = (clubUrl: string, now = new Date()) =>
    `${clubUrl || "club"}-attendance-${toNewYork(now).format("YYYY-MM-DD")}.csv`;

export type MeetingCsvMark = {
    user_id: number;
    late: boolean;
    left_early: boolean;
    recorded_at?: string | null;
    source?: string | null;
};

/* one meeting: a row per member, sorted by last name; status is blank for
   members who joined after it ended */
export const meetingCsvRows = (
    meeting: { start_time: string; end_time: string },
    marks: MeetingCsvMark[],
    members: CsvMember[],
): string[][] => {
    const byUser = new Map(marks.map((m) => [m.user_id, m]));
    const header = [
        "First name",
        "Last name",
        "Email",
        "Role",
        "Status",
        "Left early",
        "Checked in",
        "Marked by",
    ];
    const rows = members.map((member) => {
        const mark = byUser.get(member.id);
        const joinedAfter =
            !mark &&
            !!member.joined_at &&
            new Date(member.joined_at) >= new Date(meeting.end_time);
        return [
            member.first_name ?? "",
            member.last_name ?? "",
            member.email ?? "",
            ROLE_LABELS[member.role ?? ""] ?? member.role ?? "",
            joinedAfter
                ? ""
                : !mark
                  ? "Absent"
                  : mark.late
                    ? "Late"
                    : "Present",
            mark?.left_early ? "Yes" : "",
            mark?.recorded_at
                ? toNewYork(mark.recorded_at).format("h:mm A")
                : "",
            !mark ? "" : mark.source === "SELF" ? "Self check-in" : "Leader",
        ];
    });
    return [header, ...rows];
};

export const meetingCsvName = (
    clubUrl: string,
    meeting: { title: string; start_time: string },
) => {
    const title = meeting.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
    const day = toNewYork(meeting.start_time).format("YYYY-MM-DD");
    return `${clubUrl || "club"}-${title || "meeting"}-${day}.csv`;
};
