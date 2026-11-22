import { ReactNode, useContext } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import ItemList from "../../../../components/ui/lists/ItemList";
import { toNewYork } from "../../../../utils/NewYorkTime";
import {
    attendanceRates,
    formatRate,
    useOrgAttendance,
} from "./useOrgAttendance";

const Row = ({ children }: { children: ReactNode }) => (
    <div className={"bg-layer-2 px-3.5 py-3"}>{children}</div>
);

// July and August have no meeting requirement
const SUMMER = [6, 7];

/* the last four required months, newest first */
export const MeetingRequirements = () => {
    const org = useContext(OrgContext);
    const now = toNewYork();
    const months = [0, 1, 2, 3, 4, 5]
        .map((i) => now.subtract(i, "month").startOf("month"))
        .filter((m) => !SUMMER.includes(m.month()))
        .slice(0, 4);
    const firstMeeting = (org.meetings || [])
        .map((m) => toNewYork(m.start_time))
        .sort((a, b) => a.valueOf() - b.valueOf())[0];

    const rows = months
        .filter(
            (month) =>
                month.isSame(now, "month") ||
                (firstMeeting && !month.isBefore(firstMeeting, "month")),
        )
        .map((month) => {
            const held = (org.meetings || []).some((m) =>
                toNewYork(m.start_time).isSame(month, "month"),
            );
            return { month, held, current: month.isSame(now, "month") };
        });

    return (
        <ItemList
            height={"auto"}
            title={"Meeting Requirements"}
            icon={"bx-calendar text-blue"}
            subtitle={
                "All activities are required to hold at least one meeting per month."
            }
        >
            {rows.map(({ month, held, current }) => (
                <Row key={month.format("YYYY-MM")}>
                    <div className={"flex items-center justify-between gap-3"}>
                        <p className={"important text-sm"}>
                            {month.format("MMMM YYYY")}
                        </p>
                        <p
                            className={`important flex items-center gap-1 text-sm ${
                                held
                                    ? "text-green"
                                    : current
                                      ? "text-typography-2"
                                      : "text-red"
                            }`}
                        >
                            <span className={"text-typography-1"}>
                                {held
                                    ? "Fulfilled"
                                    : current
                                      ? "Not yet"
                                      : "Not Fulfilled"}
                            </span>
                            <i
                                aria-hidden="true"
                                className={`bx ${
                                    held
                                        ? "bx-check-circle"
                                        : current
                                          ? "bx-time-five"
                                          : "bx-x-circle"
                                }`}
                            />
                        </p>
                    </div>
                    {!held && !current && (
                        <p className={"mt-1 text-sm text-typography-2"}>
                            This month, the activity didn&apos;t hold a meeting.
                            Repeat offenses may lead to penalties.
                        </p>
                    )}
                </Row>
            ))}
        </ItemList>
    );
};

export const AttendancePerformance = () => {
    const org = useContext(OrgContext);
    const { meetings } = useOrgAttendance(org.id, true);
    const memberIds = new Set(
        (org.memberships || [])
            .filter((m) => m.active && m.role !== "ADVISOR")
            .map((m) => m.users?.id as number),
    );
    const rates = meetings ? attendanceRates(meetings, memberIds) : undefined;

    return (
        <ItemList
            height={"auto"}
            title={"Attendance Performance"}
            icon={"bx-calendar text-blue"}
        >
            {(
                [
                    ["Last Meeting", rates?.last],
                    ["Last 30 Days", rates?.month],
                    ["All-Time", rates?.all],
                ] as const
            ).map(([label, value]) => (
                <Row key={label}>
                    <div className={"flex items-center justify-between"}>
                        <p className={"important text-sm"}>{label}</p>
                        <p className={"important text-sm tabular-nums"}>
                            {formatRate(value)}
                        </p>
                    </div>
                </Row>
            ))}
        </ItemList>
    );
};
