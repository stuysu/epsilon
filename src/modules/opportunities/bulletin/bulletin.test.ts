import { describe, expect, it } from "vitest";
import type { Opportunity } from "../types";
import {
    cleanText,
    findDates,
    getSafeLinks,
    isOpenToAll,
    isRollingText,
    parseCost,
    parseDeadline,
    parseEligibilityTags,
} from "./normalize";
import {
    BulletinFormatError,
    BulletinLine,
    getEntryWarnings,
    parseBulletin,
    ParsedEntry,
} from "./parse";
import {
    adoptExistingMatch,
    applyEntryPatch,
    buildReview,
    findNoLongerListed,
    findPublishProblems,
    toImportEntries,
} from "./sync";

const BODY = "Serif";
const TITLE = "Serif-BoldItalic";
const LABEL = "Serif-Bold";

const line = (
    text: string,
    options: Partial<BulletinLine> = {},
): BulletinLine => ({
    page: 5,
    text,
    font: BODY,
    size: 14,
    links: [],
    ...options,
});
const title = (text: string) => line(text, { font: TITLE });
const heading = (text: string) => line(text, { font: TITLE, size: 16 });

const COVER = [
    line("Student Opportunity Bulletin #12L", { page: 1, size: 20 }),
    line("October 30, 2026", { page: 1, size: 20 }),
    line("1. EVENTS OF INTEREST TO STUDENTS", { page: 1, size: 16 }),
];
const parse = (body: BulletinLine[], cover = COVER) =>
    parseBulletin([
        ...cover,
        heading("Events of Interest to Students:"),
        ...body,
    ]);

const entryByTitle = (entries: ParsedEntry[], name: string) => {
    const found = entries.find((e) => e.title === name);
    if (!found) throw new Error(`Missing ${name}`);
    return found;
};

describe("cleanText", () => {
    it("fixes spacing left behind by PDF text runs", () => {
        expect(cleanText("under - represented  students , all")).toBe(
            "under-represented students, all",
        );
        expect(cleanText("( Virtual )")).toBe("(Virtual)");
    });

    it("keeps real ranges", () => {
        expect(cleanText("November 14 - 15")).toBe("November 14 - 15");
    });
});

describe("findDates and parseDeadline", () => {
    const published = "2026-10-30";

    it("uses the bulletin year for upcoming dates", () => {
        expect(findDates("November 7 (11:59 PM)", published)).toEqual([
            "2026-11-07",
        ]);
    });

    it("rolls months long past into next year", () => {
        expect(findDates("April 19", published)).toEqual(["2027-04-19"]);
    });

    it("keeps a date that only just passed in this year", () => {
        expect(findDates("October 15", published)).toEqual(["2026-10-15"]);
    });

    it("respects a stated year", () => {
        expect(findDates("January 9, 2027 @ 6:00 PM", published)).toEqual([
            "2027-01-09",
        ]);
    });

    it("ends a rolling or open window on a stated date", () => {
        expect(parseDeadline("Open until December 1", published)).toBe(
            "2026-12-01",
        );
        expect(
            parseDeadline("Rolling Basis (apply by January 12)", published),
        ).toBe("2027-01-12");
    });

    it("reads ranges and missing spaces, but not month-like words", () => {
        expect(findDates("November 1-15", published)).toEqual([
            "2026-11-01",
            "2026-11-15",
        ]);
        expect(findDates("November18", published)).toEqual(["2026-11-18"]);
        expect(findDates("Junior 3 and mayor 12", published)).toEqual([]);
    });

    it("ignores dates for recommendations and transcripts", () => {
        expect(
            parseDeadline(
                "December 1 (application) & December 3 (for recommendations)",
                published,
            ),
        ).toBe("2026-12-01");
    });

    it("reads December in a January issue as the month just past", () => {
        expect(findDates("December 20", "2027-01-08")).toEqual(["2026-12-20"]);
        expect(
            parseDeadline(
                "December 1 (Priority Deadline Passed), January 31 (Final)",
                "2027-01-08",
            ),
        ).toBe("2027-01-31");
    });

    it("ignores impossible dates", () => {
        expect(findDates("February 30", published)).toEqual([]);
    });

    it("takes the last deadline among several rounds", () => {
        expect(
            parseDeadline("November 1 (Priority), April 15, 2027", published),
        ).toBe("2027-04-15");
    });

    it("treats rolling text as having no date", () => {
        expect(parseDeadline("Rolling Basis", published)).toBeNull();
        // applications stay open after the first date
        expect(
            parseDeadline("November 3, then Rolling Basis", published),
        ).toBeNull();
        expect(isRollingText("Priority: November 3; rolling after")).toBe(true);
        expect(parseDeadline("TBD", published)).toBeNull();
        expect(parseDeadline(null, published)).toBeNull();
    });
});

