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

type Snapshot = {
    opportunities: Opportunity[];
    categories: OpportunityCategory[];
    eligibilities: OpportunityEligibility[];
    latestBulletin: OpportunityBulletin | null;
    savedIds: number[];
};

// shown at once on the next visit while a fresh copy loads; bump the version when the columns change
const cacheKey = (userId: number) => `opportunities-cache:v1:${userId}`;
let memoryCache: { userId: number; snapshot: Snapshot } | null = null;

const readCache = (userId: number): Snapshot | null => {
    if (memoryCache?.userId === userId) return memoryCache.snapshot;
    try {
        const value = JSON.parse(
            localStorage.getItem(cacheKey(userId)) ?? "null",
        );
        if (
            !Array.isArray(value?.opportunities) ||
            !Array.isArray(value.categories) ||
            !Array.isArray(value.eligibilities) ||
            !Array.isArray(value.savedIds)
        ) {
            return null;
        }
        memoryCache = { userId, snapshot: value };
        return value;
    } catch {
        return null;
    }
};

const writeCache = (userId: number, snapshot: Snapshot) => {
    memoryCache = { userId, snapshot };
    try {
        localStorage.setItem(cacheKey(userId), JSON.stringify(snapshot));
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
    student: { grade: 0 },
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

    const [cached] = useState(() => readCache(user.id));
    const [loading, setLoading] = useState(!cached);
    const [failed, setFailed] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>(
        cached?.opportunities ?? [],
    );
    const [categories, setCategories] = useState<OpportunityCategory[]>(
        cached?.categories ?? [],
    );
    const [eligibilities, setEligibilities] = useState<
        OpportunityEligibility[]
    >(cached?.eligibilities ?? []);
    const [latestBulletin, setLatestBulletin] =
        useState<OpportunityBulletin | null>(cached?.latestBulletin ?? null);
    const [savedIds, setSavedIds] = useState<Set<number>>(
        () => new Set(cached?.savedIds),
    );
    // only data from the server is cached, never what was read from it
    const [synced, setSynced] = useState(false);
    const [catalogFilters, setCatalogFilters] =
        useState<OpportunityFilters>(DEFAULT_FILTERS);
    const [cachedFor, setCachedFor] = useState(user.id);
    // another account signed in, so its own copy applies
    if (cachedFor !== user.id) {
        setCachedFor(user.id);
        const other = readCache(user.id);
        setOpportunities(other?.opportunities ?? []);
        setCategories(other?.categories ?? []);
        setEligibilities(other?.eligibilities ?? []);
        setLatestBulletin(other?.latestBulletin ?? null);
        setSavedIds(new Set(other?.savedIds));
        setLoading(!other);
        setSynced(false);
    }

    const student = useMemo(() => ({ grade: user.grade }), [user.grade]);

    const latestLoad = useRef(0);
    const load = useCallback(
        async (isWanted: () => boolean = () => true, quiet = false) => {
            const call = ++latestLoad.current;
            const isCurrent = () => call === latestLoad.current && isWanted();
            // a cached copy stays up while it refreshes
            if (!quiet) setLoading(true);
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
                // keeps showing the cached copy rather than an error
                if (!quiet) setFailed(true);
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
            setSynced(true);
            return fresh;
        },
        [user.id],
    );

    // read by the effect without rerunning it
    const hasData = useRef(!loading);
    hasData.current = !loading;
    useEffect(() => {
        let current = true;
        load(() => current, hasData.current);
        return () => {
            current = false;
        };
    }, [load]);

    // saves and edits land in the cache too, so the next visit matches
    useEffect(() => {
        if (!synced) return;
        writeCache(user.id, {
            opportunities,
            categories,
            eligibilities,
            latestBulletin,
            savedIds: [...savedIds],
        });
    }, [
        synced,
        user.id,
        opportunities,
        categories,
        eligibilities,
        latestBulletin,
        savedIds,
    ]);

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
