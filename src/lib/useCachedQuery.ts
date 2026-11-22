import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useSyncExternalStore,
} from "react";
import UserContext from "../contexts/UserContext";
import { supabase } from "./supabaseClient";
import {
    clearPrivate,
    fetchQuery,
    getEntry,
    hashKey,
    isStale,
    QueryKey,
    Scope,
    setData,
    subscribe,
} from "./queryCache";

export { invalidate } from "./queryCache";

type Options = {
    staleTime?: number;
    // same for every viewer, so it may outlive a sign-out
    public?: boolean;
    // keep in localStorage between visits; public data only
    persist?: boolean;
};

let listening = false;
const listenForSignOut = () => {
    if (listening) return;
    listening = true;
    supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_OUT") return;
        clearPrivate();
        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const name = localStorage.key(i);
                if (name?.startsWith("opportunities-cache:"))
                    localStorage.removeItem(name);
            }
        } catch {}
    });
};

export const useCacheScope = (isPublic = false): Scope => {
    const user = useContext(UserContext);
    if (isPublic) return "public";
    return user.signed_in ? user.id : "anon";
};

const noop = () => () => {};

/* returns cached data at once, refetching in the background once it's older
   than staleTime; a null key waits */
export default function useCachedQuery<T>(
    key: QueryKey | null,
    fetcher: () => Promise<T>,
    {
        staleTime = 60_000,
        public: isPublic = false,
        persist = false,
    }: Options = {},
) {
    listenForSignOut();
    const scope = useCacheScope(isPublic);
    const hash = key ? hashKey(scope, key) : null;

    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const entry = useSyncExternalStore(
        useCallback(
            (listener: () => void) =>
                hash ? subscribe(hash, listener) : noop(),
            [hash],
        ),
        () => (hash ? getEntry<T>(hash, persist) : undefined),
    );

    const refetch = useCallback(
        () =>
            hash
                ? fetchQuery(hash, () => fetcherRef.current(), persist)
                : Promise.resolve(undefined),
        [hash, persist],
    );

    const staleFlag = !!entry?.stale;
    const hasEntry = !!entry;
    useEffect(() => {
        if (!hash) return;
        if (isStale(getEntry(hash, persist), staleTime)) refetch();
    }, [hash, persist, staleTime, staleFlag, hasEntry, refetch]);

    const update = useCallback(
        (next: T | ((previous: T | undefined) => T)) => {
            if (hash) setData(hash, next);
        },
        [hash],
    );

    return {
        data: entry?.data,
        error: entry?.error,
        loading: !!hash && entry?.data === undefined && !entry?.error,
        fetching: !!entry?.fetching,
        refetch,
        setData: update,
    };
}

/* turns a Supabase result into data, or throws its error */
export const unwrap = <T>({
    data,
    error,
}: {
    data: T | null;
    error: unknown;
}): T => {
    if (error) throw error;
    return data as T;
};