describe("parseCost", () => {
    it.each([
        ["Free (snacks provided)", 0, 0],
        ["$475", 475, 475],
        ["$6,210 (aid available)", 6210, 6210],
        ["$400 - $1,300 (by round)", 400, 1300],
        ["$300 or $2,400", 300, 2400],
        ["$150; $900", 150, 900],
        ["$2,800/term + $60 fee", 2800, 2800],
        ["$700 & $40 application fee", 700, 700],
        ["$120 (on site) & $35 (online)", 35, 120],
        ["$100, $200 and $300", 100, 300],
        ["Up to $500", 0, 500],
        ["$10–20", 10, 20],
        ["Pay what you can", null, null],
        ["Various", null, null],
    ])("reads %s", (text, min, max) => {
        expect(parseCost(text)).toEqual({ min, max });
    });
});

describe("parseEligibilityTags", () => {
    const tags = (text: string) => parseEligibilityTags(text).tags;

    it("leaves open opportunities untagged", () => {
        expect(tags("All students")).toEqual([]);
        expect(tags("All students who are at least 14 years old")).toEqual([]);
    });

    it("reads grades in words and numbers", () => {
        expect(tags("Current sophomores, juniors, and seniors")).toEqual([
            "Sophomore",
            "Junior",
            "Senior",
        ]);
        expect(tags("Current 9, 10, and 11 grade students")).toEqual([
            "Freshman",
            "Sophomore",
            "Junior",
        ]);
    });

    it("fills in every grade inside a range", () => {
        const all = ["Freshman", "Sophomore", "Junior", "Senior"];
        expect(tags("Students in grades 9-12")).toEqual(all);
        expect(tags("Students in grades 7–12, ages 12-18")).toEqual(all);
        expect(tags("11 - 12 graders")).toEqual(["Junior", "Senior"]);
        expect(tags("Current freshmen-juniors")).toEqual([
            "Freshman",
            "Sophomore",
            "Junior",
        ]);
    });

    it("reads an All that names a grade or group as a limit", () => {
        expect(tags("All juniors")).toEqual(["Junior"]);
        expect(tags("All girls")).toEqual(["Female"]);
        expect(isOpenToAll("All juniors")).toBe(false);
        expect(isOpenToAll("All high school students")).toBe(true);
    });

    it("does not read ages as grades", () => {
        expect(tags("Students who are between 10 and 12 years old")).toEqual(
            [],
        );
    });

    it("reads groups only when they are required", () => {
        expect(tags("Current female or non-binary seniors")).toEqual([
            "Senior",
            "Female",
            "Nonbinary",
        ]);
        expect(
            tags("Sophomores; focus on underrepresented, but all may apply"),
        ).toEqual([]);
    });

    it("treats an open end as every grade above", () => {
        expect(tags("Students in 10th grade and up")).toEqual([
            "Sophomore",
            "Junior",
            "Senior",
        ]);
        expect(tags("Juniors and above")).toEqual(["Junior", "Senior"]);
    });

    it("reads a preference as preferred, for an admin to check", () => {
        expect(
            parseEligibilityTags("All students; priority to seniors"),
        ).toEqual({ tags: [], preferredTags: ["Senior"], unclear: true });
        expect(
            parseEligibilityTags("Juniors and seniors; priority for girls"),
        ).toEqual({
            tags: ["Junior", "Senior"],
            preferredTags: ["Female"],
            unclear: true,
        });
        expect(parseEligibilityTags("Seniors preferred").tags).toEqual([]);
    });

    it("does not read dates, years or times as grades", () => {
        expect(tags("Grade 11 students who turn 16 by June 12")).toEqual([
            "Junior",
        ]);
        expect(tags("Grade 12 students born 2009-2010")).toEqual(["Senior"]);
        expect(tags("Grade 10-11 students; sessions run October 3-12")).toEqual(
            ["Sophomore", "Junior"],
        );
    });

    it("marks wording it cannot safely tag", () => {
        expect(parseEligibilityTags("Rising juniors and seniors")).toEqual({
            tags: [],
            preferredTags: [],
            unclear: true,
        });
        expect(parseEligibilityTags("Not open to seniors").unclear).toBe(true);
    });
});

describe("getSafeLinks", () => {
    it("keeps unique web links only", () => {
        expect(
            getSafeLinks([
                "https://stuy.edu",
                "https://stuy.edu",
                "javascript:alert(1)",
                "mailto:a@stuy.edu",
                "not a url",
            ]),
        ).toEqual(["https://stuy.edu"]);
    });
});

