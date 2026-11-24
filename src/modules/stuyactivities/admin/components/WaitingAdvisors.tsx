import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

type Waiting = { email: string; clubs: string[] };

// same check as add_organization_advisor; the signup trigger only matches a
// charter whose whole faculty_email is one address
const EMAIL =
    /^[a-z0-9._%+!#$&*\/=?^{|}~-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
const isSchool = (email: string) => email.endsWith("@stuy.edu");

// Teachers a club named as advisor (charter or roster invite) who have no
// Epsilon account. Creating their faculty account adds them as advisor.
const fetchWaiting = async (): Promise<Waiting[] | null> => {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const [invites, charters] = await Promise.all([
        supabase
            .from("pending_advisors")
            .select("email, organizations!inner(name, state)")
            .not("organizations.state", "in", "(PENDING,REJECTED)")
            .gt("created_at", yearAgo.toISOString()),
        supabase
            .from("organizations")
            .select("name, faculty_email, memberships(id)")
            .not("state", "in", "(PENDING,REJECTED)")
            .not("faculty_email", "is", null)
            .eq("memberships.role", "ADVISOR")
            .eq("memberships.active", true),
    ]);
    if (invites.error || charters.error) return null;

    const named = new Map<string, Set<string>>();
    const add = (email: string, club: string) => {
        const key = email.trim().toLowerCase();
        if (!named.has(key)) named.set(key, new Set());
        named.get(key)!.add(club);
    };
    for (const row of invites.data as unknown as {
        email: string;
        organizations: { name: string };
    }[]) {
        add(row.email, row.organizations.name);
    }
    // clubs that already have an advisor don't need one made
    for (const row of charters.data) {
        const email = row.faculty_email?.trim() ?? "";
        if (!row.memberships.length && EMAIL.test(email)) add(email, row.name);
    }
    if (!named.size) return [];

    // in batches so the request URL stays short
    const emails = [...named.keys()];
    const batches = [];
    for (let i = 0; i < emails.length; i += 50) {
        batches.push(
            supabase
                .from("users")
                .select("email")
                .in("email", emails.slice(i, i + 50)),
        );
    }
    const results = await Promise.all(batches);
    if (results.some((r) => r.error)) return null;
    const have = new Set(
        results.flatMap((r) => r.data!.map((u) => u.email.toLowerCase())),
    );
    return [...named.entries()]
        .filter(([email]) => !have.has(email))
        .map(([email, clubs]) => ({ email, clubs: [...clubs].sort() }))
        .sort((a, b) => a.email.localeCompare(b.email));
};

const WaitingAdvisors = ({
    onPick,
    refreshKey,
}: {
    onPick: (email: string, school: boolean) => void;
    refreshKey: number;
}) => {
    const [waiting, setWaiting] = useState<Waiting[] | null>();

    const load = useCallback(() => {
        fetchWaiting().then(setWaiting);
    }, []);
    useEffect(load, [load, refreshKey]);

    if (waiting === undefined || (waiting && !waiting.length)) return null;

    return (
        <section className="mb-8 rounded-xl bg-layer-1 p-5 shadow-prominent">
            <h3>Advisors waiting for an account</h3>
            <p className="mt-1 text-typography-2">
                Clubs named these teachers as advisor, but they don't have an
                Epsilon account. Create one as faculty and they're added to
                their clubs automatically. Faculty is only ticked for @stuy.edu
                addresses.
            </p>
            {waiting === null ? (
                <p className="mt-3 text-red">
                    Couldn't load the list.{" "}
                    <button type="button" onClick={load} className="underline">
                        Try again
                    </button>
                </p>
            ) : (
                <ul className="mt-3 divide-y divide-divider">
                    {waiting.map((w) => (
                        <li
                            key={w.email}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate">{w.email}</p>
                                <p className="text-sm text-typography-2">
                                    {w.clubs.join(", ")}
                                </p>
                                {!isSchool(w.email) && (
                                    <p className="text-sm text-red">
                                        Not a @stuy.edu address. Make sure it's
                                        really the teacher's before making it a
                                        faculty account.
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    onPick(w.email, isSchool(w.email))
                                }
                                aria-label={`Fill in ${w.email}`}
                                className="touch-target rounded-lg bg-layer-2 px-3 py-1.5 text-sm transition-colors sm:hover:bg-layer-3"
                            >
                                Fill in
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default WaitingAdvisors;
