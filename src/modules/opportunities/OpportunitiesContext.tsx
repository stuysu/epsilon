import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    useRef,
} from "react";
import { useSnackbar } from "notistack";
import { supabase } from "../../lib/supabaseClient";
import UserContext from "../../contexts/UserContext";
import {
    Opportunity,
    OpportunityBulletin,
    OpportunityCategory,
    OpportunityEligibility,
    OpportunityFilters,
    OpportunityTag,
    Student,
} from "./types";
import { DEFAULT_FILTERS } from "./utils";

const OPPORTUNITY_COLUMNS = `
    id,
    title,
    title_key,
    description,
    date_text,
    location,
    cost_text,
    cost_min,
    cost_max,
    deadline,
    deadline_text,
    eligibility_text,
    links,
    bulletin_label,
    archived,
    edited_fields,
    edited_at,
    updated_at,
    created_at,
    categories:opportunity_categories (id, name, parent_id, position),
    eligibility_links:opportunity_eligibility_links (
        preferred,
        eligibility:opportunity_eligibilities (id, name, grade, position)
    )
`;

type OpportunityRow = Omit<Opportunity, "eligibilities"> & {
    eligibility_links: {
        preferred: boolean;
        eligibility: OpportunityEligibility;
    }[];
};

const toOpportunity = ({
    eligibility_links,
    ...row
}: OpportunityRow): Opportunity => ({
    ...row,
    eligibilities: eligibility_links
        .map(
            ({ preferred, eligibility }): OpportunityTag => ({
                ...eligibility,
                preferred,
            }),
        )
        .sort((a, b) => a.position - b.position),
});

// sensitive, so it stays in this browser, kept apart per account
const aboutYouKey = (userId: number) => `opportunities-about-you:${userId}`;

const readAboutYou = (userId: number): string[] | null => {
    try {
        const value = JSON.parse(
            localStorage.getItem(aboutYouKey(userId)) ?? "null",
        );
        return Array.isArray(value)
            ? value.filter((v): v is string => typeof v === "string")
            : null;
    } catch {
        return null;
    }
};

const writeAboutYou = (userId: number, groups: string[] | null) => {
    try {
        if (groups === null) localStorage.removeItem(aboutYouKey(userId));
        else localStorage.setItem(aboutYouKey(userId), JSON.stringify(groups));
    } catch {}
};

// the server can cap rows per request, so the catalog is read in pages
const PAGE_SIZE = 1000;

const fetchAllOpportunities = async () => {
    const rows: Opportunity[] = [];
    let lastId = 0;
    for (;;) {
        const { data, error } = await supabase
            .from("opportunities")
            .select(OPPORTUNITY_COLUMNS)
            .gt("id", lastId)
            .order("id")
            .limit(PAGE_SIZE);
        if (error) return { data: null, error };
        // stop on an empty page or one with nothing new
        const page = (data as unknown as OpportunityRow[])
            .filter((row) => row.id > lastId)
            .map(toOpportunity);
        if (!page.length) return { data: rows, error: null };
        rows.push(...page);
        lastId = Math.max(...page.map((row) => row.id));
    }
};

type OpportunitiesContextType = {
    loading: boolean;
    failed: boolean;
    opportunities: Opportunity[];
    categories: OpportunityCategory[];
    eligibilities: OpportunityEligibility[];
    latestBulletin: OpportunityBulletin | null;
    savedIds: Set<number>;
    setSaved: (opportunityId: number, saved: boolean) => Promise<void>;
    refreshOpportunity: (opportunityId: number) => Promise<boolean>;
    student: Student;
    setAboutYou: (groups: string[] | null) => void;
    // resolves to the fresh list, or null if it could not load
    reload: () => Promise<Opportunity[] | null>;
    // kept here so filters survive a visit to a detail page
    catalogFilters: OpportunityFilters;
    setCatalogFilters: (filters: OpportunityFilters) => void;
};

const OpportunitiesContext = createContext<OpportunitiesContextType>({
    loading: true,
    failed: false,
    opportunities: [],
    categories: [],
    eligibilities: [],
    latestBulletin: null,
    savedIds: new Set(),
    setSaved: async () => undefined,
    refreshOpportunity: async () => false,
    student: { grade: 0, groups: null },
    setAboutYou: () => undefined,
    reload: async () => null,
    catalogFilters: DEFAULT_FILTERS,
    setCatalogFilters: () => undefined,
});

export const useOpportunities = () => useContext(OpportunitiesContext);