describe("parseBulletin", () => {
    it("reads the issue and date from the cover", () => {
        expect(parse([]).meta).toEqual({
            issue: "12L",
            publishedOn: "2026-10-30",
            isLong: true,
        });
    });

    it("knows a Short bulletin is partial", () => {
        const cover = [
            line("Student Opportunity Bulletin #12S", { page: 1 }),
            line("October 30, 2026", { page: 1 }),
        ];
        expect(parse([], cover).meta.isLong).toBe(false);
    });

    it("rejects other PDFs", () => {
        expect(() =>
            parseBulletin([line("A lunch menu", { page: 1 })]),
        ).toThrow(BulletinFormatError);
        expect(() => parseBulletin(COVER)).toThrow(BulletinFormatError);
    });

    it("reads a complete listing", () => {
        const { entries } = parse([
            title("New: Science Program"),
            line("Students study science."),
            line("Eligible: Current juniors"),
            line("Dates: June 1 - 5"),
            line("Location: Manhattan", { font: LABEL }),
            line("Cost: $500"),
            line("Application Deadline: November 7"),
            line("Link: https://exam ple.com/visible", {
                links: ["https://example.com/real"],
            }),
        ]);

        expect(entries).toHaveLength(1);
        expect(entries[0]).toMatchObject({
            title: "Science Program",
            label: "New",
            description: "Students study science.",
            eligibilityText: "Current juniors",
            eligibilityTags: ["Junior"],
            dateText: "June 1 - 5",
            location: "Manhattan",
            costText: "$500",
            costMin: 500,
            deadline: "2026-11-07",
            links: ["https://example.com/real"],
            categories: ["Events of Interest"],
            warnings: [],
            include: true,
        });
    });

    it("tolerates label spacing variations", () => {
        const { entries } = parse([
            title("Spaced Labels Program"),
            line("Locatio n : Queens"),
            line("Application Deadline : Rolling Basis"),
        ]);
        expect(entries[0].location).toBe("Queens");
        expect(entries[0].deadlineText).toBe("Rolling Basis");
    });

    it("reads a moved deadline as the deadline", () => {
        const { entries } = parse([
            title("Moved Deadline Program"),
            line("Cost: $100"),
            line("New Application Deadline: November 25"),
        ]);
        expect(entries[0].costText).toBe("$100");
        expect(entries[0].deadline).toBe("2026-11-25");
    });

    it("applies a label from the line above the title", () => {
        const { entries } = parse([
            line("Deadline Approaching:", { font: LABEL }),
            title("Labelled Program"),
            line("Cost: Free"),
        ]);
        expect(entries[0].label).toBe("Deadline Approaching");
        expect(entries[0].title).toBe("Labelled Program");
    });

    it("joins titles that wrap and keeps wrapped description apart", () => {
        const { entries } = parse([
            title("Deadline Approaching: The Regional Language Exchange for"),
            title("(RLX) – A Free Study Program"),
            line("Cost: Free"),
            title("Harbor Media Internship for Seniors"),
            title("“HMI offers paid summer placements (with an affiliated"),
            line("stipend).”"),
            line("Cost: Free"),
        ]);
        expect(entries.map((e) => e.title)).toEqual([
            "The Regional Language Exchange for (RLX) – A Free Study Program",
            "Harbor Media Internship for Seniors",
        ]);
        expect(entries[1].description).toContain("HMI offers");
    });

    it("does not split a listing at a bold sentence", () => {
        const { entries } = parse([
            title("Neighborhood Tech Helpers"),
            line("A group that helps neighbors with their devices."),
            title("Helpers can sign up for whichever shifts suit their week"),
            title("and every hour is appreciated!"),
            line("Eligible: All students"),
        ]);
        expect(entries).toHaveLength(1);
        expect(entries[0].eligibilityText).toBe("All students");
        expect(entries[0].description).toContain("Helpers can sign up");
    });

    it("keeps bold lines inside a quoted description", () => {
        const { entries } = parse([
            title("Sketchbook Challenge"),
            line("“Pick a theme: ‘Streets & Bridges (Deadline: 2/1)’, and"),
            title("Rivers & Parks in the City (Deadline: 3/1)’.”"),
            line("Eligible: All students"),
            line("Application Deadline: March 1"),
        ]);
        expect(entries.map((e) => e.title)).toEqual(["Sketchbook Challenge"]);
        expect(entries[0].eligibilityText).toBe("All students");
    });

    it("continues a field across a bold wrapped line", () => {
        const { entries } = parse([
            title("Lantern Scholars Program"),
            line("Application Deadline: November 1 (Priority 1), January 15"),
            title("(Priority 2), and June 7 (Final)"),
        ]);
        expect(entries[0].deadlineText).toContain("June 7");
    });

    it("reads labelled dates, deadlines and links it has not seen before", () => {
        const { entries } = parse([
            title("Friday Film Club"),
            line("Eligible: All students"),
            title("Event Date(s): May 7, 14"),
            line("Cost: $20"),
            line("Priority Deadline: November 18"),
            line("Application Deadline: December 2"),
            line("Submission Link: https://example.com/films"),
            line("Please note the following dates: none"),
        ]);
        expect(entries).toHaveLength(1);
        expect(entries[0]).toMatchObject({
            eligibilityText: "All students",
            dateText: "May 7, 14",
            costText: "$20",
            deadlineText: "Priority Deadline: November 18; December 2",
            deadline: "2026-12-02",
            links: ["https://example.com/films"],
        });
    });

    it("strips status labels however they are worded or placed", () => {
        const { entries } = parse([
            line("New: Information Session Approaching:", { font: LABEL }),
            title("Orchard Apprentice Program (OAP):"),
            title("Information Session Approaching"),
            line("Cost: Free"),
            title("3-New: Winter Studio Lab"),
            line("Cost: Free"),
            title("Priority Deadline Approaching: Spring Circuits"),
            line("Cost: Free"),
            title("Riverside Dance Project – Audition Approaching"),
            line("Cost: Free"),
            title("DeadlineApproaching: Clay Animation Lab"),
            line("Cost: Free"),
            title("Event Tomorrow: Puzzle Night for Teens"),
            line("Cost: Free"),
            line("Deadline Tomorrow:", { font: LABEL }),
            title("Robotics Open House"),
            line("Cost: Free"),
        ]);
        expect(entries.map((e) => e.title)).toEqual([
            "Orchard Apprentice Program (OAP)",
            "Winter Studio Lab",
            "Spring Circuits",
            "Riverside Dance Project",
            "Clay Animation Lab",
            "Puzzle Night for Teens",
            "Robotics Open House",
        ]);
        expect(entries.map((e) => e.label)).toEqual([
            "Coming Up",
            "New",
            "Deadline Approaching",
            "Coming Up",
            "Deadline Approaching",
            "Tomorrow",
            "Deadline Tomorrow",
        ]);
    });

    it("reads labels joined by & or / and keeps each listing separate", () => {
        const { entries } = parse([
            title("Harbor Science Camp"),
            line("Cost: $300"),
            line(
                "Information sessions today & tomorrow: Lighthouse Research Program",
                { font: LABEL },
            ),
            line("“A research program for students.”"),
            line("Cost: $900"),
            line("1- Deadline Extended/Approaching: The Short Film Lab", {
                font: LABEL,
            }),
            line("Cost: Free"),
        ]);
        expect(entries.map((e) => [e.title, e.costText, e.label])).toEqual([
            ["Harbor Science Camp", "$300", null],
            ["Lighthouse Research Program", "$900", "Today"],
            ["The Short Film Lab", "Free", "Deadline Extended"],
        ]);
    });

    it("keeps link pieces and link labels out of the titles", () => {
        const { entries } = parse([
            title("Robotics Club"),
            line("Cost: Free"),
            title("Application Link: https://example.com/forms/abc-"),
            line("defGHI/viewform", { font: TITLE, size: 12 }),
            title("Info session registration:"),
            line("https://example.com/info"),
            title("List of Tutoring Opportunities:"),
            line("https://example.com/list"),
        ]);
        expect(entries.map((e) => e.title)).toEqual([
            "Robotics Club",
            "List of Tutoring Opportunities",
        ]);
        expect(entries[0].links).toEqual([
            "https://example.com/forms/abc-defGHI/viewform",
            "https://example.com/info",
        ]);
    });

    it("keeps a numbered prefix only when it is a list number", () => {
        const { entries } = parse([
            title("2026-2027 Youth Council"),
            line("Cost: Free"),
            title("3-D Printing Workshop"),
            line("Cost: Free"),
            title("2 – Night Sky Walk"),
            line("Cost: Free"),
        ]);
        expect(entries.map((e) => e.title)).toEqual([
            "2026-2027 Youth Council",
            "3-D Printing Workshop",
            "Night Sky Walk",
        ]);
    });

    it("does not take title words for status labels or fields", () => {
        const { entries } = parse([
            title("Leaders of Tomorrow: Summer Program"),
            line("Cost: Free"),
            title("Science Fair Dates: Spring Edition"),
            line("Cost: Free"),
        ]);
        expect(entries.map((e) => [e.title, e.label])).toEqual([
            ["Leaders of Tomorrow: Summer Program", null],
            ["Science Fair Dates: Spring Edition", null],
        ]);
    });

    it("ends a listing at the section's RETURN TO TOP", () => {
        const { entries } = parse([
            title("Coastal Clean-Up"),
            line("Link: https://example.com/clean"),
            line("RETURN TO TOP", { font: "Other", size: 16 }),
            line("General note: templates are at"),
            line("https://example.com/templates"),
            title("and please keep sharing what you find"),
        ]);
        expect(entries).toHaveLength(1);
        expect(entries[0].links).toEqual(["https://example.com/clean"]);
    });

    it("prefers the printed address and unwraps safelinks", () => {
        const { entries } = parse([
            title("Studio Program"),
            line("Link: https://studio.example.org/apply", {
                links: ["https://other.example.net/unrelated"],
            }),
            line(
                "Link: https://nam04.safelinks.protection.outlook.com/?url=https%3A%2F%2Fwww.example.org%2Flab",
            ),
        ]);
        expect(entries[0].links).toEqual([
            "https://studio.example.org/apply",
            "https://www.example.org/lab",
            "https://other.example.net/unrelated",
        ]);
    });

    it("keeps bold fragments inside the listing they belong to", () => {
        const { entries } = parse([
            title("Startup Sprint Lab"),
            title("Application Deadline: March 3 (April Cohort), April 7 (May"),
            title("Cohort)"),
            line("Dates: Weekends at various times (Next sessions on"),
            title("May 2, 9, 16, and more)"),
            line("Workshops on campus:"),
            title("Thursdays, 3:30 - 4:30 PM from January 7 – February 4"),
            title("The Coastal Youth Exchange (CYE) – A free U.S."),
            title("Government Study Program"),
            line("Cost: Free"),
        ]);
        expect(entries.map((e) => e.title)).toEqual([
            "Startup Sprint Lab",
            "The Coastal Youth Exchange (CYE) – A free U.S. Government Study Program",
        ]);
        expect(entries[0].deadlineText).toContain("May Cohort)");
        expect(entries[0].dateText).toContain("and more)");
        expect(entries[0].description).toContain("Thursdays, 3:30");
    });

    it("drops ordinal fragments and section chrome", () => {
        const { entries } = parse([
            line("st", { font: TITLE, size: 9 }),
            title("Real Program"),
            line("RETURN TO TOP", { font: "Other", size: 16 }),
            line("Cost: Free"),
        ]);
        expect(entries.map((e) => e.title)).toEqual(["Real Program"]);
    });

    it("assigns sections and maps sub-headings", () => {
        const { entries } = parse([
            title("Event Program"),
            line("Cost: Free"),
            heading("STEM Opportunities"),
            heading("Medical/Life Sciences"),
            title("Hospital Program"),
            line("Cost: Free"),
        ]);
        expect(entryByTitle(entries, "Hospital Program").categories).toEqual([
            "Medical & Life Sciences",
        ]);
    });

    it("merges a program listed in several categories", () => {
        const { entries } = parse([
            title("Shared Essay Contest"),
            line("A short note."),
            heading("Contests & Competitions"),
            title("Shared Essay Contest"),
            line("The full description of this essay contest."),
            line("Eligible: All students"),
            line("Application Deadline: November 7"),
            line("Link: https://example.com/a", {
                links: ["https://example.com/a"],
            }),
        ]);
        expect(entries).toHaveLength(1);
        expect(entries[0]).toMatchObject({
            categories: ["Events of Interest", "Contests & Competitions"],
            deadline: "2026-11-07",
            warnings: [],
        });
        expect(entries[0].description).toContain("full description");
    });

    it("derives tags and dates from the merged text", () => {
        const { entries } = parse([
            title("Shared Lab Program"),
            line("Eligible: Current juniors"),
            heading("Contests & Competitions"),
            title("Shared Lab Program"),
            line("Application Deadline: November 7"),
            line("Link: https://example.com/a", {
                links: ["https://example.com/a"],
            }),
        ]);
        expect(entries[0]).toMatchObject({
            eligibilityText: "Current juniors",
            eligibilityTags: ["Junior"],
            deadline: "2026-11-07",
        });
    });

    it("flags what needs review and leaves out bare headings", () => {
        const { entries } = parse([
            title("More Events:"),
            title("1 – Poetry Circle Meeting"),
            line("Cost: Free"),
            line("Application Deadline: TBD"),
        ]);
        expect(entryByTitle(entries, "More Events")).toMatchObject({
            include: false,
        });
        expect(entryByTitle(entries, "Poetry Circle Meeting").warnings).toEqual(
            ["No link found", "Deadline has no date"],
        );
    });
});

