import { ReactNode } from "react";
import dayjs from "dayjs";
import { supabase } from "../../../../lib/supabaseClient";
import useCachedQuery from "../../../../lib/useCachedQuery";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";
import { SUPPORT_EMAIL } from "../../../../config/constants";

type Count = { count: number };
type Stats = {
    weeks: number;
    since: string;
    generated_at: string;
    clubs_by_state: ({ state: string } & Count)[];
    clubs_meeting: number;
    meetings_per_week: ({ week: string } & Count)[];
    busiest_rooms: {
        room: string;
        meetings: number;
        open_days: number;
        booked_days: number;
    }[];
    room_days_open: number;
    room_days_booked: number;
    meetings_held: number;
    meetings_with_attendance: number;
    attendees: number;
    expected: number;
};

type Datum = { label: string; short?: string; value: number; note?: string };

const percent = (part: number, whole: number) =>
    whole ? `${Math.round((part / whole) * 100)}%` : "—";

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="min-w-0 rounded-xl bg-layer-1 p-5 shadow-control max-sm:p-4">
        <h2 className="as-h3 mb-4">{title}</h2>
        {children}
    </section>
);

const Tile = ({
    label,
    value,
    note,
}: {
    label: string;
    value: number | string;
    note?: string;
}) => (
    <div className="min-w-0 rounded-xl bg-layer-1 p-4 shadow-control">
        <p className="text-sm text-typography-2">{label}</p>
        <p className="my-1 text-[1.75rem] leading-tight tabular-nums text-typography-1 [font-variation-settings:'wght'_700]">
            {value}
        </p>
        {note && <p className="text-xs text-typography-2">{note}</p>}
    </div>
);

