import {
    cleanText,
    getSafeLinks,
    getTitleKey,
    parseCost,
    parseDeadline,
    parseEligibilityTags,
    isRollingText,
} from "./normalize";

export type BulletinLine = {
    page: number;
    text: string;
    font: string;
    size: number;
    links: string[];
};

export type BulletinMeta = {
    issue: string;
    publishedOn: string;
    // only a Long issue lists everything
    isLong: boolean;
};

export type ParsedEntry = {
    titleKey: string;
    title: string;
    description: string;
    dateText: string | null;
    location: string | null;
    costText: string | null;
    costMin: number | null;
    costMax: number | null;
    deadline: string | null;
    deadlineText: string | null;
    eligibilityText: string | null;
    eligibilityTags: string[];
    preferredTags: string[];
    eligibilityUnclear: boolean;
    links: string[];
    label: string | null;
    categories: string[];
    page: number;
    warnings: string[];
    include: boolean;
};

export type ParsedBulletin = {
    meta: BulletinMeta;
    entries: ParsedEntry[];
};

export class BulletinFormatError extends Error {}

type FieldName = "eligibility" | "date" | "location" | "cost" | "deadline";
type LineField = FieldName | "link";

const FIELD_LABELS: Record<string, LineField> = {
    eligible: "eligibility",
    eligibility: "eligibility",
    date: "date",
    dates: "date",
    location: "location",
    locations: "location",
    cost: "cost",
    costs: "cost",
    link: "link",
    links: "link",
    applicationlink: "link",
    applicationlinks: "link",
    registrationlink: "link",
    registrationlinks: "link",
    applicationdeadline: "deadline",
    applicationdeadlines: "deadline",
    registrationdeadline: "deadline",
    registrationdeadlines: "deadline",
    deadline: "deadline",
    deadlines: "deadline",
};
// other Title Case labels are read by their last word
const FIELD_SUFFIXES: [RegExp, LineField][] = [
    [/deadlines?$/, "deadline"],
    [/dates?$/, "date"],
    [/links?$/, "link"],
];
const MAX_SUFFIX_LABEL_WORDS = 4;
// a suffix label needs a value it could hold
const SUFFIX_VALUES: Record<LineField, RegExp> = {
    deadline: /\d|rolling|tb[ad]|various|varies|ongoing|open|soon/i,
    date: /\d|various|varies|tb[ad]|ongoing|weekly|daily|weekends?|(mon|tues|wednes|thurs|fri|satur|sun)days?/i,
    link: /^$|https?:|www\.|\.(org|com|edu|gov|net)\b/i,
    eligibility: /./,
    location: /./,
    cost: /./,
};

// most specific first, since "STEM" also heads its subsections
const CATEGORY_HEADINGS: [RegExp, string][] = [
    [/^events of interest/, "Events of Interest"],
    [/^academic/, "Academic Programs"],
    [/^business/, "Business & Jobs"],
    [/^community service/, "Community Service"],
    [/^college prep/, "College Prep"],
    [/^leadership/, "Leadership, Government, Law, Advocacy, International"],
    [/^museums?/, "Museums, Art & Photography"],
    [/^parks/, "Parks & Nature"],
    [/^engineering/, "Engineering, Math & Computer Science"],
    [/^medical/, "Medical & Life Sciences"],
    [/^stem/, "STEM Opportunities"],
    [/^theater/, "Theater, Writing, Music, Performing Arts, Video"],
    [/^contests?/, "Contests & Competitions"],
    [/^opportunity lists/, "Opportunity Lists & Resources"],
    [/^scholarships?/, "Scholarships"],
];

// status labels vary week to week but are built from these words
const STATUS_WORDS = [
    "event",
    "events",
    "date",
    "dates",
    "deadline",
    "deadlines",
    "session",
    "sessions",
    "information",
    "info",
    "audition",
    "auditions",
    "first",
    "second",
    "third",
    "next",
    "early",
    "priority",
    "final",
    "last",
    "registration",
    "application",
    "applications",
    "open",
    "house",
    "interview",
    "interviews",
    "workshop",
    "workshops",
    "class",
    "classes",
    "program",
    "submission",
];
const STATUS_ENDINGS = [
    "approaching",
    "today",
    "tomorrow",
    "extended",
    "updated",
    "changed",
    "rescheduled",
    "new",
];
const STATUS_PHRASE = new RegExp(
    `^(?:${STATUS_WORDS.join("|")})*(?:${STATUS_ENDINGS.join("|")})$`,
);
// combined labels are checked part by part
const isStatusLabel = (raw: string) =>
    raw
        .toLowerCase()
        .split(/\s*(?:&|\/|\band\b)\s*/)
        .every((part) => STATUS_PHRASE.test(part.replace(/\s+/g, "")));