const makeEntry = (overrides: Partial<ParsedEntry> = {}): ParsedEntry => ({
    titleKey: "scienceprogram",
    title: "Science Program",
    description: "Description",
    dateText: "June",
    location: "Manhattan",
    costText: "Free",
    costMin: 0,
    costMax: 0,
    deadline: "2026-11-07",
    deadlineText: "November 7",
    eligibilityText: "All students",
    eligibilityTags: [],
    preferredTags: [],
    eligibilityUnclear: false,
    links: ["https://example.com"],
    label: null,
    categories: ["Academic Programs"],
    page: 5,
    warnings: [],
    include: true,
    ...overrides,
});

const category = (id: number, name: string) => ({
    id,
    name,
    parent_id: null,
    position: id,
});

const makeExisting = (overrides: Partial<Opportunity> = {}): Opportunity => ({
    id: 9,
    title: "Science Program",
    title_key: "scienceprogram",
    description: "Description",
    date_text: "June",
    location: "Manhattan",
    cost_text: "Free",
    cost_min: 0,
    cost_max: 0,
    deadline: "2026-11-07",
    deadline_text: "November 7",
    eligibility_text: "All students",
    links: ["https://example.com"],
    bulletin_label: null,
    archived: false,
    created_at: "2026-01-01T00:00:00Z",
    categories: [category(2, "Academic Programs")],
    eligibilities: [],
    ...overrides,
});