export const OpportunitiesProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [categories, setCategories] = useState<OpportunityCategory[]>([]);
    const [eligibilities, setEligibilities] = useState<
        OpportunityEligibility[]
    >([]);
    const [latestBulletin, setLatestBulletin] =
        useState<OpportunityBulletin | null>(null);
    const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
    const [catalogFilters, setCatalogFilters] =
        useState<OpportunityFilters>(DEFAULT_FILTERS);
    const [aboutYou, setAboutYouState] = useState(() => readAboutYou(user.id));
    const [aboutYouFor, setAboutYouFor] = useState(user.id);
    // another account signed in, so its own choices apply
    if (aboutYouFor !== user.id) {
        setAboutYouFor(user.id);
        setAboutYouState(readAboutYou(user.id));
    }

    const setAboutYou = useCallback(
        (groups: string[] | null) => {
            setAboutYouState(groups);
            writeAboutYou(user.id, groups);
        },
        [user.id],
    );

    const student = useMemo(
        () => ({ grade: user.grade, groups: aboutYou }),
        [user.grade, aboutYou],
    );

    const latestLoad = useRef(0);
    const load = useCallback(
        async (isWanted: () => boolean = () => true) => {
            const call = ++latestLoad.current;
            const isCurrent = () => call === latestLoad.current && isWanted();
            setLoading(true);
            setFailed(false);

            const [
                opportunityRes,
                categoryRes,
                eligibilityRes,
                bulletinRes,
                savedRes,
            ] = await Promise.all([
                fetchAllOpportunities(),
                supabase
                    .from("opportunity_categories")
                    .select("id, name, parent_id, position")
                    .order("position"),
                supabase
                    .from("opportunity_eligibilities")
                    .select("id, name, grade, position")
                    .order("position"),
                supabase
                    .from("opportunity_bulletins")
                    .select("id, issue, published_on, entry_count, imported_at")
                    .order("published_on", { ascending: false })
                    // a Long and Short issue can share a date
                    .order("id", { ascending: false })
                    .limit(1),
                supabase
                    .from("saved_opportunities")
                    .select("opportunity_id")
                    .eq("user_id", user.id),
            ]);

            if (!isCurrent()) return null;

            if (
                opportunityRes.error ||
                categoryRes.error ||
                eligibilityRes.error ||
                bulletinRes.error ||
                savedRes.error
            ) {
                setFailed(true);
                setLoading(false);
                return null;
            }

            const fresh = opportunityRes.data ?? [];
            setOpportunities(fresh);
            setCategories(categoryRes.data);
            setEligibilities(eligibilityRes.data);
            setLatestBulletin(bulletinRes.data[0] ?? null);
            setSavedIds(new Set(savedRes.data.map((s) => s.opportunity_id)));
            setLoading(false);
            return fresh;
        },
        [user.id],
    );

    useEffect(() => {
        let current = true;
        load(() => current);
        return () => {
            current = false;
        };
    }, [load]);

    const setSaved = useCallback(
        async (opportunityId: number, saved: boolean) => {
            const { error } = saved
                ? await supabase.from("saved_opportunities").upsert({
                      user_id: user.id,
                      opportunity_id: opportunityId,
                  })
                : await supabase
                      .from("saved_opportunities")
                      .delete()
                      .eq("user_id", user.id)
                      .eq("opportunity_id", opportunityId);

            if (error) {
                enqueueSnackbar(
                    saved
                        ? "Error saving opportunity. Contact it@stuysu.org for support."
                        : "Error removing opportunity. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }

            setSavedIds((current) => {
                const next = new Set(current);
                if (saved) next.add(opportunityId);
                else next.delete(opportunityId);
                return next;
            });
        },
        [user.id, enqueueSnackbar],
    );

    const reload = useCallback(() => load(), [load]);

    const refreshOpportunity = useCallback(async (opportunityId: number) => {
        const { data, error } = await supabase
            .from("opportunities")
            .select(OPPORTUNITY_COLUMNS)
            .eq("id", opportunityId)
            .single();
        if (error) return false;
        const updated = toOpportunity(data as unknown as OpportunityRow);
        setOpportunities((current) =>
            current.map((o) => (o.id === updated.id ? updated : o)),
        );
        return true;
    }, []);

    const value = useMemo(
        () => ({
            loading,
            failed,
            opportunities,
            categories,
            eligibilities,
            latestBulletin,
            savedIds,
            setSaved,
            refreshOpportunity,
            student,
            setAboutYou,
            reload,
            catalogFilters,
            setCatalogFilters,
        }),
        [
            loading,
            failed,
            opportunities,
            categories,
            eligibilities,
            latestBulletin,
            savedIds,
            setSaved,
            refreshOpportunity,
            student,
            setAboutYou,
            reload,
            catalogFilters,
        ],
    );

    return (
        <OpportunitiesContext.Provider value={value}>
            {children}
        </OpportunitiesContext.Provider>
    );
};
