/* a small stale-while-revalidate cache for reads; keys always start with a
   scope (a user id, "anon" or "public") so one viewer never sees another's data */

export type QueryKey = readonly unknown[];
export type Scope = number | "anon" | "public";

export type CacheEntry<T = unknown> = {
    data?: T;
    error?: unknown;
    updatedAt: number;
    stale: boolean;
    fetching: boolean;
};

type Internal = CacheEntry & {
    parts: unknown[];
    promise?: Promise<unknown>;
    version: number;
};

const MAX_ENTRIES = 150;
const STORAGE_PREFIX = "epsilon-cache:v1:";

const entries = new Map<string, Internal>();
const listeners = new Map<string, Set<() => void>>();
let generation = 0;

export const hashKey = (scope: Scope, key: QueryKey) =>
    JSON.stringify([scope, ...key]);

const notify = (hash: string) =>
    listeners.get(hash)?.forEach((listener) => listener());

const put = (hash: string, entry: Internal) => {
    entries.delete(hash);
    entries.set(hash, entry);
    notify(hash);
    if (entries.size <= MAX_ENTRIES) return;
    for (const [old, e] of [...entries]) {
        if (entries.size <= MAX_ENTRIES) break;
        if (!listeners.get(old)?.size && !e.promise) entries.delete(old);
    }
};

const readStored = (hash: string): Internal | undefined => {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + hash);
        if (!raw) return;
        const { data, updatedAt } = JSON.parse(raw);
        if (typeof updatedAt !== "number") return;
        return {
            data,
            updatedAt,
            stale: false,
            fetching: false,
            parts: JSON.parse(hash),
            version: 0,
        };
    } catch {
        return;
    }
};

const store = (hash: string, entry: Internal) => {
    try {
        localStorage.setItem(
            STORAGE_PREFIX + hash,
            JSON.stringify({ data: entry.data, updatedAt: entry.updatedAt }),
        );
    } catch {}
};

/* only public data is ever written to localStorage */
const persists = (hash: string, persist: boolean) =>
    persist && hash.startsWith('["public"');

export const getEntry = <T>(
    hash: string,
    persist = false,
): CacheEntry<T> | undefined => {
    let entry = entries.get(hash);
    if (!entry && persists(hash, persist)) {
        entry = readStored(hash);
        if (entry) entries.set(hash, entry);
    }
    return entry as CacheEntry<T> | undefined;
};

export const subscribe = (hash: string, listener: () => void) => {
    let set = listeners.get(hash);
    if (!set) listeners.set(hash, (set = new Set()));
    set.add(listener);
    return () => {
        set.delete(listener);
        if (!set.size) listeners.delete(hash);
    };
};

export const isStale = (entry: CacheEntry | undefined, staleTime: number) =>
    !entry ||
    entry.data === undefined ||
    entry.stale ||
    Date.now() - entry.updatedAt >= staleTime;

export const fetchQuery = <T>(
    hash: string,
    fetcher: () => Promise<T>,
    persist = false,
): Promise<T | undefined> => {
    const current = entries.get(hash);
    if (current?.promise) return current.promise as Promise<T | undefined>;

    const startGeneration = generation;
    const startVersion = current?.version ?? 0;
    const settle = (patch: Partial<Internal>) => {
        const latest = entries.get(hash);
        // dropped by a sign-out, or replaced by a newer fetch
        if (generation !== startGeneration || latest?.promise !== promise)
            return;
        if (latest.version !== startVersion) {
            // written locally mid-flight, so this copy may predate the write
            put(hash, {
                ...latest,
                promise: undefined,
                fetching: false,
                stale: true,
            });
            return;
        }
        const next = { ...latest, ...patch, promise: undefined };
        put(hash, next);
        if (patch.data !== undefined && persists(hash, persist))
            store(hash, next);
    };

    const promise: Promise<T | undefined> = Promise.resolve()
        .then(fetcher)
        .then(
            (data) => {
                settle({
                    data,
                    error: undefined,
                    updatedAt: Date.now(),
                    stale: false,
                    fetching: false,
                });
                return data;
            },
            (error) => {
                settle({ error, fetching: false, updatedAt: Date.now() });
                return undefined;
            },
        );

    put(hash, {
        updatedAt: 0,
        stale: false,
        parts: JSON.parse(hash),
        version: 0,
        ...current,
        fetching: true,
        promise,
    });
    return promise;
};

/* the cached copy if fresh, otherwise a new request; undefined on failure */
export const fetchCached = async <T>(
    hash: string,
    fetcher: () => Promise<T>,
    staleTime: number,
    persist = false,
): Promise<T | undefined> => {
    const entry = getEntry<T>(hash, persist);
    if (!isStale(entry, staleTime)) return entry!.data;
    return fetchQuery(hash, fetcher, persist);
};

/* patches cached data without a request, e.g. after a write */
export const setData = <T>(
    hash: string,
    update: T | ((previous: T | undefined) => T),
) => {
    const current = entries.get(hash);
    const data =
        typeof update === "function"
            ? (update as (previous: T | undefined) => T)(
                  current?.data as T | undefined,
              )
            : update;
    put(hash, {
        updatedAt: Date.now(),
        stale: false,
        fetching: false,
        parts: JSON.parse(hash),
        ...current,
        data,
        error: undefined,
        version: (current?.version ?? 0) + 1,
    });
};

const matches = (parts: unknown[], prefix: QueryKey) =>
    prefix.every((part, i) => parts[i + 1] === part);

/* marks entries stale in every scope; mounted queries refetch, others on next use */
export const invalidate = (prefix: QueryKey) => {
    for (const [hash, entry] of [...entries]) {
        if (matches(entry.parts, prefix)) put(hash, { ...entry, stale: true });
    }
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const name = localStorage.key(i);
            if (!name?.startsWith(STORAGE_PREFIX)) continue;
            if (matches(JSON.parse(name.slice(STORAGE_PREFIX.length)), prefix))
                localStorage.removeItem(name);
        }
    } catch {}
};

/* forgets everything that isn't public; requests in flight are ignored when they land.
   Listeners aren't told: the viewer changes too, which moves every query to a new key */
export const clearPrivate = () => {
    generation++;
    for (const [hash, entry] of [...entries]) {
        if (entry.parts[0] !== "public") entries.delete(hash);
    }
};

export const resetCacheForTests = () => {
    generation++;
    entries.clear();
    listeners.clear();
};