describe("buildReview", () => {
    it("sorts entries into new, changed, and unchanged", () => {
        const review = buildReview(
            [
                makeEntry(),
                makeEntry({ titleKey: "other", title: "Other" }),
                makeEntry({
                    titleKey: "moved",
                    title: "Moved",
                    deadline: "2026-12-01",
                    deadlineText: "December 1",
                }),
            ],
            [
                makeExisting(),
                makeExisting({
                    id: 10,
                    title: "Moved",
                    title_key: "moved",
                }),
            ],
        );
        expect(review.map((e) => e.change)).toEqual([
            "unchanged",
            "new",
            "changed",
        ]);
        expect(review[2].changedFields).toEqual(["Deadline"]);
    });
});

describe("findNoLongerListed", () => {
    const meta = { issue: "12L", publishedOn: "2026-10-30", isLong: true };
    const existing = [
        makeExisting(),
        makeExisting({ id: 2, title_key: "gone" }),
        makeExisting({ id: 3, title_key: "oldarchived", archived: true }),
    ];

    it("finds active opportunities missing from a Long bulletin", () => {
        expect(
            findNoLongerListed([makeEntry()], existing, meta).map((o) => o.id),
        ).toEqual([2]);
    });

    it("never suggests archiving from a Short bulletin", () => {
        expect(
            findNoLongerListed([makeEntry()], existing, {
                ...meta,
                isLong: false,
            }),
        ).toEqual([]);
    });

    it("counts an excluded entry as not listed", () => {
        expect(
            findNoLongerListed(
                [makeEntry({ include: false })],
                [makeExisting()],
                meta,
            ).map((o) => o.id),
        ).toEqual([9]);
    });
});

