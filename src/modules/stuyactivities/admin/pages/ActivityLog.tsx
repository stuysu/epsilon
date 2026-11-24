import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import useCachedQuery from "../../../../lib/useCachedQuery";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import SelectField from "../../../../components/ui/input/SelectField";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";
import { SUPPORT_EMAIL } from "../../../../config/constants";
import { toNewYork } from "../../../../utils/NewYorkTime";
import {
    actorName,
    type AdminActionRow,
    CATEGORIES,
    categoryOf,
    summarize,
} from "../activityLog";

const PAGE_SIZE = 50;
const ALL = "all";

type Filters = { actors: { id: number; name: string }[] };

const dayLabel = (iso: string) => {
    const day = toNewYork(iso).startOf("day");
    const today = toNewYork().startOf("day");
    if (day.isSame(today)) return "Today";
    if (day.isSame(today.subtract(1, "day"))) return "Yesterday";
    return day.format(
        day.year() === today.year() ? "dddd, MMM D" : "dddd, MMM D, YYYY",
    );
};

const Entry = ({ row }: { row: AdminActionRow }) => {
    const category = categoryOf(row.action);
    const { pieces, quote, tags } = summarize(row);
    const time = toNewYork(row.created_at).format("h:mm A");
    return (
        <li className="flex gap-3 px-4 py-3.5 sm:gap-4">
            <span
                aria-hidden="true"
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-layer-2"
            >
                <i
                    className={`bx ${category.icon} text-xl ${category.color}`}
                />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 wrap-break-word">
                        <span className="text-typography-1 [font-variation-settings:'wght'_600]">
                            {actorName(row)}
                        </span>{" "}
                        {pieces.map((p, i) =>
                            p.strong ? (
                                <span
                                    key={i}
                                    className="text-typography-1 [font-variation-settings:'wght'_600]"
                                >
                                    {p.text}
                                </span>
                            ) : (
                                <span key={i}>{p.text}</span>
                            ),
                        )}
                    </p>
                    <time
                        dateTime={row.created_at}
                        className="shrink-0 text-sm tabular-nums text-typography-2 max-sm:hidden"
                    >
                        {time}
                    </time>
                </div>
                <time
                    dateTime={row.created_at}
                    className="text-xs tabular-nums text-typography-2 sm:hidden"
                >
                    {time}
                </time>
                {quote && (
                    <p className="mt-1.5 border-l-2 border-divider pl-3 text-sm wrap-break-word text-typography-2">
                        {quote}
                    </p>
                )}
                {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-md bg-layer-2 px-2 py-0.5 text-xs text-typography-2"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </li>
    );
};

const ActivityLog = () => {
    const [category, setCategory] = useState(ALL);
    const [actor, setActor] = useState(ALL);
    const [page, setPage] = useState(0);

    const filters = useCachedQuery<Filters>(
        ["admin", "activity-log", "filters"],
        async () => {
            const { data, error } = await supabase.rpc("admin_action_filters");
            if (error) throw error;
            return data as Filters;
        },
    );

    const { data, error, loading, refetch } = useCachedQuery<{
        rows: AdminActionRow[];
        total: number;
    }>(
        ["admin", "activity-log", category, actor, page],
        async () => {
            let query = supabase
                .from("admin_actions")
                .select(
                    "id, action, target_type, target_id, details, created_at, users (first_name, last_name)",
                    { count: "exact" },
                )
                .order("created_at", { ascending: false })
                .order("id", { ascending: false })
                .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
            const chosen = CATEGORIES.find((c) => c.key === category);
            if (chosen) query = query.in("action", chosen.actions);
            if (actor !== ALL) query = query.eq("actor_id", Number(actor));
            const { data, error, count } =
                await query.returns<AdminActionRow[]>();
            if (error) throw error;
            return { rows: data ?? [], total: count ?? 0 };
        },
        { staleTime: 10_000 },
    );

    const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
    const choose = (set: (value: string) => void) => (value: string) => {
        set(value);
        setPage(0);
    };

    const days: { label: string; rows: AdminActionRow[] }[] = [];
    for (const row of data?.rows ?? []) {
        const label = dayLabel(row.created_at);
        if (days.at(-1)?.label === label) days.at(-1)!.rows.push(row);
        else days.push({ label, rows: [row] });
    }

    return (
        <div className="w-full max-w-4xl p-4 sm:p-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h1 className="m-0">Activity Log</h1>
                <div className="grid w-full grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:w-96">
                    <SelectField
                        label="Type"
                        value={category}
                        onChange={choose(setCategory)}
                        options={[
                            { value: ALL, label: "All" },
                            ...CATEGORIES.map((c) => ({
                                value: c.key,
                                label: c.label,
                            })),
                        ]}
                        fullWidth
                    />
                    <SelectField
                        label="Admin"
                        value={actor}
                        onChange={choose(setActor)}
                        options={[
                            { value: ALL, label: "Everyone" },
                            ...(filters.data?.actors ?? []).map((a) => ({
                                value: String(a.id),
                                label: a.name,
                            })),
                        ]}
                        fullWidth
                    />
                </div>
                {!!filters.error && !filters.data && (
                    <p role="alert" className="w-full text-sm">
                        Couldn&apos;t load the list of admins.{" "}
                        <button
                            type="button"
                            onClick={() => filters.refetch()}
                            className="cursor-pointer underline underline-offset-2"
                        >
                            Try Again
                        </button>
                    </p>
                )}
            </div>

            {error && !data ? (
                <ContentUnavailable
                    icon="bx-history"
                    iconColor="text-red"
                    title="Couldn't Load the Log"
                    description={`Try again in a moment. If it keeps happening, contact ${SUPPORT_EMAIL}.`}
                    action={
                        <AsyncButton onClick={refetch}>Try Again</AsyncButton>
                    }
                />
            ) : loading || !data ? (
                <p role="status">Loading the log…</p>
            ) : data.rows.length === 0 ? (
                <ContentUnavailable
                    icon="bx-history"
                    iconColor="text-blue"
                    title="Nothing Here Yet"
                    description={
                        category === ALL && actor === ALL
                            ? "Admin actions show up here as they happen."
                            : "Nothing matches these filters."
                    }
                />
            ) : (
                <>
                    <div className="flex flex-col gap-6">
                        {days.map((day) => (
                            <section key={day.label}>
                                <h2 className="mb-2 text-sm text-typography-2 [font-variation-settings:'wght'_600]">
                                    {day.label}
                                </h2>
                                <ul className="flex flex-col divide-y divide-divider overflow-hidden rounded-xl bg-layer-1 shadow-control">
                                    {day.rows.map((row) => (
                                        <Entry key={row.id} row={row} />
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                    {pages > 1 && (
                        <nav
                            aria-label="Log pages"
                            className="mt-6 flex items-center justify-between gap-4"
                        >
                            <AsyncButton
                                onClick={() => setPage((p) => p - 1)}
                                disabled={page === 0}
                            >
                                Newer
                            </AsyncButton>
                            <span className="text-sm text-typography-2">
                                Page {page + 1} of {pages}
                            </span>
                            <AsyncButton
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page + 1 >= pages}
                            >
                                Older
                            </AsyncButton>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
};

export default ActivityLog;
