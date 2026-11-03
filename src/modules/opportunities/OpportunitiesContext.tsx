import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
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
    created_at,
    categories:opportunity_categories (id, name, parent_id, position),
    eligibilities:opportunity_eligibilities (id, name, grade, position)
`;

// The server can cap how many rows one request returns, so the catalog,
// which only grows, is read in pages.
const PAGE_SIZE = 1000;

// Each page starts after the last id seen and the loop runs until a page
// comes back empty, so a server cap below PAGE_SIZE or a row deleted mid-way
// can't drop rows.
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
        // stop on an empty page, or one with nothing new if the filter was ignored
        const page = (data as unknown as Opportunity[]).filter(
            (row) => row.id > lastId,
        );
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
    reload: () => Promise<void>;
    // kept here so the catalog's filters survive a visit to a detail page
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
    reload: async () => undefined,
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

    const load = useCallback(
        async (isCurrent: () => boolean = () => true) => {
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

            if (!isCurrent()) return;

            if (
                opportunityRes.error ||
                categoryRes.error ||
                eligibilityRes.error ||
                bulletinRes.error ||
                savedRes.error
            ) {
                setFailed(true);
                setLoading(false);
                return;
            }

            setOpportunities(opportunityRes.data ?? []);
            setCategories(categoryRes.data);
            setEligibilities(eligibilityRes.data);
            setLatestBulletin(bulletinRes.data[0] ?? null);
            setSavedIds(new Set(savedRes.data.map((s) => s.opportunity_id)));
            setLoading(false);
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
