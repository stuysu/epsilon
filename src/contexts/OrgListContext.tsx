import { supabase } from "../lib/supabaseClient";
import { fetchCached, hashKey } from "../lib/queryCache";
import useCachedQuery, { unwrap } from "../lib/useCachedQuery";

type Organization = {
    id: number;
    name: string;
    purpose?: string;
    state?: string;
    tags?: string[];
    keywords?: string;
    commitment_level?: string;
    meeting_days?: string[];
    picture?: string;
    url?: string;
};

// what "Activities Like This" needs; public, so it's kept between visits
const COLUMNS =
    "id, name, url, picture, purpose, keywords, tags, meeting_days, commitment_level, state";
const KEY = ["orgList", COLUMNS];
const OPTIONS = { public: true, persist: true, staleTime: 10 * 60_000 };

const fetchOrgList = async () =>
    unwrap<Organization[]>(
        await supabase.from("organizations").select(COLUMNS),
    );

export const useOrgList = () => {
    const { data, loading } = useCachedQuery(KEY, fetchOrgList, OPTIONS);
    return { orgs: data ?? null, loading };
};

// lets an activity page load the list alongside its own data
export const prefetchOrgList = () =>
    fetchCached(
        hashKey("public", KEY),
        fetchOrgList,
        OPTIONS.staleTime,
        OPTIONS.persist,
    );