const DataTable = ({ data, column }: { data: Datum[]; column: string }) => (
    <table className="sr-only">
        <thead>
            <tr>
                <th scope="col" className="py-1 pr-3 font-semibold">
                    {column}
                </th>
                <th scope="col" className="py-1 text-right font-semibold">
                    Count
                </th>
            </tr>
        </thead>
        <tbody>
            {data.map((d) => (
                <tr key={d.label} className="border-t border-divider">
                    <td className="py-1 pr-3">
                        {d.label}
                        {d.note && (
                            <span className="text-typography-2">
                                {" "}
                                ({d.note})
                            </span>
                        )}
                    </td>
                    <td className="py-1 text-right tabular-nums">{d.value}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

/* horizontal bars, each with its label and value spelled out */
const Bars = ({ data, column }: { data: Datum[]; column: string }) => {
    const max = Math.max(1, ...data.map((d) => d.value));
    return (
        <>
            <ul className="flex flex-col gap-3" aria-label={column}>
                {data.map((d) => (
                    <li key={d.label} className="min-w-0">
                        <div className="mb-1 flex justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate">{d.label}</span>
                            <span className="shrink-0 tabular-nums text-typography-2">
                                {d.value}
                                {d.note && ` · ${d.note}`}
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-layer-3">
                            <div
                                className="h-2 rounded-full bg-accent"
                                style={{ width: `${(d.value / max) * 100}%` }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
            {data.length === 0 && (
                <p className="text-sm text-typography-2">Nothing yet.</p>
            )}
        </>
    );
};

/* vertical bars over time; the table below is the accessible version */
const Columns = ({ data, column }: { data: Datum[]; column: string }) => {
    const top = Math.max(0, ...data.map((d) => d.value));
    const max = Math.max(1, top);
    return (
        <>
            <div aria-hidden="true">
                {/* no scale when there's nothing to show */}
                <div className="flex min-h-[1lh] justify-between text-xs text-typography-2">
                    {top > 0 && (
                        <span className="tabular-nums">
                            {top.toLocaleString()}
                        </span>
                    )}
                </div>
                <div className="relative flex h-40 items-end gap-[2px] border-b border-t border-dashed border-divider sm:gap-1">
                    {data.map((d) => (
                        <div
                            key={d.label}
                            className="group relative flex h-full min-w-0 flex-1 items-end"
                        >
                            <div
                                className="w-full rounded-t bg-accent transition-[filter] group-hover:brightness-125"
                                style={{
                                    height: `${(d.value / max) * 100}%`,
                                    minHeight: d.value ? 2 : 0,
                                }}
                            />
                            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-layer-3 px-2 py-1 text-xs shadow-control group-hover:block">
                                {d.label}: {d.value}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-1 flex gap-[2px] text-[10px] text-typography-2 sm:gap-1 sm:text-xs">
                    {data.map((d, i) => (
                        <span
                            key={d.label}
                            className="min-w-0 flex-1 overflow-hidden text-center max-sm:overflow-visible max-sm:whitespace-nowrap"
                        >
                            {/* every other label on phones, spilling into the
                                hidden neighbour's space so it isn't cut off */}
                            <span className={i % 2 ? "max-sm:invisible" : ""}>
                                {d.short ?? d.label}
                            </span>
                        </span>
                    ))}
                </div>
            </div>
            <DataTable data={data} column={column} />
        </>
    );
};

const Analytics = () => {
    const { data, error, loading, fetching, refetch } = useCachedQuery<Stats>(
        ["admin", "analytics"],
        async () => {
            const { data, error } = await supabase.rpc("su_analytics", {
                weeks: 12,
            });
            if (error) throw error;
            return data as Stats;
        },
        { staleTime: 5 * 60_000 },
    );

    if (error && !data)
        return (
            <ContentUnavailable
                icon="bx-bar-chart-alt-2"
                iconColor="text-red"
                title="Couldn't Load Analytics"
                description={`Try again in a moment. If it keeps happening, contact ${SUPPORT_EMAIL}.`}
                action={<AsyncButton onClick={refetch}>Try Again</AsyncButton>}
            />
        );

    if (loading || !data)
        return (
            <p role="status" className="p-4 sm:p-12">
                Loading analytics…
            </p>
        );

    const approved = data.clubs_by_state
        .filter((s) => !["PENDING", "REJECTED"].includes(s.state))
        .reduce((n, s) => n + s.count, 0);

    const weeks: Datum[] = data.meetings_per_week.map((w) => ({
        label: `Week of ${dayjs(w.week).format("MMM D")}`,
        short: dayjs(w.week).format("M/D"),
        value: w.count,
    }));
    const rooms: Datum[] = data.busiest_rooms.map((r) => ({
        label: r.room,
        value: r.meetings,
        note: r.open_days
            ? `${percent(r.booked_days, r.open_days)} booked`
            : undefined,
    }));

    return (
        <div className="w-full p-4 sm:p-12">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <h1>SU Analytics</h1>
                <AsyncButton onClick={refetch} disabled={fetching}>
                    <i
                        aria-hidden="true"
                        className="bx bx-refresh bx-xs mr-2 mt-px"
                    />
                    Refresh
                </AsyncButton>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Tile label="Approved clubs" value={approved} />
                <Tile
                    label="Clubs that met"
                    value={data.clubs_meeting}
                    note={`${percent(data.clubs_meeting, approved)} of clubs`}
                />
                <Tile label="Meetings held" value={data.meetings_held} />
                <Tile
                    label="Rooms booked"
                    value={percent(data.room_days_booked, data.room_days_open)}
                    note="of open room-days"
                />
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-6">
                    <Card title="Meetings per Week">
                        <Columns data={weeks} column="Week" />
                    </Card>
                    <Card title="Attendance">
                        <div className="grid grid-cols-2 gap-3">
                            <Tile
                                label="Took attendance"
                                value={percent(
                                    data.meetings_with_attendance,
                                    data.meetings_held,
                                )}
                                note={`${data.meetings_with_attendance} of ${data.meetings_held} meetings`}
                            />
                            <Tile
                                label="Turnout"
                                value={percent(data.attendees, data.expected)}
                                note={
                                    data.meetings_with_attendance
                                        ? `~${Math.round(data.attendees / data.meetings_with_attendance)} per meeting`
                                        : undefined
                                }
                            />
                        </div>
                    </Card>
                </div>
                <Card title="Busiest Rooms">
                    <Bars data={rooms} column="Busiest rooms" />
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
