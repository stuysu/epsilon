import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    clearPrivate,
    fetchQuery,
    getEntry,
    hashKey,
    invalidate,
    isStale,
    resetCacheForTests,
    setData,
    subscribe,
} from "./queryCache";

const deferred = <T>() => {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

beforeEach(() => {
    resetCacheForTests();
    localStorage.clear();
});
afterEach(() => vi.useRealTimers());

describe("queryCache", () => {
    it("shares one request between callers", async () => {
        const hash = hashKey(1, ["org", "chess"]);
        const fetcher = vi.fn(async () => ({ name: "Chess" }));
        const [a, b] = await Promise.all([
            fetchQuery(hash, fetcher),
            fetchQuery(hash, fetcher),
        ]);
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(a).toEqual(b);
        expect(getEntry(hash)?.data).toEqual({ name: "Chess" });
    });

    it("goes stale after staleTime or when invalidated", async () => {
        vi.useFakeTimers();
        const hash = hashKey(1, ["catalog", 0.5]);
        await fetchQuery(hash, async () => [1, 2]);
        expect(isStale(getEntry(hash), 60_000)).toBe(false);
        vi.advanceTimersByTime(60_000);
        expect(isStale(getEntry(hash), 60_000)).toBe(true);

        await fetchQuery(hash, async () => [1, 2, 3]);
        invalidate(["catalog"]);
        expect(isStale(getEntry(hash), 60_000)).toBe(true);
        expect(getEntry(hash)?.data).toEqual([1, 2, 3]);
    });

    it("keeps the previous data when a refetch fails", async () => {
        const hash = hashKey(1, ["home", "posts"]);
        await fetchQuery(hash, async () => ["post"]);
        await fetchQuery(hash, async () => {
            throw new Error("offline");
        });
        expect(getEntry(hash)?.data).toEqual(["post"]);
        expect(getEntry(hash)?.error).toBeInstanceOf(Error);
    });

    it("keeps each viewer's entries apart", async () => {
        await fetchQuery(hashKey(1, ["org", "x"]), async () => "first");
        expect(getEntry(hashKey(2, ["org", "x"]))).toBeUndefined();
        expect(getEntry(hashKey("anon", ["org", "x"]))).toBeUndefined();
    });

    it("drops private entries on sign-out, and ignores requests still in flight", async () => {
        const privateHash = hashKey(1, ["org", "x"]);
        const publicHash = hashKey("public", ["orgList"]);
        await fetchQuery(publicHash, async () => ["club"]);

        const pending = deferred<string>();
        const request = fetchQuery(privateHash, () => pending.promise);
        clearPrivate();
        pending.resolve("private");
        await request;

        expect(getEntry(privateHash)).toBeUndefined();
        expect(getEntry(publicHash)?.data).toEqual(["club"]);
    });

    it("marks a request stale when a local write lands mid-flight", async () => {
        const hash = hashKey(1, ["org", "x"]);
        await fetchQuery(hash, async () => ({ joinable: false }));
        const pending = deferred<{ joinable: boolean }>();
        const request = fetchQuery(hash, () => pending.promise);
        setData(hash, { joinable: true });
        pending.resolve({ joinable: false });
        await request;
        expect(getEntry(hash)?.data).toEqual({ joinable: true });
        expect(getEntry(hash)?.stale).toBe(true);
    });

    it("notifies subscribers", async () => {
        const hash = hashKey(1, ["joinDates", 3, 5]);
        const listener = vi.fn();
        const unsubscribe = subscribe(hash, listener);
        await fetchQuery(hash, async () => 1);
        expect(listener).toHaveBeenCalled();
        unsubscribe();
        listener.mockClear();
        setData(hash, 2);
        expect(listener).not.toHaveBeenCalled();
    });

    it("persists only public entries", async () => {
        await fetchQuery(hashKey("public", ["orgList"]), async () => [1], true);
        await fetchQuery(hashKey(1, ["org", "x"]), async () => "secret", true);
        const stored = Object.keys(localStorage);
        expect(stored).toHaveLength(1);
        expect(stored[0]).toContain("orgList");

        resetCacheForTests();
        expect(getEntry(hashKey("public", ["orgList"]), true)?.data).toEqual([
            1,
        ]);
        expect(getEntry(hashKey(1, ["org", "x"]), true)).toBeUndefined();
    });

    it("removes stored copies when invalidated", async () => {
        await fetchQuery(hashKey("public", ["orgList"]), async () => [1], true);
        invalidate(["orgList"]);
        expect(Object.keys(localStorage)).toHaveLength(0);
    });
});
