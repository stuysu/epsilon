export type MeetingAttendanceRecord = Pick<Attendance, "user_id" | "status"> &
    Partial<Pick<Attendance, "id" | "recorded_at" | "source">>;

export type AttendanceMembership = {
    id?: number;
    active?: boolean;
    users?: Partial<User>;
};

export type AttendanceMeeting = Pick<
    Meeting,
    "id" | "title" | "start_time" | "end_time"
> & {
    attendance_late_after_minutes?: number | null;
    organizations?: {
        id?: number;
        memberships?: AttendanceMembership[];
    };
    attendance?: MeetingAttendanceRecord[];
};

export type MeetingAttendanceView = "overview" | "manual";

export const DEFAULT_LATE_MINUTES = 15;

export const attendanceStatuses: Array<{
    value: AttendanceStatus;
    label: string;
}> = [
    { value: "PRESENT", label: "Present" },
    { value: "LATE", label: "Late" },
    { value: "ABSENT", label: "Absent" },
    { value: "EARLY_DISMISSAL", label: "Early Dismissal" },
];

export const meetingAttendanceViewOptions: Array<{
    label: string;
    value: MeetingAttendanceView;
}> = [
    { label: "Overview", value: "overview" },
    { label: "Manual Attendance", value: "manual" },
];