describe("applyEntryPatch", () => {
    const published = "2026-10-30";

    it("recalculates what depends on corrected text", () => {
        const next = applyEntryPatch(
            makeEntry({ warnings: ["Deadline has no date"] }),
            {
                title: "New Name",
                costText: "$100 - $200",
                deadlineText: "April 19",
                eligibilityText: "Current seniors",
            },
            published,
        );
        expect(next).toMatchObject({
            titleKey: "newname",
            costMin: 100,
            costMax: 200,
            deadline: "2027-04-19",
            eligibilityTags: ["Senior"],
            warnings: [],
        });
    });

    it("clears the eligibility flag once tags are chosen", () => {
        const next = applyEntryPatch(
            makeEntry({ eligibilityUnclear: true }),
            { eligibilityTags: ["Junior"] },
            published,
        );
        expect(next.eligibilityUnclear).toBe(false);
        expect(next.warnings).toEqual([]);
    });

    it("keeps a hand-picked date when only the date changes", () => {
        const next = applyEntryPatch(
            makeEntry({ deadlineText: "TBD", deadline: null }),
            { deadline: "2026-12-25" },
            published,
        );
        expect(next.deadline).toBe("2026-12-25");
        expect(next.deadlineText).toBe("TBD");
    });
});

describe("findPublishProblems", () => {
    const categories = [category(2, "Academic Programs")];

    it("passes a clean list and ignores excluded entries", () => {
        expect(
            findPublishProblems(
                [makeEntry(), makeEntry({ include: false, categories: [] })],
                categories,
            ),
        ).toEqual([]);
    });

    it("catches blank titles, duplicates, and missing categories", () => {
        expect(
            findPublishProblems(
                [
                    makeEntry(),
                    makeEntry(),
                    makeEntry({ titleKey: "", title: "" }),
                    makeEntry({
                        titleKey: "nocat",
                        title: "No Category",
                        categories: ["Unknown"],
                    }),
                ],
                categories,
            ),
        ).toHaveLength(3);
    });
});

