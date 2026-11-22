type Org = Pick<
    Organization,
    | "id"
    | "name"
    | "state"
    | "tags"
    | "keywords"
    | "purpose"
    | "mission"
    | "goals"
    | "uniqueness"
    | "meeting_days"
    | "commitment_level"
>;

export type RelatedActivity<T extends Org = Org> = {
    org: T;
    score: number;
    reason: string;
};

const STOP = new Set(
    `a an and are as at be but by for from has have in into is it its of on or our that the their them they this to we will with you your
    stuyvesant stuy club clubs activity activities team association society group members member students student school high
    also about all any can do each more other some such than then there these those through what when where which who why how
    meet meeting meetings week weekly year new learn join interested`.split(
        /\s+/,
    ),
);

// rough stemming so "robots" and "robotics" share a root
const stem = (word: string) =>
    word.length > 4 ? word.replace(/(ics|ing|ers|er|es|ed|s)$/, "") : word;

export const tokenize = (text?: string | null) =>
    (text ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP.has(w))
        .map(stem);

// the name and keywords say the most about a club, so they count extra
const documentFor = (org: Org) => [
    ...tokenize(org.name),
    ...tokenize(org.name),
    ...tokenize(org.keywords),
    ...tokenize(org.keywords),
    ...tokenize(org.purpose),
    ...tokenize(org.mission),
    ...tokenize(org.goals),
    ...tokenize(org.uniqueness),
];

const jaccard = (a?: string[] | null, b?: string[] | null) => {
    if (!a?.length || !b?.length) return 0;
    const setB = new Set(b);
    const shared = new Set(a.filter((x) => setB.has(x))).size;
    return shared / new Set([...a, ...b]).size;
};

const titleCase = (text: string) =>
    text === "STEM"
        ? text
        : text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// tf-idf cosine over all activities, plus shared tags; days and commitment only break ties
export const relatedActivities = <T extends Org>(
    current: T,
    orgs: T[],
    limit = 10,
): RelatedActivity<T>[] => {
    const pool = orgs.filter(
        (o) => o.state !== "PENDING" && o.id !== current.id,
    );
    const docs = new Map<number, string[]>();
    const df = new Map<string, number>();
    for (const org of [current, ...pool]) {
        const doc = documentFor(org);
        docs.set(org.id, doc);
        for (const term of new Set(doc)) df.set(term, (df.get(term) ?? 0) + 1);
    }
    const total = pool.length + 1;
    const vector = (id: number) => {
        const counts = new Map<string, number>();
        for (const term of docs.get(id) ?? [])
            counts.set(term, (counts.get(term) ?? 0) + 1);
        const v = new Map<string, number>();
        let norm = 0;
        for (const [term, n] of counts) {
            // terms every activity uses tell us nothing
            const idf = Math.log(total / (df.get(term) ?? 1));
            const w = (1 + Math.log(n)) * idf;
            if (w > 0) {
                v.set(term, w);
                norm += w * w;
            }
        }
        return { v, norm: Math.sqrt(norm) };
    };
    const mine = vector(current.id);
    const cosine = (other: ReturnType<typeof vector>) => {
        if (!mine.norm || !other.norm) return 0;
        let dot = 0;
        for (const [term, w] of mine.v) dot += w * (other.v.get(term) ?? 0);
        return dot / (mine.norm * other.norm);
    };

    return pool
        .map((org) => {
            const text = cosine(vector(org.id));
            const tags = jaccard(current.tags, org.tags);
            const relevant = text >= 0.05 || tags > 0;
            const score = relevant
                ? 0.6 * text +
                  0.3 * tags +
                  0.06 * jaccard(current.meeting_days, org.meeting_days) +
                  (current.commitment_level === org.commitment_level ? 0.04 : 0)
                : 0;
            const shared = (org.tags ?? []).filter((t) =>
                (current.tags ?? []).includes(t),
            );
            const reason =
                text >= 0.15 || !shared.length
                    ? "Similar Interests"
                    : `Also ${titleCase(shared[0])}`;
            return { org, score, reason };
        })
        .filter((r) => r.score > 0)
        .sort(
            (a, b) =>
                b.score - a.score ||
                (a.org.name ?? "").localeCompare(b.org.name ?? ""),
        )
        .slice(0, limit);
};
