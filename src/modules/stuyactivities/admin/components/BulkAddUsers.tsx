import { ChangeEvent, useState } from "react";
import { useSnackbar } from "notistack";
import { supabase } from "../../../../lib/supabaseClient";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import AlertBanner from "../../../../components/ui/AlertBanner";
import { parseCsvLines, toCsv } from "../../../../utils/csv";
import { SUPPORT_EMAIL } from "../../../../config/constants";

type NewUser = {
    first_name: string;
    last_name: string;
    email: string;
    grad_year: number | null;
    is_faculty: boolean;
};

type Row = {
    line: number;
    user: NewUser;
    raw: Record<Column, string>;
    problem: string | null;
    added?: boolean;
};

const COLUMNS = [
    "first_name",
    "last_name",
    "email",
    "grad_year",
    "is_faculty",
] as const;
type Column = (typeof COLUMNS)[number];
const REQUIRED: Column[] = ["first_name", "last_name", "email"];

const ALIASES: Record<string, Column> = {
    first_name: "first_name",
    firstname: "first_name",
    first: "first_name",
    last_name: "last_name",
    lastname: "last_name",
    last: "last_name",
    email: "email",
    email_address: "email",
    grad_year: "grad_year",
    graduation_year: "grad_year",
    is_faculty: "is_faculty",
    faculty: "is_faculty",
};

const MAX_ROWS = 2000;
const BATCH = 100;
// emails go in the URL, so look them up a few dozen at a time
const LOOKUP = 50;
const EMAIL = /^[^\s@,;"<>]+@[^\s@,;"<>]+\.[^\s@,;"<>]+$/;
const YES = ["true", "yes", "y", "1", "t"];
const NO = ["false", "no", "n", "0", "f", ""];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const templateHref = () =>
    "data:text/csv;charset=utf-8," +
    encodeURIComponent(
        toCsv([
            [...COLUMNS],
            ["Alex", "Example", "aexample60@stuy.edu", 2030, false],
            ["Jordan", "Sample", "jsample@schools.nyc.gov", "", true],
        ]) + "\n",
    );

/* turns the file into rows with their problems, or a message about the file */
const readRows = (text: string): Row[] | string => {
    const [header, ...body] = parseCsvLines(text);
    if (!header) return "That file is empty.";

    const columns = header.cells.map(
        (h) =>
            ALIASES[
                h
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "_")
                    .replace(/^_|_$/g, "")
            ],
    );
    const missing = REQUIRED.filter((c) => !columns.includes(c));
    if (missing.length)
        return `The first row needs the column names. Missing: ${missing.join(", ")}.`;
    if (!body.length) return "That file has a header but no users.";
    if (body.length > MAX_ROWS)
        return `That file has ${body.length} users. Split it into files of ${MAX_ROWS} or fewer.`;

    const seen = new Map<string, number>();
    return body.map(({ cells, line }) => {
        const raw = Object.fromEntries(COLUMNS.map((c) => [c, ""])) as Record<
            Column,
            string
        >;
        columns.forEach((c, j) => {
            if (c) raw[c] = (cells[j] ?? "").trim();
        });
        const email = raw.email.toLowerCase();
        const faculty = raw.is_faculty.toLowerCase();
        const year = raw.grad_year;

        let problem: string | null = null;
        if (!raw.first_name || !raw.last_name) problem = "Missing a name";
        else if (raw.first_name.length > 60 || raw.last_name.length > 60)
            problem = "Name is over 60 characters";
        else if (!email) problem = "Missing an email";
        else if (!EMAIL.test(email) || email.length > 254)
            problem = "Email doesn't look right";
        else if (year && !/^\d{4}$/.test(year))
            problem = "Grad year should be 4 digits";
        else if (!YES.includes(faculty) && !NO.includes(faculty))
            problem = "is_faculty should be true or false";
        else if (seen.has(email))
            problem = `Same email as row ${seen.get(email)}`;

        if (email && !seen.has(email)) seen.set(email, line);

        return {
            line,
            raw,
            problem,
            user: {
                first_name: raw.first_name,
                last_name: raw.last_name,
                email,
                grad_year: year ? Number(year) : null,
                is_faculty: YES.includes(faculty),
            },
        };
    });
};

