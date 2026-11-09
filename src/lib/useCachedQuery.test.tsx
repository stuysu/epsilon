import React from "react";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserContext from "../contexts/UserContext";
import useCachedQuery from "./useCachedQuery";
import { invalidate, resetCacheForTests } from "./queryCache";

vi.mock("./supabaseClient", () => ({
    supabase: { auth: { onAuthStateChange: vi.fn() } },
}));

const viewer = (id: number | null) =>
    ({ signed_in: id !== null, id: id ?? -1 }) as UserContextType;

const Probe = ({ fetcher }: { fetcher: () => Promise<string> }) => {
    const { data, loading } = useCachedQuery(["probe"], fetcher);
    return <p>{loading ? "loading" : data}</p>;
};

const mount = (id: number | null, fetcher: () => Promise<string>) => (
    <UserContext.Provider value={viewer(id)}>
        <Probe fetcher={fetcher} />
    </UserContext.Provider>
);

beforeEach(() => resetCacheForTests());

describe("useCachedQuery", () => {
    it("serves a remount from cache without a request", async () => {
        const fetcher = vi.fn(async () => "first");
        const { unmount } = render(mount(1, fetcher));
        expect(await screen.findByText("first")).toBeTruthy();
        unmount();

        render(mount(1, fetcher));
        expect(screen.getByText("first")).toBeTruthy();
        expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("never shows one viewer's data to another", async () => {
        const { rerender } = render(mount(1, async () => "for user 1"));
        expect(await screen.findByText("for user 1")).toBeTruthy();

        rerender(mount(null, async () => "for anyone"));
        expect(screen.getByText("loading")).toBeTruthy();
        expect(await screen.findByText("for anyone")).toBeTruthy();
    });

    it("refetches a mounted query when it is invalidated", async () => {
        let n = 0;
        render(mount(1, async () => `version ${++n}`));
        expect(await screen.findByText("version 1")).toBeTruthy();
        await act(async () => invalidate(["probe"]));
        expect(await screen.findByText("version 2")).toBeTruthy();
    });
});
