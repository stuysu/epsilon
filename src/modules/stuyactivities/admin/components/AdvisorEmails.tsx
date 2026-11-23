import { useCallback, useEffect, useRef, useState } from "react";
import { useSnackbar } from "notistack";
import { supabase } from "../../../../lib/supabaseClient";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import SelectField from "../../../../components/ui/input/SelectField";

type Person = { email: string; first_name: string; last_name: string };
type Advisor = { email: string; person?: Person; onRoster: boolean };

const PAGE = 1000;
const EMAIL = /[^\s@<>()[\],;:"']+@[^\s@<>()[\],;:"']+\.[a-z]{2,}/gi;

// The server caps rows per request, so read in pages.
const fetchAll = async <T,>(
    page: (
        from: number,
        to: number,
    ) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T[] | null> => {
    const rows: T[] = [];
    for (let from = 0; ; from += PAGE) {
        const { data, error } = await page(from, from + PAGE - 1);
        if (error || !Array.isArray(data)) return null;
        rows.push(...(data as T[]));
        if (data.length < PAGE) return rows;
    }
};

const fetchAdvisors = async (): Promise<Advisor[] | null> => {
    const [memberships, charters, faculty] = await Promise.all([
        fetchAll<{ users: Person }>((from, to) =>
            supabase
                .from("memberships")
                .select(
                    "id, users!inner(email, first_name, last_name), organizations!inner(state)",
                )
                .eq("role", "ADVISOR")
                .eq("active", true)
                .neq("organizations.state", "PENDING")
                .order("id")
                .range(from, to),
        ),
        fetchAll<{ faculty_email: string }>((from, to) =>
            supabase
                .from("organizations")
                .select("id, faculty_email")
                .neq("state", "PENDING")
                .not("faculty_email", "is", null)
                .order("id")
                .range(from, to),
        ),
        fetchAll<Person>((from, to) =>
            supabase
                .from("users")
                .select("id, email, first_name, last_name")
                .eq("is_faculty", true)
                .order("id")
                .range(from, to),
        ),
    ]);
    if (!memberships || !charters || !faculty) return null;

    const advisors = new Map<string, Advisor>();
    for (const { users } of memberships) {
        const email = users.email.toLowerCase();
        advisors.set(email, { email, person: users, onRoster: true });
    }

    // A faculty account named on a charter is put on the roster
    // automatically, so if it isn't there the club removed them.
    const facultyEmails = new Set(faculty.map((p) => p.email.toLowerCase()));
    for (const { faculty_email } of charters) {
        for (const match of faculty_email.match(EMAIL) ?? []) {
            const email = match.toLowerCase();
            if (advisors.has(email) || facultyEmails.has(email)) continue;
            advisors.set(email, { email, onRoster: false });
        }
    }

    const sortKey = (a: Advisor) =>
        a.person ? `${a.person.last_name} ${a.person.first_name}` : a.email;
    return [...advisors.values()].sort(
        (a, b) =>
            Number(!a.person) - Number(!b.person) ||
            sortKey(a).localeCompare(sortKey(b)),
    );
};

const nameOf = (a: Advisor) =>
    a.person && `${a.person.first_name} ${a.person.last_name}`.trim();

// Names with punctuation must be quoted for mail apps to parse them.
const quoteName = (name: string) =>
    /[",;:<>@()[\]\\.]/.test(name)
        ? `"${name.replace(/["\\]/g, "\\$&")}"`
        : name;

const formats = {
    both: {
        label: "Name and email",
        separator: ", ",
        item: (a: Advisor) => {
            const name = nameOf(a);
            return name ? `${quoteName(name)} <${a.email}>` : a.email;
        },
    },
    names: {
        label: "Names only",
        separator: "\n",
        item: (a: Advisor) => nameOf(a) || a.email,
    },
    emails: {
        label: "Emails only",
        separator: ", ",
        item: (a: Advisor) => a.email,
    },
};
type Format = keyof typeof formats;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const AdvisorEmails = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [advisors, setAdvisors] = useState<Advisor[] | null>();
    const [format, setFormat] = useState<Format>("both");
    const [manual, setManual] = useState<string>();
    const manualRef = useRef<HTMLTextAreaElement>(null);

    const load = useCallback(() => {
        setAdvisors(undefined);
        fetchAdvisors().then(setAdvisors);
    }, []);
    useEffect(load, [load]);

    useEffect(() => {
        manualRef.current?.focus();
        manualRef.current?.select();
    }, [manual]);

    // Runs straight from the click: Safari only allows copying then.
    const copy = async (rosterOnly: boolean) => {
        if (!advisors) return;
        const chosen = rosterOnly
            ? advisors.filter((a) => a.onRoster)
            : advisors;
        if (chosen.length === 0) {
            enqueueSnackbar("There are no advisors to copy.", {
                variant: "info",
            });
            return;
        }
        const { item, separator } = formats[format];
        const text = chosen.map(item).join(separator);
        try {
            await navigator.clipboard.writeText(text);
            setManual(undefined);
            enqueueSnackbar(`Copied ${plural(chosen.length, "advisor")}.`, {
                variant: "success",
            });
        } catch {
            setManual(text);
            enqueueSnackbar("Couldn't copy. Copy the list below instead.", {
                variant: "warning",
            });
        }
    };

    const count = (rosterOnly: boolean) =>
        advisors
            ? ` (${advisors.filter((a) => !rosterOnly || a.onRoster).length})`
            : "";
    const unnamed = advisors?.filter((a) => !a.person).length ?? 0;

    return (
        <section className="flex flex-col items-start gap-3">
            <h2>Faculty Advisors</h2>
            {advisors === null ? (
                <div className="flex flex-wrap items-center gap-3">
                    <p>Couldn't load advisors.</p>
                    <AsyncButton onClick={load}>Try again</AsyncButton>
                </div>
            ) : (
                <>
                    <div className="w-full max-w-xs">
                        <SelectField
                            label="Format"
                            fullWidth
                            value={format}
                            onChange={(value) => {
                                setFormat(value as Format);
                                setManual(undefined);
                            }}
                            options={Object.entries(formats).map(
                                ([value, f]) => ({ value, label: f.label }),
                            )}
                        />
                    </div>
                    {format !== "emails" && unnamed > 0 && (
                        <p className="text-sm">
                            {plural(unnamed, "advisor")} in the all faculty
                            advisors list {unnamed === 1 ? "has" : "have"} no
                            name on file, so they are listed by email.
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        <AsyncButton
                            disabled={!advisors}
                            onClick={() => copy(true)}
                        >
                            Copy active club advisors{count(true)}
                        </AsyncButton>
                        <AsyncButton
                            disabled={!advisors}
                            onClick={() => copy(false)}
                        >
                            Copy all faculty advisors{count(false)}
                        </AsyncButton>
                    </div>
                </>
            )}
            {manual && (
                <textarea
                    ref={manualRef}
                    readOnly
                    aria-label="Advisor list"
                    className="h-32 w-full rounded-xl bg-layer-2 p-3 text-sm"
                    value={manual}
                />
            )}
        </section>
    );
};

export default AdvisorEmails;