describe("toImportEntries", () => {
    it("sends included entries with resolved ids", () => {
        const payload = toImportEntries(
            [
                makeEntry({ eligibilityTags: ["Junior"], location: "  " }),
                makeEntry({ include: false }),
            ],
            [category(2, "Academic Programs")],
            [{ id: 3, name: "Junior", grade: 11, position: 3 }],
        );
        expect(payload).toHaveLength(1);
        expect(payload[0]).toMatchObject({
            category_ids: [2],
            eligibility_ids: [3],
            location: null,
        });
    });
});

describe("renamed entries", () => {
    const longMeta = { issue: "12L", publishedOn: "2026-10-30", isLong: true };
    const [matched] = buildReview([makeEntry()], [makeExisting()]);
    const renamed = applyEntryPatch(
        matched,
        { title: "Science Program Online" },
        longMeta.publishedOn,
    );

    it("keeps the catalog row it matched when loaded", () => {
        const { id } = makeExisting();
        expect(matched.existingId).toBe(id);
        expect(renamed.existingId).toBe(id);
        expect(toImportEntries([renamed], [], [])[0].id).toBe(id);
    });

    it("still counts the renamed row as listed", () => {
        expect(
            findNoLongerListed([renamed], [makeExisting()], longMeta),
        ).toEqual([]);
    });

    it("refuses a title that would overwrite another opportunity", () => {
        const other = makeExisting({
            id: 99,
            title: "Science Program Online",
            title_key: "scienceprogramonline",
        });
        expect(
            findPublishProblems(
                [renamed],
                [category(2, "Academic Programs")],
                [makeExisting(), other],
            ),
        ).toEqual([
            '"Science Program Online" has the same title as another opportunity.',
        ]);
    });

    it("keeps hand-picked tags when the wording is edited", () => {
        const picked = applyEntryPatch(
            matched,
            { eligibilityTags: ["Senior"] },
            longMeta.publishedOn,
        );
        const reworded = applyEntryPatch(
            picked,
            { eligibilityText: "Current juniors" },
            longMeta.publishedOn,
        );
        expect(reworded.eligibilityTags).toEqual(["Senior"]);
    });
});

describe("fixing titles and dates in review", () => {
    it("matches a corrected title to its catalog row", () => {
        const [broken] = buildReview(
            [
                makeEntry({
                    title: "x/viewform Science Program",
                    titleKey: "xviewformscienceprogram",
                }),
            ],
            [makeExisting()],
        );
        expect(broken.existingId).toBeNull();
        const fixed = applyEntryPatch(
            broken,
            { title: "Science Program" },
            "2026-10-30",
        );
        expect(
            adoptExistingMatch(fixed, [makeExisting()], [fixed]).existingId,
        ).toBe(makeExisting().id);
    });

    it("keeps a hand-set deadline when the wording is edited", () => {
        const [entry] = buildReview([makeEntry()], [makeExisting()]);
        const dated = applyEntryPatch(
            entry,
            { deadline: "2026-12-15" },
            "2026-10-30",
        );
        const reworded = applyEntryPatch(
            dated,
            { deadlineText: "November 20" },
            "2026-10-30",
        );
        expect(reworded.deadline).toBe("2026-12-15");
    });
});