const BulkAddUsers = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [fileName, setFileName] = useState("");
    const [rows, setRows] = useState<Row[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const [progress, setProgress] = useState<string | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);

    const ready = rows.filter((r) => !r.problem && !r.added);
    const problems = rows.filter((r) => r.problem);
    const added = rows.filter((r) => r.added);

    const markExisting = async (parsed: Row[]) => {
        const emails = parsed
            .filter((r) => !r.problem)
            .map((r) => r.user.email);
        const existing = new Set<string>();
        for (let i = 0; i < emails.length; i += LOOKUP) {
            const { data, error } = await supabase
                .from("users")
                .select("email")
                .in("email", emails.slice(i, i + LOOKUP));
            if (error) throw error;
            data?.forEach((u) => existing.add(u.email.toLowerCase()));
        }
        return parsed.map((r) =>
            !r.problem && existing.has(r.user.email)
                ? { ...r, problem: "Already has an account" }
                : r,
        );
    };

    const onFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        setFileName(file.name);
        setSummary(null);
        setRows([]);
        setFileError(null);

        const parsed = readRows(await file.text());
        if (typeof parsed === "string") {
            setFileError(parsed);
            return;
        }
        setChecking(true);
        try {
            setRows(await markExisting(parsed));
        } catch {
            setFileError(
                `Couldn't check which users already exist. Try again, or contact ${SUPPORT_EMAIL}.`,
            );
        } finally {
            setChecking(false);
        }
    };

    const insertOne = async (row: Row) => {
        const { error } = await supabase.from("users").insert(row.user);
        if (!error) return null;
        return error.code === "23505"
            ? "Already has an account"
            : "Couldn't be added";
    };

    const addUsers = async () => {
        const todo = ready;
        const results = new Map<number, string | null>();
        for (let i = 0; i < todo.length; i += BATCH) {
            const batch = todo.slice(i, i + BATCH);
            setProgress(
                `Adding users… ${Math.min(i + BATCH, todo.length)} of ${todo.length}`,
            );
            const { error } = await supabase
                .from("users")
                .insert(batch.map((r) => r.user));
            if (!error) {
                batch.forEach((r) => results.set(r.line, null));
                continue;
            }
            // one bad row fails its whole batch, so find it
            for (const row of batch)
                results.set(row.line, await insertOne(row));
        }
        setProgress(null);

        const next = rows.map((r) =>
            results.has(r.line)
                ? results.get(r.line)
                    ? { ...r, problem: results.get(r.line)! }
                    : { ...r, added: true }
                : r,
        );
        setRows(next);
        const addedNow = [...results.values()].filter((v) => !v).length;
        const failedNow = results.size - addedNow;
        const skipped = next.filter((r) => r.problem).length;
        setSummary(
            `Added ${plural(addedNow, "user")}.` +
                (skipped ? ` ${plural(skipped, "row")} skipped.` : ""),
        );
        if (failedNow)
            enqueueSnackbar(
                `${plural(failedNow, "user")} couldn't be added. See the list for why.`,
                { variant: "error" },
            );
    };

    const clear = () => {
        setRows([]);
        setFileName("");
        setSummary(null);
        setFileError(null);
    };

    const busy = checking || progress !== null;

    return (
        <section aria-labelledby="bulk-add-title" className="mt-12">
            <h2 id="bulk-add-title">Add Many Users</h2>
            <p className="mb-4 max-w-3xl">
                Upload a CSV with a header row of{" "}
                <code className="break-all">{COLUMNS.join(",")}</code>.
                grad_year and is_faculty can be left blank. You'll see every row
                before anyone is added.
            </p>
            <div className="flex flex-wrap items-center gap-3">
                <AsyncButton component="label" isPrimary disabled={busy}>
                    {rows.length ? "Choose a Different CSV" : "Choose CSV File"}
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        className="sr-only"
                        disabled={busy}
                        onChange={onFileChosen}
                    />
                </AsyncButton>
                <a
                    href={templateHref()}
                    download="add-users-template.csv"
                    className="text-sm underline"
                >
                    Download a template
                </a>
                {fileName && (
                    <span className="text-sm text-typography-2 break-all">
                        {fileName}
                    </span>
                )}
            </div>

            <p role="status" className="mt-3 text-sm text-typography-2">
                {checking
                    ? "Checking for existing accounts…"
                    : (progress ?? "")}
            </p>

            {fileError && (
                <div className="mt-2 max-w-3xl">
                    <AlertBanner
                        severity="error"
                        onClose={() => setFileError(null)}
                    >
                        {fileError}
                    </AlertBanner>
                </div>
            )}
            {summary && (
                <div className="mt-2 max-w-3xl">
                    <AlertBanner
                        severity="success"
                        onClose={() => setSummary(null)}
                    >
                        {summary}
                    </AlertBanner>
                </div>
            )}

            {rows.length > 0 && (
                <>
                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <p>
                            <strong>{ready.length}</strong> ready ·{" "}
                            <strong>{problems.length}</strong> with problems
                            {added.length > 0 && (
                                <>
                                    {" "}
                                    · <strong>{added.length}</strong> added
                                </>
                            )}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <AsyncButton
                                isPrimary
                                disabled={!ready.length || busy}
                                onClick={addUsers}
                            >
                                {ready.length
                                    ? `Add ${plural(ready.length, "User")}`
                                    : "Nothing to Add"}
                            </AsyncButton>
                            <AsyncButton onClick={clear} disabled={busy}>
                                Clear
                            </AsyncButton>
                        </div>
                    </div>
                    <div className="mt-4 max-h-[60vh] overflow-auto rounded-xl bg-layer-1 shadow-control">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <caption className="sr-only">
                                Users in {fileName}
                            </caption>
                            <thead className="sticky top-0 bg-layer-2">
                                <tr>
                                    {[
                                        "Row",
                                        "Name",
                                        "Email",
                                        "Grad Year",
                                        "Faculty",
                                        "Status",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            scope="col"
                                            className="px-3 py-2 font-semibold"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr
                                        key={r.line}
                                        className="border-t border-divider"
                                    >
                                        <td className="px-3 py-2 text-typography-2">
                                            {r.line}
                                        </td>
                                        <td className="px-3 py-2">
                                            {r.raw.first_name} {r.raw.last_name}
                                        </td>
                                        <td className="px-3 py-2 break-all">
                                            {r.user.email || r.raw.email}
                                        </td>
                                        <td className="px-3 py-2">
                                            {r.raw.grad_year}
                                        </td>
                                        <td className="px-3 py-2">
                                            {YES.includes(
                                                r.raw.is_faculty.toLowerCase(),
                                            )
                                                ? "Yes"
                                                : NO.includes(
                                                        r.raw.is_faculty.toLowerCase(),
                                                    )
                                                  ? "No"
                                                  : r.raw.is_faculty}
                                        </td>
                                        <td
                                            className={`px-3 py-2 ${r.problem ? "text-red" : r.added ? "text-green" : ""}`}
                                        >
                                            {r.problem ??
                                                (r.added ? "Added" : "Ready")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </section>
    );
};

export default BulkAddUsers;
