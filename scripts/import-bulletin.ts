// Publishes the newest Long bulletin from the school's document hub, using the
// same parsing and review defaults as the upload page. Logs counts only, since
// the bulletin is for Stuyvesant students and these logs can be public.
//   npm run import-bulletin -- [--file bulletin.pdf] [--dry-run]
import { appendFileSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { extractBulletinLines } from "../src/modules/opportunities/bulletin/extract";
import { parseBulletin } from "../src/modules/opportunities/bulletin/parse";
import {
    buildReview,
    findNoLongerListed,
    findPublishProblems,
    suggestArchive,
    toImportEntries,
} from "../src/modules/opportunities/bulletin/sync";
import { fetchAllOpportunities } from "../src/modules/opportunities/catalogQuery";
import { getTodayEastern } from "../src/modules/opportunities/utils";

const HUB = "https://talos.stuy.edu/cms/pages/document-hub/";
const USER_AGENT = "StuySU Epsilon bulletin import";

const args = process.argv.slice(2);
const filePath = args.includes("--file")
    ? args[args.indexOf("--file") + 1]
    : null;
const dryRun = args.includes("--dry-run");

const report = (line: string) => {
    console.log(line);
    if (process.env.GITHUB_STEP_SUMMARY)
        appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n`);
};

// quoted titles stay out of the logs
const redact = (message: string) => message.replace(/"[^"]*"/g, '"…"');

const env = (name: string) => {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not set.`);
    return value;
};

const getPage = async (url: string) => {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`${url} returned ${res.status}.`);
    return res;
};

type Listing = { url: string; fileName: string; publishedOn: string | null };

// SOB_10L_November_13_2026_1.pdf; issue 1 has no L or S
const FILE_PATTERN = /^SOB_(\d+)([LS]?)_([A-Za-z]+)_(\d{1,2})_(\d{4})/i;

// the tag changes every school year, so take the newest one the hub lists
const findLatestLong = async (): Promise<Listing | null> => {
    const hub = await (await getPage(HUB)).text();
    const tags = [
        ...new Set(hub.match(/opportunities-bulletins-\d{4}-\d{4}/g) ?? []),
    ].sort();
    const tag = tags.at(-1);
    if (!tag) throw new Error("The document hub lists no bulletin tag.");

    const page = await (await getPage(`${HUB}?tag=${tag}`)).text();
    const listings = [
        ...page.matchAll(/href="(\/cms\/documents\/(\d+)\/([^"]+\.pdf))"/gi),
    ]
        .map(([, path, id, fileName]) => {
            const match = fileName.match(FILE_PATTERN);
            const date =
                match && new Date(`${match[3]} ${match[4]}, ${match[5]} UTC`);
            return {
                url: new URL(path, HUB).href,
                fileName,
                id: Number(id),
                isShort: match?.[2].toUpperCase() === "S",
                publishedOn:
                    date && !Number.isNaN(date.valueOf())
                        ? date.toISOString().slice(0, 10)
                        : null,
            };
        })
        .filter((listing) => !listing.isShort);
    // newest date first; a re-uploaded file has the higher id
    listings.sort(
        (a, b) =>
            (b.publishedOn ?? "").localeCompare(a.publishedOn ?? "") ||
            b.id - a.id,
    );
    return listings[0] ?? null;
};

const readPdf = async (data: Uint8Array) => {
    const task = pdfjs.getDocument({
        data,
        verbosity: 0,
        fontExtraProperties: true,
    });
    try {
        return parseBulletin(
            await extractBulletinLines((await task.promise) as never),
        );
    } finally {
        await task.destroy();
    }
};

const main = async () => {
    const supabase = createClient(
        env("SUPABASE_URL"),
        env("SUPABASE_ANON_KEY"),
        { accessToken: async () => env("BULLETIN_IMPORTER_TOKEN") },
    );

    const { data: latest, error: latestError } = await supabase
        .from("opportunity_bulletins")
        .select("issue, published_on")
        .order("published_on", { ascending: false })
        .order("id", { ascending: false })
        .limit(1);
    if (latestError)
        throw new Error(`Reading bulletins: ${latestError.message}`);
    const newest = latest[0] ?? null;

    let data: Uint8Array;
    let fileName: string;
    if (filePath) {
        data = new Uint8Array(readFileSync(filePath));
        fileName = filePath.split("/").at(-1)!;
    } else {
        const listing = await findLatestLong();
        if (!listing) {
            report("No Long bulletin is posted yet.");
            return;
        }
        if (
            newest &&
            listing.publishedOn &&
            listing.publishedOn <= newest.published_on
        ) {
            report(
                `Up to date: #${newest.issue} (${newest.published_on}) is the newest posted.`,
            );
            return;
        }
        data = new Uint8Array(await (await getPage(listing.url)).arrayBuffer());
        fileName = listing.fileName;
    }

    const { meta, entries } = await readPdf(data);
    if (newest && meta.publishedOn <= newest.published_on) {
        report(
            `Up to date: #${meta.issue} (${meta.publishedOn}) is already published or older.`,
        );
        return;
    }

    const [opportunities, categoryRes, eligibilityRes] = await Promise.all([
        fetchAllOpportunities(supabase),
        supabase
            .from("opportunity_categories")
            .select("id, name, parent_id, position"),
        supabase
            .from("opportunity_eligibilities")
            .select("id, name, grade, position"),
    ]);
    if (opportunities.error || categoryRes.error || eligibilityRes.error)
        throw new Error("Reading the current catalog failed.");
    const baseline = opportunities.data;

    // the upload page's defaults, as if an admin published without changes
    const review = buildReview(entries, baseline);
    const archiveIds = suggestArchive(
        findNoLongerListed(review, baseline, meta),
        getTodayEastern(),
    );
    const problems = findPublishProblems(review, categoryRes.data, baseline);
    const included = review.filter((entry) => entry.include);
    const flagged = included.filter((entry) => entry.warnings.length).length;

    report(
        `Bulletin #${meta.issue} (${meta.publishedOn}): ${included.length} opportunities, ${flagged} flagged, ${archiveIds.length} to archive.`,
    );
    if (problems.length) {
        throw new Error(
            `${problems.length} problem(s) block publishing. Upload this bulletin on the Opportunities admin page to fix them.`,
        );
    }
    if (dryRun) {
        report("Dry run, so nothing was published.");
        return;
    }

    const { error } = await supabase.rpc("import_opportunity_bulletin", {
        bulletin: {
            issue: meta.issue,
            published_on: meta.publishedOn,
            file_name: fileName,
        },
        entries: toImportEntries(
            review,
            categoryRes.data,
            eligibilityRes.data,
            baseline,
        ),
        archive_ids: archiveIds,
    });
    if (error) throw new Error(`Publishing failed: ${redact(error.message)}`);
    report(`Published #${meta.issue}.`);
};

main().catch((error: Error) => {
    report(`Bulletin import failed: ${redact(error.message)}`);
    process.exitCode = 1;
});
