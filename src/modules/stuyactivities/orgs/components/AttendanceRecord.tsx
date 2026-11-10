import pressable from "../../../../utils/pressable";
import { toNewYork } from "../../../../utils/NewYorkTime";
import { AttendanceMeeting } from "./useOrgAttendance";
import { ProgressBar, StatusPill } from "./AttendanceBits";
import { MeetingChip, meetingTimeLabel, RoomChip } from "./MeetingChips";

type Arrival = "onTime" | "late" | "absent" | "pending";

type RecordRow = {
    meeting: AttendanceMeeting;
    live: boolean;
    arrival: Arrival;
    leftEarly: boolean;
};

const arrivalStyle: Record<
    Arrival,
    { label: string; icon: string; color: string }
> = {
    onTime: { label: "On Time", icon: "bx-time-five", color: "text-green" },
    late: { label: "Late", icon: "bx-time-five", color: "text-yellow" },
    absent: { label: "Absent", icon: "bx-x-circle", color: "text-red" },
    pending: {
        label: "Not Marked Yet",
        icon: "bx-loader-circle",
        color: "text-typography-2",
    },
};

/* meetings that have started, newest first, with how this person did at each */
export const attendanceRecord = (
    meetings: AttendanceMeeting[],
    userId: number,
    joinedAt?: string,
    now = Date.now(),
): RecordRow[] =>
    meetings
        .filter(
            (m) =>
                new Date(m.start_time).getTime() <= now &&
                (!joinedAt ||
                    new Date(m.end_time) > new Date(joinedAt) ||
                    m.attendance.some((a) => a.user_id === userId)),
        )
        .sort(
            (a, b) =>
                new Date(b.start_time).getTime() -
                new Date(a.start_time).getTime(),
        )
        .map((meeting) => {
            const live = new Date(meeting.end_time).getTime() >= now;
            const mark = meeting.attendance.find((a) => a.user_id === userId);
            return {
                meeting,
                live,
                arrival: mark
                    ? mark.late
                        ? "late"
                        : "onTime"
                    : live
                      ? "pending"
                      : "absent",
                leftEarly: Boolean(mark?.left_early),
            };
        });

const StatTile = ({
    icon,
    iconClass,
    count,
    total,
    label,
    lowerIsBetter = false,
}: {
    icon: string;
    iconClass: string;
    count: number;
    total: number;
    label: string;
    lowerIsBetter?: boolean;
}) => {
    const ratio = total ? count / total : 0;
    return (
        <div
            className={
                "flex min-w-0 flex-col gap-2 rounded-xl border border-divider bg-layer-1 p-3 shadow-control sm:gap-3 sm:p-4"
            }
        >
            <p
                className={
                    "flex items-center gap-1.5 text-xs text-typography-2 sm:text-sm"
                }
            >
                <i
                    aria-hidden="true"
                    className={`bx ${icon} text-base max-sm:hidden ${iconClass}`}
                />
                {label}
            </p>
            <p className={"leading-none"}>
                <span
                    className={
                        "text-2xl font-semibold tabular-nums text-typography-1 sm:text-3xl"
                    }
                >
                    {total ? count : "–"}
                </span>
                {total > 0 && (
                    <span className={"text-sm text-typography-2"}>
                        {" "}
                        / {total}
                    </span>
                )}
            </p>
            <ProgressBar
                value={ratio}
                score={total && lowerIsBetter ? 1 - ratio : ratio}
                label={label}
                scored
            />
        </div>
    );
};

export const AttendanceStats = ({ rows }: { rows: RecordRow[] }) => {
    const counted = rows.filter((r) => r.arrival !== "pending");
    const present = counted.filter((r) => r.arrival !== "absent");
    const late = present.filter((r) => r.arrival === "late").length;
    const early = present.filter((r) => r.leftEarly).length;
    return (
        <div className={"grid grid-cols-3 gap-2 sm:gap-3"}>
            <StatTile
                icon="bx-check-circle"
                iconClass="text-green"
                count={present.length}
                total={counted.length}
                label="Present"
            />
            <StatTile
                icon="bx-time-five"
                iconClass="text-yellow"
                count={late}
                total={present.length}
                label="Late"
                lowerIsBetter
            />
            <StatTile
                icon="bx-log-out-circle"
                iconClass="text-red"
                count={early}
                total={present.length}
                label="Left Early"
                lowerIsBetter
            />
        </div>
    );
};

const RecordItem = ({
    row,
    onOpen,
}: {
    row: RecordRow;
    onOpen?: () => void;
}) => {
    const { meeting, live, arrival, leftEarly } = row;
    const style = arrivalStyle[arrival];
    return (
        <li
            className={`flex flex-col gap-2.5 bg-layer-2 px-6 py-4 ${
                onOpen
                    ? "cursor-pointer transition-colors sm:hover:bg-layer-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-typography-1"
                    : ""
            }`}
            {...(onOpen ? pressable(onOpen, { role: "link" }) : {})}
        >
            <div className={"flex items-start justify-between gap-3"}>
                <div
                    className={
                        "flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5"
                    }
                >
                    <h4 className={"min-w-0 break-words"}>{meeting.title}</h4>
                    <MeetingChip
                        icon={style.icon}
                        iconClass={style.color}
                        label={style.label}
                    />
                    {leftEarly && (
                        <MeetingChip
                            icon="bx-log-out-circle"
                            iconClass="text-yellow"
                            label="Left Early"
                        />
                    )}
                </div>
                <StatusPill>{live ? "Happening Now" : "Finished"}</StatusPill>
            </div>
            <div className={"flex flex-wrap items-center gap-1.5"}>
                <MeetingChip
                    icon="bx-calendar"
                    iconClass="text-blue"
                    label={toNewYork(meeting.start_time).format("M/D/YYYY")}
                />
                <MeetingChip
                    icon="bx-time-five"
                    iconClass="text-yellow"
                    label={meetingTimeLabel(
                        meeting.start_time,
                        meeting.end_time,
                    )}
                />
                <RoomChip roomName={meeting.rooms?.name} />
            </div>
        </li>
    );
};

export const AttendanceRecordList = ({
    rows,
    onOpenMeeting,
}: {
    rows: RecordRow[];
    onOpenMeeting?: (meetingId: number) => void;
}) =>
    rows.length === 0 ? (
        <p className={"bg-layer-2 px-6 py-4"}>
            No meetings have been held yet.
        </p>
    ) : (
        <ul className={"flex flex-col gap-0.5"}>
            {rows.map((row) => (
                <RecordItem
                    key={row.meeting.id}
                    row={row}
                    onOpen={
                        onOpenMeeting
                            ? () => onOpenMeeting(row.meeting.id)
                            : undefined
                    }
                />
            ))}
        </ul>
    );
