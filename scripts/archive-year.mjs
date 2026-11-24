// Yearly rollover for the Archives page (src/modules/stuyactivities/archives.json).
//
// At the end of a school year, before clubs are cleared:
//   1. node scripts/archive-year.mjs export --year 2026-2027
//      Writes archive-2026-2027.csv (public charter fields of every approved
//      club, no member data) and prints how many there are.
//   2. Import the CSV into a new Google Sheet in the SU Drive and share it
//      as "anyone with the link can view".
//   3. node scripts/archive-year.mjs add --year 2026-2027 --sheet <link> --count <n>
//      Puts the year at the top of archives.json. Commit that file.
//
// export reads SUPABASE_URL and SUPABASE_ANON_KEY (or the REACT_APP_ ones)
// from the shell. Don't commit the CSV.
import { readFileSync, writeFileSync } from "node:fs";

const ARCHIVES = new URL(
    "../src/modules/stuyactivities/archives.json",
    import.meta.url,
);
const SITE = "https://epsilon.stuysu.org";
// LOCKED clubs are approved but not yet unlocked; ADMIN ones are SU-run
const STATES = ["UNLOCKED", "LOCKED"];

const [command, ...rest] = process.argv.slice(2);
const option = (name) => {
    const i = rest.indexOf(`--${name}`);
    return i === -1 ? undefined : rest[i + 1];
};
const fail = (message) => {
    console.error(message);
    process.exit(1);
};

const year = option("year");
const match = /^(\d{4})-(\d{4})$/.exec(year ?? "");
if (!match || Number(match[2]) !== Number(match[1]) + 1)
    fail("Give the school year as --year 2026-2027.");

// a leading = + - @ would run as a formula in Sheets
const cell = (value) => {
    let text = Array.isArray(value) ? value.join(", ") : String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const exportYear = async () => {
    const url = process.env.SUPABASE_URL ?? process.env.REACT_APP_SUPABASE_URL;
    const key =
        process.env.SUPABASE_ANON_KEY ??
        process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (!url || !key) fail("Set SUPABASE_URL and SUPABASE_ANON_KEY first.");

    const fields =
        "name,url,mission,purpose,meeting_schedule,meeting_days,commitment_level,tags";
    const query = `select=${fields}&state=in.(${STATES.join(",")})&order=name`;
    const response = await fetch(
        `${url.replace(/\/$/, "")}/rest/v1/organizations?${query}`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!response.ok)
        fail(
            `Couldn't read clubs (${response.status}): ${await response.text()}`,
        );
    const clubs = await response.json();

    const header = [
        "Name",
        "Link",
        "Mission",
        "Purpose",
        "Meeting Schedule",
        "Meeting Days",
        "Commitment",
        "Tags",
    ];
    const rows = clubs.map((c) => [
        c.name,
        `${SITE}/${c.url}`,
        c.mission,
        c.purpose,
        c.meeting_schedule,
        c.meeting_days,
        c.commitment_level,
        c.tags,
    ]);
    const file = `archive-${year}.csv`;
    writeFileSync(
        file,
        [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") +
            "\r\n",
    );
    console.log(`Wrote ${clubs.length} clubs to ${file}.`);
    console.log(
        `Next: upload it to a Google Sheet, then run\n  node scripts/archive-year.mjs add --year ${year} --sheet <link> --count ${clubs.length}`,
    );
};

const addYear = () => {
    const sheet = option("sheet");
    const count = Number(option("count"));
    if (!sheet?.startsWith("https://docs.google.com/"))
        fail(
            "Give the Google Sheet link as --sheet https://docs.google.com/...",
        );
    if (!Number.isInteger(count) || count < 0)
        fail("Give the number of clubs as --count <n>.");

    const archives = JSON.parse(readFileSync(ARCHIVES, "utf8"));
    if (archives.some((a) => a.year === year))
        fail(`${year} is already in archives.json; edit it there instead.`);
    archives.unshift({ year, url: sheet, activities: count });
    archives.sort((a, b) => b.year.localeCompare(a.year));
    writeFileSync(ARCHIVES, JSON.stringify(archives, null, 4) + "\n");
    console.log(`Added ${year} (${count} Activities) to archives.json.`);
};

if (command === "export") await exportYear();
else if (command === "add") addYear();
else fail("Usage: node scripts/archive-year.mjs export|add --year YYYY-YYYY");