describe("reworded titles", () => {
    const old = makeExisting({
        id: 20,
        title: "Summer Science Program 2026",
        title_key: "summerscienceprogram2026",
        links: ["https://example.org/ssp/apply"],
    });

    it("links a reworded entry that shares a unique link", () => {
        const [entry] = buildReview(
            [
                makeEntry({
                    title: "Summer Science Program: Research Track",
                    titleKey: "summerscienceprogramresearchtrack",
                    links: ["https://www.example.org/ssp/apply/"],
                }),
            ],
            [old],
        );
        expect(entry.existingId).toBe(20);
        expect(entry.renameCandidate).toEqual({
            id: 20,
            title: "Summer Science Program 2026",
        });
        expect(entry.change).toBe("changed");
    });

    it("links a close title in the same category", () => {
        const [entry] = buildReview(
            [
                makeEntry({
                    title: "Summer Science Program 2027",
                    titleKey: "summerscienceprogram2027",
                    links: [],
                }),
            ],
            [old],
        );
        expect(entry.existingId).toBe(20);
    });

    it("only suggests a shared link with a different title", () => {
        const [entry] = buildReview(
            [
                makeEntry({
                    title: "Summer Research Camp",
                    titleKey: "summerresearchcamp",
                    links: ["https://example.org/ssp/apply"],
                }),
            ],
            [old],
        );
        expect(entry.existingId).toBeNull();
        expect(entry.renameCandidate?.id).toBe(20);
    });

    it("ignores titles that only share common words", () => {
        const splash = (id: number, school: string) =>
            makeExisting({
                id,
                title: `Splash at ${school} University`,
                title_key: `splashat${school.toLowerCase()}university`,
                links: [],
            });
        const [entry] = buildReview(
            [
                makeEntry({
                    title: "Splash at Princeton University",
                    titleKey: "splashatprincetonuniversity",
                    links: [],
                }),
            ],
            [splash(1, "Stanford"), splash(2, "Cornell"), splash(3, "Brown")],
        );
        expect(entry.renameCandidate).toBeNull();
    });

    it("ignores links that other listings share", () => {
        const shared = "https://example.org/programs/list";
        const [entry] = buildReview(
            [
                makeEntry({
                    title: "Robotics Team",
                    titleKey: "roboticsteam",
                    links: [shared],
                }),
            ],
            [
                makeExisting({
                    id: 1,
                    title: "Chess Club",
                    title_key: "chessclub",
                    links: [shared],
                }),
                makeExisting({
                    id: 2,
                    title: "Poetry Night",
                    title_key: "poetrynight",
                    links: [shared],
                }),
            ],
        );
        expect(entry.renameCandidate).toBeNull();
        expect(entry.existingId).toBeNull();
    });

    it("never pairs a listing that kept its title", () => {
        const [same, other] = buildReview(
            [
                makeEntry({ title: old.title, titleKey: old.title_key }),
                makeEntry({
                    title: "Summer Science Program 2027",
                    titleKey: "summerscienceprogram2027",
                }),
            ],
            [old],
        );
        expect(same.existingId).toBe(20);
        expect(other.existingId).toBeNull();
        expect(other.renameCandidate).toBeNull();
    });

    it("keeps a linked rename off the no-longer-listed list", () => {
        const review = buildReview(
            [
                makeEntry({
                    title: "Summer Science Program 2027",
                    titleKey: "summerscienceprogram2027",
                }),
            ],
            [old],
        );
        expect(
            findNoLongerListed(review, [old], {
                issue: "9L",
                publishedOn: "2026-11-06",
                isLong: true,
            }),
        ).toEqual([]);
    });
});

describe("preferred tags in review", () => {
    it("sends only tags that are not also required", () => {
        const [entry] = toImportEntries(
            [
                makeEntry({
                    eligibilityTags: ["Senior"],
                    preferredTags: ["Senior", "Female"],
                }),
            ],
            [category(2, "Academic Programs")],
            [
                { id: 4, name: "Senior", grade: 12, position: 4 },
                { id: 5, name: "Female", grade: null, position: 5 },
            ],
        );
        expect(entry.eligibility_ids).toEqual([4]);
        expect(entry.preferred_eligibility_ids).toEqual([5]);
    });

    it("settles unclear wording once preferred tags are picked", () => {
        const entry = applyEntryPatch(
            makeEntry({ eligibilityUnclear: true }),
            { preferredTags: ["Female"] },
            "2026-11-06",
        );
        expect(entry.eligibilityUnclear).toBe(false);
        expect(entry.warnings).not.toContain("Check eligibility tags");
    });
});

describe("missing deadlines", () => {
    const warningsFor = (overrides: Partial<ParsedEntry>) =>
        getEntryWarnings(
            makeEntry({ deadline: null, deadlineText: null, ...overrides }),
        );

    it("does not flag a listing that has no deadline at all", () => {
        expect(warningsFor({})).toEqual([]);
    });

    it("flags deadline wording elsewhere in the listing", () => {
        expect(
            warningsFor({ description: "Applications are due by March 3." }),
        ).toEqual(["Deadline may be in the listing"]);
        expect(warningsFor({ dateText: "Registration closes May 1" })).toEqual([
            "Deadline may be in the listing",
        ]);
    });
});

describe("publishing renames", () => {
    it("refuses two entries that update the same row", () => {
        const problems = findPublishProblems(
            [
                { ...makeEntry(), existingId: 9 },
                {
                    ...makeEntry({
                        title: "Science Program II",
                        titleKey: "scienceprogramii",
                    }),
                    existingId: 9,
                },
            ],
            [category(2, "Academic Programs")],
            [makeExisting()],
        );
        expect(problems).toEqual([
            'Two entries update "Science Program". Unlink one of them.',
        ]);
    });
});