// a label at the end of a title
const TRAILING_LABEL = /\s*(?::|\s[–—-])\s*([A-Za-z][A-Za-z &/]{0,48})$/;
// "3-New:", but not "3-D Printing"
const NUMBER_PREFIX = /^\d{1,2}\s*[–—-](?:\s+|(?=[A-Z][a-z]))/;
const WEEKDAY = /^(mon|tues|wednes|thurs|fri|satur|sun)days?\b/i;
const MAX_TITLE_LENGTH = 140;
const MIN_TITLE_CAPITALS = 0.35;

const getCategoryFromHeading = (text: string) => {
    const normalized = text.toLowerCase().trim();
    return (
        CATEGORY_HEADINGS.find(([pattern]) => pattern.test(normalized))?.[1] ??
        null
    );
};

const matchField = (text: string, { allowSuffix = true } = {}) => {
    const match = text.match(/^([A-Za-z][A-Za-z0-9 ()]{1,40}?)\s*:\s*(.*)$/);
    if (!match) return null;
    const rawLabel = match[1].trim();
    // "New Application Deadline:" marks a date that moved, not a separate field
    const label = rawLabel
        .replace(/\(s\)/gi, "s")
        .replace(/\s+/g, "")
        .toLowerCase()
        .replace(/^(new|updated|extended|revised)(?=.)/, "");
    if (FIELD_LABELS[label])
        return { field: FIELD_LABELS[label], value: match[2] };

    const words = rawLabel.split(/\s+/);
    const isShortTitleCase =
        words.length <= MAX_SUFFIX_LABEL_WORDS &&
        words.every((word) => /^[A-Z(0-9]/.test(word));
    const suffix = FIELD_SUFFIXES.find(([pattern]) => pattern.test(label));
    if (
        !allowSuffix ||
        !isShortTitleCase ||
        !suffix ||
        isStatusLabel(rawLabel) ||
        !SUFFIX_VALUES[suffix[1]].test(match[2])
    ) {
        return null;
    }

    // keep the kind of deadline, since a listing may have several
    const value =
        suffix[1] === "deadline" ? `${rawLabel}: ${match[2]}` : match[2];
    return { field: suffix[1], value };
};

const toLabelText = (raw: string) => {
    const compact = raw.replace(/\s+/g, "").toLowerCase();
    if (compact === "new") return "New";
    if (compact === "updated") return "Updated";
    if (compact === "deadlinetoday") return "Deadline Today";
    if (compact.includes("today")) return "Today";
    if (compact === "deadlinetomorrow") return "Deadline Tomorrow";
    if (compact.includes("tomorrow")) return "Tomorrow";
    if (compact.includes("extended")) return "Deadline Extended";
    if (compact.includes("deadline")) return "Deadline Approaching";
    return "Coming Up";
};

// splits label prefixes off a line
const stripStatus = (text: string) => {
    let rest = text;
    let label: string | null = null;

    for (;;) {
        // numbered listings put the label after the number: "3-New: Winter Lab"
        const match = rest.match(
            /^(?:\d{1,2}\s*[–—-](?:\s+|(?=[A-Z][a-z])))?([A-Za-z][A-Za-z &/]{0,60}?)\s*:\s*(.*)$/,
        );
        if (!match || !isStatusLabel(match[1])) break;
        // keep the most specific one: "New: Deadline Approaching" is urgent first
        label =
            label && toLabelText(match[1]) === "New"
                ? label
                : toLabelText(match[1]);
        rest = match[2];
    }
    return { label, rest };
};

const hasFewCapitals = (text: string) => {
    const words = text.split(/\s+/).filter((word) => word.length > 3);
    if (words.length < 6) return false;
    const capitalized = words.filter((word) => /^[A-Z“"(]/.test(word));
    return capitalized.length / words.length < MIN_TITLE_CAPITALS;
};

// "U.S." or "Inc." at the end of a line is a wrapped title, not a full stop.
const endsInAbbreviation = (text: string) =>
    /(\b[A-Z]\.){2,}$|\b(Jr|Sr|Inc|St|Dr|Mt|Co|Ltd|Corp)\.$/.test(text);

const looksLikeSentence = (text: string) =>
    (/[.!?”"]$/.test(text) && !endsInAbbreviation(text)) ||
    /^[a-z]/.test(text) ||
    text.length > MAX_TITLE_LENGTH ||
    hasFewCapitals(text);

// a real title opens with a capital or number
const startsLikeTitle = (text: string) => /^[A-Z0-9]/.test(text);

// closes a bracket from the line above
const closesBracket = (text: string) =>
    (text.match(/\)/g)?.length ?? 0) > (text.match(/\(/g)?.length ?? 0);

// a wrapped piece of a long web address
const looksLikeAddressPiece = (text: string) =>
    !/\s/.test(text) && /[/=?&_.-]/.test(text);

// bold schedules sit inside a listing
const looksLikeSchedule = (text: string) =>
    WEEKDAY.test(text) || /\b\d{1,2}:\d{2}\b/.test(text);

type Draft = {
    title: string;
    label: string | null;
    category: string;
    page: number;
    description: string[];
    fields: Partial<Record<FieldName, string[]>>;
    lastField: LineField | null;
    linkTexts: string[];
    // targets on lines that print an address, checked against that address
    addressTargets: string[];
    // targets on ordinary words, such as a hyperlinked program name
    annotatedLinks: string[];
    titleOpen: boolean;
};

const readMeta = (lines: BulletinLine[]): BulletinMeta => {
    const firstPage = lines.filter((line) => line.page === 1);
    const issue = firstPage
        .map((line) => line.text.match(/bulletin\s*#\s*([0-9]+\s*[a-z]?)/i))
        .find(Boolean)?.[1];
    const date = firstPage
        .map((line) => line.text.match(/^([A-Za-z]+\s+\d{1,2},\s*\d{4})$/))
        .find(Boolean)?.[1];
    if (!issue || !date || Number.isNaN(Date.parse(`${date} UTC`))) {
        throw new BulletinFormatError(
            "This doesn't look like a Student Opportunity Bulletin. The first page needs its issue number and date.",
        );
    }

    const normalizedIssue = issue.replace(/\s+/g, "").toUpperCase();
    return {
        issue: normalizedIssue,
        publishedOn: new Date(`${date} UTC`).toISOString().slice(0, 10),
        isLong: normalizedIssue.endsWith("L"),
    };
};

const DEADLINE_HINT =
    /\b(deadlines?|apply by|due (by|on)|register by|registration|submit(ted)? by|applications? (are )?(due|close))\b/i;

export const getEntryWarnings = (
    entry: Omit<ParsedEntry, "warnings" | "include">,
) => {
    const hasDetails = [
        entry.dateText,
        entry.location,
        entry.costText,
        entry.deadlineText,
        entry.eligibilityText,
    ].some(Boolean);

    const warnings: string[] = [];
    if (!hasDetails) warnings.push("No details found");
    if (!entry.links.length) warnings.push("No link found");
    if (!entry.deadlineText) {
        // most listings with no deadline field have none at all
        const hint = [entry.dateText, entry.description].some((text) =>
            DEADLINE_HINT.test(text ?? ""),
        );
        if (hint) warnings.push("Deadline may be in the listing");
    } else if (!entry.deadline && !isRollingText(entry.deadlineText)) {
        warnings.push("Deadline has no date");
    }
    if (entry.eligibilityUnclear) warnings.push("Check eligibility tags");
    if (entry.title.length < 6 || looksLikeSentence(entry.title)) {
        warnings.push("Title looks wrong");
    }
    return warnings;
};

// Outlook "safelinks" wrap the real address in a url= parameter.
const unwrapLink = (link: string) => {
    try {
        const url = new URL(link);
        if (url.hostname.endsWith("safelinks.protection.outlook.com")) {
            return url.searchParams.get("url") ?? link;
        }
    } catch {
        // left for getSafeLinks to drop
    }
    return link;
};

// a printed address can lose a hyphen where it wraps
const siteOf = (link: string) =>
    new URL(link).hostname.replace(/^www\./, "").replace(/-/g, "");

// the printed site comes first; a link target elsewhere is kept after it
const chooseLinks = (draft: Draft) => {
    const printed = getSafeLinks(
        draft.linkTexts.map((text) =>
            unwrapLink(
                text.replace(/\s+/g, "").replace(/^www\./i, "https://www."),
            ),
        ),
    );
    const targets = getSafeLinks(draft.addressTargets.map(unwrapLink));
    const printedSites = new Set(printed.map(siteOf));
    const onPrintedSites = targets.filter((link) =>
        printedSites.has(siteOf(link)),
    );
    const coveredSites = new Set(onPrintedSites.map(siteOf));
    return getSafeLinks([
        ...onPrintedSites,
        ...printed.filter((link) => !coveredSites.has(siteOf(link))),
        ...targets.filter((link) => !printedSites.has(siteOf(link))),
        ...draft.annotatedLinks.map(unwrapLink),
    ]);
};

const finishEntry = (draft: Draft, publishedOn: string): ParsedEntry => {
    const read = (field: FieldName) =>
        draft.fields[field]?.length
            ? cleanText(draft.fields[field]!.join("; "))
            : null;

    const rawTitle = cleanText(draft.title).replace(NUMBER_PREFIX, "");
    const trailingMatch = rawTitle.match(TRAILING_LABEL);
    const trailing =
        trailingMatch && isStatusLabel(trailingMatch[1]) ? trailingMatch : null;
    const title = (
        trailing ? rawTitle.slice(0, trailing.index) : rawTitle
    ).replace(/:$/, "");
    const deadlineText = read("deadline");
    const eligibilityText = read("eligibility");
    const costText = read("cost");
    const cost = parseCost(costText);
    const deadline = parseDeadline(deadlineText, publishedOn);
    const eligibility = parseEligibilityTags(eligibilityText);
    const links = chooseLinks(draft);
    const description = cleanText(draft.description.join(" "));
    const hasFields = Object.keys(draft.fields).length > 0;

    const entry = {
        titleKey: getTitleKey(title),
        title,
        description,
        dateText: read("date"),
        location: read("location"),
        costText,
        costMin: cost.min,
        costMax: cost.max,
        deadline,
        deadlineText,
        eligibilityText,
        eligibilityTags: eligibility.tags,
        preferredTags: eligibility.preferredTags,
        eligibilityUnclear: eligibility.unclear,
        links,
        label: draft.label ?? (trailing ? toLabelText(trailing[1]) : null),
        categories: [draft.category],
        page: draft.page,
    };

    return {
        ...entry,
        warnings: getEntryWarnings(entry),
        // Bare headings such as "More events:" have nothing a student can act on.
        include: hasFields || links.length > 0 || description.length >= 40,
    };
};

// The same program is often listed under several categories.
const mergeDuplicates = (entries: ParsedEntry[], publishedOn: string) => {
    const byKey = new Map<string, ParsedEntry>();

    entries.forEach((entry) => {
        const existing = byKey.get(entry.titleKey);
        if (!existing) {
            byKey.set(entry.titleKey, entry);
            return;
        }

        const preferred = entry.warnings.length < existing.warnings.length;
        const [main, other] = preferred ? [entry, existing] : [existing, entry];
        const merged = {
            ...other,
            ...Object.fromEntries(
                Object.entries(main).filter(([, value]) => value !== null),
            ),
            description:
                main.description.length >= other.description.length
                    ? main.description
                    : other.description,
            links: getSafeLinks([...main.links, ...other.links]),
            categories: [
                ...new Set([...existing.categories, ...entry.categories]),
            ],
            page: Math.min(existing.page, entry.page),
            include: main.include || other.include,
        } as ParsedEntry;
        // the text can come from either copy, so derive the rest from it again
        const cost = parseCost(merged.costText);
        const eligibility = parseEligibilityTags(merged.eligibilityText);
        const recomputed = {
            ...merged,
            costMin: cost.min,
            costMax: cost.max,
            deadline: parseDeadline(merged.deadlineText, publishedOn),
            eligibilityTags: eligibility.tags,
            preferredTags: eligibility.preferredTags,
            eligibilityUnclear: eligibility.unclear,
        };
        byKey.set(entry.titleKey, {
            ...recomputed,
            warnings: getEntryWarnings(recomputed),
        });
    });
    return [...byKey.values()];
};

// "RETURN TO TOP" links and tiny ordinal suffixes such as "th"
const isPageChrome = ({ text, size }: BulletinLine) =>
    size < 11 && /^(st|nd|rd|th|\s)+$/i.test(text);

// "RETURN TO TOP" ends a section; notes after it belong to no listing
const isSectionEnd = ({ text }: BulletinLine) => /^return to top/i.test(text);

// wrapped lines continue the latest value
const appendToField = (draft: Draft, field: FieldName, text: string) => {
    const values = (draft.fields[field] ??= []);
    if (values.length) values[values.length - 1] += ` ${text}`;
    else values.push(text);
};

const addField = (
    draft: Draft,
    { field, value }: { field: LineField; value: string },
    line: BulletinLine,
) => {
    draft.titleOpen = false;
    draft.lastField = field;
    if (field === "link") draft.addressTargets.push(...line.links);
    else draft.annotatedLinks.push(...line.links);
    if (field === "link") {
        if (value) draft.linkTexts.push(value);
    } else {
        (draft.fields[field] ??= []).push(value);
    }
};

// bold text inside a quoted description; quotes are often never closed
const isInsideQuote = (draft: Draft) => {
    if (Object.keys(draft.fields).length || draft.linkTexts.length) {
        return false;
    }
    const description = draft.description.join(" ");
    return (
        (description.match(/“/g)?.length ?? 0) >
        (description.match(/”/g)?.length ?? 0)
    );
};

// Where a bold line belongs relative to the listing above it.
const placeBoldLine = (
    draft: Draft,
    text: string,
    next: BulletinLine | undefined,
) => {
    if (draft.lastField === "link" && looksLikeAddressPiece(text)) {
        return "address piece";
    }
    // a label just above a web address, unless it is a Title Case listing
    const isSentenceCase = text
        .split(/\s+/)
        .slice(1)
        .some((word) => word.length > 3 && /^[a-z]/.test(word));
    if (
        /:$/.test(text) &&
        isSentenceCase &&
        next &&
        /^(https?:|www\.)/i.test(next.text)
    ) {
        return "link label";
    }
    if (isInsideQuote(draft)) return "emphasis";
    if (text.length >= 16 && looksLikeAddressPiece(text)) return "emphasis";

    const wrapsTitle =
        draft.titleOpen &&
        !/^[“"]/.test(text) &&
        !NUMBER_PREFIX.test(text) &&
        !looksLikeSentence(text);
    if (wrapsTitle) return "wrapped title";

    const isEmphasis =
        !startsLikeTitle(text) ||
        looksLikeSentence(text) ||
        closesBracket(text) ||
        looksLikeSchedule(text);
    return isEmphasis ? "emphasis" : "new title";
};

const addEmphasis = (draft: Draft, text: string, line: BulletinLine) => {
    draft.titleOpen = false;
    draft.annotatedLinks.push(...line.links);
    const field = draft.lastField;
    // a bracket that wraps from a field line
    if (
        field &&
        field !== "link" &&
        (/^\(/.test(text) || closesBracket(text))
    ) {
        appendToField(draft, field, text);
    } else {
        draft.description.push(text);
    }
};

// Continues a web address that wrapped onto this line.
const addAddressPiece = (draft: Draft, text: string, line: BulletinLine) => {
    draft.addressTargets.push(...line.links);
    if (draft.linkTexts.length) {
        draft.linkTexts[draft.linkTexts.length - 1] += text;
    } else {
        draft.linkTexts.push(text);
    }
};

const addBodyLine = (draft: Draft, line: BulletinLine) => {
    const { text, links } = line;
    draft.titleOpen = false;
    const field = draft.lastField;
    if (/^(https?:|www\.)/i.test(text)) {
        draft.addressTargets.push(...links);
        draft.linkTexts.push(text);
    } else if (field === "link" && looksLikeAddressPiece(text)) {
        addAddressPiece(draft, text, line);
    } else if (field === "link") {
        // a paragraph after the links belongs to the description, not an address
        draft.annotatedLinks.push(...links);
        draft.lastField = null;
        draft.description.push(text);
    } else if (field) {
        draft.annotatedLinks.push(...links);
        appendToField(draft, field, text);
    } else {
        draft.annotatedLinks.push(...links);
        draft.description.push(text);
    }
};

const startDraft = (
    text: string,
    label: string | null,
    category: string,
    line: BulletinLine,
): Draft => {
    // a description that starts on the same line as its title
    const quote = text.indexOf("“");
    const splitsAtQuote = quote >= 8 && !text.slice(quote).includes("”");
    return {
        title: splitsAtQuote ? text.slice(0, quote).trim() : text,
        label,
        category,
        page: line.page,
        description: splitsAtQuote ? [text.slice(quote)] : [],
        fields: {},
        lastField: null,
        linkTexts: [],
        addressTargets: [],
        annotatedLinks: [...line.links],
        titleOpen: true,
    };
};

export const parseBulletin = (lines: BulletinLine[]): ParsedBulletin => {
    const meta = readMeta(lines);

    const start = lines.findIndex(
        (line, index) =>
            /^events of interest/i.test(line.text) &&
            // the table of contents repeats it in capitals, the section does not
            line.text !== line.text.toUpperCase() &&
            index > 0,
    );
    if (start === -1) {
        throw new BulletinFormatError(
            "Could not find where the listings begin. The bulletin's format may have changed.",
        );
    }

    // Titles share a font with the first section heading, at a smaller size.
    const titleFont = lines[start].font;
    const headingSize = lines[start].size;

    const entries: ParsedEntry[] = [];
    const save = (draft: Draft | null) => {
        if (draft?.title) entries.push(finishEntry(draft, meta.publishedOn));
    };

    let category = getCategoryFromHeading(lines[start].text)!;
    let draft: Draft | null = null;
    // a status label on its own line belongs to the title below it
    let pendingLabel: string | null = null;

    const body = lines.slice(start + 1).filter((line) => !isPageChrome(line));
    for (const [index, line] of body.entries()) {
        const next = body[index + 1];
        if (isSectionEnd(line)) {
            save(draft);
            draft = null;
            pendingLabel = null;
            continue;
        }
        const inTitleFont = line.font === titleFont;

        const heading =
            inTitleFont && line.size >= headingSize
                ? getCategoryFromHeading(line.text)
                : null;
        if (heading) {
            save(draft);
            draft = null;
            category = heading;
            pendingLabel = null;
            continue;
        }

        const field = matchField(line.text, {
            // "Important Dates:" inside a quoted description isn't a field
            allowSuffix: !(draft && isInsideQuote(draft)),
        });
        if (field && draft) {
            addField(draft, field, line);
            continue;
        }

        const status = stripStatus(line.text);
        if (status.label && !status.rest) {
            pendingLabel = status.label;
            if (draft) draft.titleOpen = false;
            continue;
        }

        if ((inTitleFont || status.label) && !field) {
            // a status label always opens a new listing
            const looksLikeTitle =
                startsLikeTitle(status.rest) && !looksLikeSentence(status.rest);
            const placement =
                draft && !status.label && !pendingLabel
                    ? placeBoldLine(draft, status.rest, next)
                    : // with no listing open, only a real title starts one
                      status.label || looksLikeTitle
                      ? "new title"
                      : "ignore";
            if (placement === "ignore") continue;
            if (draft && placement === "address piece") {
                addAddressPiece(draft, status.rest, line);
            } else if (draft && placement === "link label") {
                // the address below belongs to the listing above
                draft.titleOpen = false;
                draft.lastField = "link";
                draft.annotatedLinks.push(...line.links);
            } else if (draft && placement === "wrapped title") {
                draft.title = `${draft.title} ${status.rest}`;
                draft.annotatedLinks.push(...line.links);
            } else if (draft && placement === "emphasis") {
                addEmphasis(draft, status.rest, line);
            } else {
                save(draft);
                draft = startDraft(
                    status.rest,
                    status.label ?? pendingLabel,
                    category,
                    line,
                );
                pendingLabel = null;
            }
            continue;
        }

        if (draft) addBodyLine(draft, line);
    }
    save(draft);

    return { meta, entries: mergeDuplicates(entries, meta.publishedOn) };
};
