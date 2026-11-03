const MONTH_NAMES = String.raw`jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?`;
const MONTHS = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
];
// "November 7", "Nov. 7th, 2026", "September18" and the range "November 1-15".
// Only whole month names count, so "Junior 3" or "mayor 12" is not a date.
const DATE_PATTERN = new RegExp(
    String.raw`\b(${MONTH_NAMES})\.?\s*(\d{1,2})(?:st|nd|rd|th)?(?!\d)(?:\s*[–—-]\s*(\d{1,2})(?:st|nd|rd|th)?(?![\d:]))?(?:\s*,?\s*(\d{4}))?`,
    "gi",
);
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
// A yearless date is read as falling between this many days before the
// bulletin and a year after that, so "December 20" in a January issue is the
// December just past and "March 1" in an October issue is next March.
const PAST_DATE_GRACE_DAYS = 60;

export const cleanText = (text: string) =>
    text
        .replace(/\s+/g, " ")
        .replace(/\s+([,.;:!?)\]])/g, "$1")
        .replace(/([([])\s+/g, "$1")
        .replace(/([a-z]) - ([a-z])/g, "$1-$2")
        .trim();

// Accents are folded, so "Café" and "Cafe" match, and letters in any script count.
export const getTitleKey = (title: string) =>
    title
        .normalize("NFKD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "");

const toIsoDate = (year: number, monthIndex: number, day: number) => {
    const date = new Date(Date.UTC(year, monthIndex, day));
    // reject dates that roll over, such as February 30
    if (date.getUTCMonth() !== monthIndex || date.getUTCDate() !== day) {
        return null;
    }
    return date.toISOString().slice(0, 10);
};

type FoundDate = { iso: string; start: number; end: number };

// Bulletins usually leave out the year, so it comes from the publication date.
const matchDates = (text: string, publishedOn: string): FoundDate[] => {
    const published = Date.parse(publishedOn);
    const publishedYear = new Date(published).getUTCFullYear();
    const windowStart = published - PAST_DATE_GRACE_DAYS * MS_PER_DAY;
    const windowEnd = windowStart + 365 * MS_PER_DAY;

    const toIso = (monthIndex: number, day: number, statedYear?: string) => {
        const years = statedYear
            ? [Number(statedYear)]
            : [publishedYear - 1, publishedYear, publishedYear + 1];
        return years
            .map((year) => toIsoDate(year, monthIndex, day))
            .find(
                (date): date is string =>
                    date !== null &&
                    (statedYear !== undefined ||
                        (Date.parse(date) >= windowStart &&
                            Date.parse(date) < windowEnd)),
            );
    };

    const found: FoundDate[] = [];
    for (const match of text.matchAll(DATE_PATTERN)) {
        const monthIndex = MONTHS.indexOf(match[1].slice(0, 3).toLowerCase());
        const start = match.index ?? 0;
        const end = start + match[0].length;
        [match[2], match[3]].forEach((day) => {
            if (!day) return;
            const iso = toIso(monthIndex, Number(day), match[4]);
            if (iso) found.push({ iso, start, end });
        });
    }
    return found;
};

// Finds every date in a line of text.
export const findDates = (text: string, publishedOn: string) =>
    matchDates(text, publishedOn).map((date) => date.iso);

const ROLLING = /^\s*(open until|ongoing)|\brolling\b/i;
// "Open until December 1" and "Rolling basis (apply by January 12)" still end
const ROLLING_UNTIL = new RegExp(
    String.raw`\b(?:rolling(?:\s+(?:basis|admissions?))?|open|ongoing)\s*[(,]?\s*(?:apply\s+)?(?:until|through|thru|by)\s+(?:${MONTH_NAMES})\b`,
    "i",
);

// "Rolling Basis", and also "October 2, then Rolling Basis": applications stay
// open after any date, so it must not be archived on that date.
export const isRollingText = (text: string | null) =>
    text !== null && ROLLING.test(text) && !ROLLING_UNTIL.test(text);

// "November 19 for the recommendation" is not when students apply
const SUPPORTING_MATERIAL =
    /^[^.;]{0,40}?\b(recommendations?|references?|transcripts?|letters? of)\b/i;

// Several dates usually mean priority and final rounds. Using the latest keeps
// an opportunity open until its last chance to apply.
export const parseDeadline = (text: string | null, publishedOn: string) => {
    if (!text || isRollingText(text)) return null;
    const dates = matchDates(text, publishedOn);
    const forApplying = dates.filter((date, i) => {
        const nextStart = dates.find(
            (other, j) => j > i && other.start > date.start,
        )?.start;
        return !SUPPORTING_MATERIAL.test(text.slice(date.end, nextStart));
    });
    const chosen = forApplying.length ? forApplying : dates;
    return (
        chosen
            .map((date) => date.iso)
            .sort()
            .at(-1) ?? null
    );
};

const AMOUNT = /\$\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)/g;
// what can sit between two prices of one spread, optionally after a note in brackets
const PRICE_SEPARATOR = /^\s*(\([^)]*\)\s*)?(-|–|—|to|or|and|&|;|,)\s*$/i;

export const parseCost = (text: string | null) => {
    if (!text) return { min: null, max: null };
    if (/^\s*free\b/i.test(text)) return { min: 0, max: 0 };

    // "$10–20" leaves the $ off the second price
    const priced = text.replace(
        /(\$\s*\d[\d,]*(?:\.\d+)?)\s*(-|–|—|to)\s*(?=\d)/g,
        "$1 $2 $",
    );
    const amounts = [...priced.matchAll(AMOUNT)];
    if (!amounts.length) return { min: null, max: null };

    const toDollars = (match: RegExpMatchArray) =>
        Math.round(Number(match[1].replace(/,/g, "")));

    // "$500 - $1,500" and "$800 or $5,150" are a spread of prices, while
    // "$4,390/course + $100 application fee" is one price plus a fee
    const prices = [toDollars(amounts[0])];
    for (let i = 1; i < amounts.length; i++) {
        const previousEnd =
            (amounts[i - 1].index ?? 0) + amounts[i - 1][0].length;
        const between = priced.slice(previousEnd, amounts[i].index);
        const after = priced.slice(
            (amounts[i].index ?? 0) + amounts[i][0].length,
        );
        // "$850 & $50 application fee" is a price and a fee
        const isFee = /^\s*(?:[a-z]+\s+){0,2}fees?\b/i.test(after);
        if (!PRICE_SEPARATOR.test(between) || isFee) break;
        prices.push(toDollars(amounts[i]));
    }
    // "Up to $500" can cost anything below that
    const upTo = /\bup to\s*$/i.test(priced.slice(0, amounts[0].index));
    return {
        min: upTo ? 0 : Math.min(...prices),
        max: Math.max(...prices),
    };
};

// index 0 is 9th grade
const GRADE_TAGS = ["Freshman", "Sophomore", "Junior", "Senior"];
const GRADE_WORDS: [RegExp, number][] = [
    [/^freshm[ae]n$/i, 9],
    [/^sophomores?$/i, 10],
    [/^juniors?$/i, 11],
    [/^seniors?$/i, 12],
];
const GRADE_TOKEN = String.raw`(freshm[ae]n|sophomores?|juniors?|seniors?|\d{1,2}(?:st|nd|rd|th)?)`;
const GRADE_RANGE = new RegExp(
    String.raw`\b${GRADE_TOKEN}\s*(?:-|–|—|to|through|thru)\s*${GRADE_TOKEN}\b`,
    "gi",
);
// "9th grade and up", "Juniors and above" and "grade 10+" run through 12th grade
const GRADE_AND_UP = new RegExp(
    String.raw`\b${GRADE_TOKEN}(?:\s*grad(?:e|es|ers))?\s*(?:\+|(?:and|or)\s+(?:up|above|older|higher|beyond)\b)`,
    "gi",
);
// "ages 14-18", "16 and older" and "17+" are ages, never grades
const AGE_PHRASE =
    /\bage[sd]?\s*\d{1,2}(?:\s*(?:-|–|—|to|through|and|or)\s*\d{1,2})?|\b\d{1,2}\s*(?:\+|and (?:up|older)|or older|years? old)/gi;
// numbers that can't be grades: dates, years, times, prices and GPAs
const OTHER_NUMBERS = [
    DATE_PATTERN,
    /\b\d{4}\b/g,
    /\b\d{1,2}:\d{2}\b/g,
    /\$\s*[\d,.]+/g,
    /\b\d\.\d+\b/g,
    /\b\d+\s*%/g,
];

const GROUP_PATTERNS: [string, RegExp][] = [
    ["Female", /\b(female|girls?|women)\b/i],
    ["Nonbinary", /\bnon\s*-?\s*binary\b/i],
    ["Disadvantaged", /\bdisadvantaged\b/i],
    [
        "Underrepresented",
        /\bunder\s*-?\s*represented\b|\bfirst[- ]generation\b/i,
    ],
    [
        "Needs Financial Aid",
        /\bfinancial need\b|\blow[- ]income\b|\bneed[- ]based\b|\bpell\b/i,
    ],
];

// Grades 9 to 12 named in the text, including every grade inside a range
// such as "grades 9-12", "sophomores-seniors" or "10th grade and up".
const readGrades = (text: string) => {
    const cleaned = OTHER_NUMBERS.reduce(
        (current, pattern) => current.replace(pattern, " "),
        text,
    );
    // a bare number is only a grade when the text talks about grades
    const numbersAreGrades = /\bgrad(e|es|ers)\b/i.test(cleaned);
    const toGrade = (token: string) => {
        const word = GRADE_WORDS.find(([pattern]) => pattern.test(token));
        if (word) return word[1];
        return numbersAreGrades ? parseInt(token, 10) : null;
    };

    const grades = new Set<number>();
    const addRange = (start: number | null, end: number | null) => {
        if (start === null || end === null) return;
        for (let g = Math.min(start, end); g <= Math.max(start, end); g++) {
            grades.add(g);
        }
    };

    for (const [, from] of cleaned.matchAll(GRADE_AND_UP)) {
        addRange(toGrade(from), 12);
    }
    const withoutAges = cleaned
        .replace(GRADE_AND_UP, " ")
        .replace(AGE_PHRASE, " ");
    for (const [, from, to] of withoutAges.matchAll(GRADE_RANGE)) {
        addRange(toGrade(from), toGrade(to));
    }
    for (const [token] of withoutAges.matchAll(
        /\b(freshm[ae]n|sophomores?|juniors?|seniors?|\d{1,2}(?:st|nd|rd|th)?)\b/gi,
    )) {
        const grade = toGrade(token);
        if (grade !== null) grades.add(grade);
    }
    return [...grades].filter((g) => g >= 9 && g <= 12).sort((a, b) => a - b);
};

// Only "All students", "All high school students" and the like, with no limit after it
const OPEN_TO_ALL =
    /^\s*all\s+(?:(?:nyc|current|interested|high[- ]?school|stuyvesant|public[- ]school)\s+)*(?:students|high[- ]?schoolers|teens)\s*(?:(?:may|can) apply|are (?:welcome|eligible))?\s*[.!]?\s*$/i;

// "All students" is open to everyone, but "All juniors", "All girls" and
// "All students 15 and older" are not.
export const isOpenToAll = (text: string) =>
    text.split(";").every((part) => OPEN_TO_ALL.test(part));

// "Seniors preferred" or "priority to juniors" still lets anyone apply
const PREFERENCE =
    /\b(priority|preferred|preference|prefer|encouraged|especially|ideally)\b/i;

// Reads tags from the bulletin's eligibility sentence. It stays cautious: a
// wrong grade tag would tell a student they are ineligible when they are not.
export const parseEligibilityTags = (text: string | null) => {
    if (!text) return { tags: [] as string[], unclear: false };

    // "rising juniors" are current sophomores, exclusions invert the meaning,
    // and a preference is not a limit, so an admin decides these
    const unclear =
        /\brising\b|\b(not|except|excluding)\b/i.test(text) ||
        PREFERENCE.test(text);
    if (unclear) return { tags: [], unclear: true };

    // "all may apply" means nothing named is required
    const welcomesEveryone =
        /\ball (students )?(may|can) apply\b|\ball are welcome\b|\bopen to all\b/i.test(
            text,
        );
    if (welcomesEveryone) return { tags: [], unclear: false };

    const tags = readGrades(text).map((grade) => GRADE_TAGS[grade - 9]);
    GROUP_PATTERNS.forEach(([tag, pattern]) => {
        if (pattern.test(text)) tags.push(tag);
    });
    return { tags, unclear: false };
};

// Keeps unique web links. The address must really start with http(s)://, the
// same rule the database applies, since "https:example.com" also parses.
export const getSafeLinks = (links: string[]) => {
    const safe: string[] = [];
    links.forEach((link) => {
        if (!/^https?:\/\//i.test(link) || safe.includes(link)) return;
        try {
            new URL(link);
            safe.push(link);
        } catch {
            // not a usable address
        }
    });
    return safe;
};
