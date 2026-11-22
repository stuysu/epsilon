import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getEntry, hashKey, isStale, setData } from "../../lib/queryCache";
import { useCacheScope } from "../../lib/useCachedQuery";
import useMediaQuery from "../../utils/useMediaQuery";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import AsyncButton from "../../components/ui/buttons/AsyncButton";
import ContentUnavailable from "../../components/ui/content/ContentUnavailable";

import OrgCard from "./components/OrgCard";
import SearchFilter from "./components/SearchFilter";
import Masonry from "../../components/ui/Masonry";
import Skeleton from "../../components/ui/Skeleton";

/* builds a quoted PostgREST ilike value that matches `text` literally:
LIKE wildcards are escaped first, then the value is double-quoted so commas,
parentheses and dots can't break out of the .or() filter */
const ilikeContains = (text: string) => {
    const pattern = `%${text.replace(/[\\%_]/g, "\\$&")}%`;
    return `"${pattern.replace(/["\\]/g, "\\$&")}"`;
};

/* lowercases and drops punctuation the same way the database's
organization_search_text() does: . ' ’ are removed and any other run of
symbols or spaces becomes one space, so "U.N." finds "Model UN" and
"math_club" finds "Math Club" */
const cleanSearch = (text: string) =>
    text
        .toLowerCase()
        .replace(/[.'’]/g, "")
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();

type SearchState = {
    orgs: Partial<Organization>[];
    offset: number;
    more: boolean;
};

const SEARCH_KEY = "activity-search";
const SORT_ORDER: Record<CatalogSort, [string, boolean][]> = {
    shuffle: [
        ["shuffle_rank", true],
        ["id", true],
    ],
    name: [
        ["sort_name", true],
        ["id", true],
    ],
    members: [
        ["member_count", false],
        ["sort_name", true],
        ["id", true],
    ],
    newest: [
        ["created_at", false],
        ["id", false],
    ],
};

// loaded pages are kept per seed, filters and page size, so coming back skips the skeletons
const CATALOG_STALE = 5 * 60_000;
const catalogKey = (seed: number, params: SearchParams, size: number) => [
    "catalog",
    seed,
    JSON.stringify(params),
    size,
];

const Catalog = () => {
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const resultsRef = useRef<HTMLDivElement | null>(null);
    const isFetchingRef = useRef(false);
    const generationRef = useRef(0);
    const offsetRef = useRef(0);

    // kept for the tab, so Back from a club returns to the same search
    const [searchParams, setSearchParams] = useState<SearchParams>(() => {
        const params: SearchParams = {
            name: "",
            meetingDays: [],
            commitmentLevels: [],
            tags: [],
            sort: "shuffle",
        };
        try {
            const saved = JSON.parse(
                sessionStorage.getItem(SEARCH_KEY) ?? "{}",
            );
            if (typeof saved.name === "string") params.name = saved.name;
            for (const key of [
                "meetingDays",
                "commitmentLevels",
                "tags",
            ] as const)
                if (Array.isArray(saved[key]))
                    params[key] = saved[key].filter(
                        (v: unknown) => typeof v === "string",
                    );
            if (saved.sort in SORT_ORDER) params.sort = saved.sort;
        } catch {
            /* storage can be blocked */
        }
        return params;
    });
    useEffect(() => {
        try {
            sessionStorage.setItem(SEARCH_KEY, JSON.stringify(searchParams));
        } catch {
            /* storage can be blocked */
        }
    }, [searchParams]);

    const [debouncedSearchParams, setDebouncedSearchParams] =
        useState(searchParams);
    useEffect(() => {
        /* typing only punctuation (e.g. the dots in "U.N.") doesn't change
           the cleaned search, so keep the old params and don't reload.
           a new sort or filter applies right away; only typing waits */
        const typing =
            cleanSearch(debouncedSearchParams.name) !==
            cleanSearch(searchParams.name);
        const t = setTimeout(
            () =>
                setDebouncedSearchParams((prev) =>
                    cleanSearch(prev.name) === cleanSearch(searchParams.name) &&
                    prev.tags === searchParams.tags &&
                    prev.meetingDays === searchParams.meetingDays &&
                    prev.commitmentLevels === searchParams.commitmentLevels &&
                    prev.sort === searchParams.sort
                        ? prev
                        : searchParams,
                ),
            typing ? 500 : 0,
        );
        return () => clearTimeout(t);
    }, [searchParams, debouncedSearchParams.name]);

    const [seed] = useState(
        sessionStorage.getItem("seed")
            ? parseFloat(sessionStorage.getItem("seed") as string)
            : Math.random(),
    );
    useEffect(() => {
        sessionStorage.setItem("seed", seed.toString());
    }, [seed]);

    const isTwo = useMediaQuery("(max-width: 1400px)");
    const isTwoWrap = useMediaQuery("(max-width: 1000px)");
    const isOne = useMediaQuery("(max-width: 700px)");

    // more columns on very wide screens, so cards stay about the same size
    const isFour = useMediaQuery("(min-width: 2300px)");

    let columns = isFour ? 4 : 3;
    if (isTwo) columns = 2;
    if (isOne) columns = 1;

    const querySize = columns * 3;

    const scope = useCacheScope();
    const cacheHash = hashKey(
        scope,
        catalogKey(seed, debouncedSearchParams, querySize),
    );
    const [searchState, setSearchState] = useState<SearchState>(
        () =>
            getEntry<SearchState>(cacheHash)?.data ?? {
                orgs: [],
                offset: 0,
                more: true,
            },
    );

    const [loadingInitial, setLoadingInitial] = useState(
        () => !getEntry(cacheHash)?.data,
    );
    const [loadingNext, setLoadingNext] = useState(false);
    const [failed, setFailed] = useState<false | "initial" | "more">(false);

    // keep new offset for fetch closures
    useEffect(() => {
        offsetRef.current = searchState.offset;
    }, [searchState.offset]);

    const fetchPage = useCallback(
        async (isReset: boolean, size = querySize) => {
            const originalOffset = isReset ? 0 : offsetRef.current;

            let orgData: Partial<Organization>[] | null;
            let orgError: any;

            const search = cleanSearch(debouncedSearchParams.name);

            const noFilters =
                !search.length &&
                !debouncedSearchParams.meetingDays.length &&
                !debouncedSearchParams.commitmentLevels.length &&
                !debouncedSearchParams.tags.length;

            if (noFilters && debouncedSearchParams.sort === "shuffle") {
                // get orgs in random order (no search params)
                const random = await supabase
                    .rpc("get_random_organizations", {
                        seed,
                        query_offset: originalOffset,
                        query_limit: size,
                    })
                    .select("*, member_count");
                orgData = random.data as Partial<Organization>[] | null;
                orgError = random.error;
            } else {
                // get orgs with search params

                const clauses: string[] = [];

                if (debouncedSearchParams.tags.length) {
                    const tagReqs = debouncedSearchParams.tags
                        .map((tag) => `tags.cs.{${tag}}`)
                        .join(",");
                    clauses.push(`and(or(${tagReqs}))`);
                }

                if (debouncedSearchParams.meetingDays.length) {
                    const dayReqs = debouncedSearchParams.meetingDays
                        .map((day) => `meeting_days.cs.{${day}}`)
                        .join(",");
                    clauses.push(`and(or(${dayReqs}))`);
                }

                if (debouncedSearchParams.commitmentLevels.length) {
                    const commitmentReqs =
                        debouncedSearchParams.commitmentLevels
                            .map((level) => `commitment_level.eq.${level}`)
                            .join(",");
                    clauses.push(`and(or(${commitmentReqs}))`);
                }

                const extra = clauses.length
                    ? `,and(${clauses.join(",")})`
                    : "";
                const catalogQuery = `and(search_text.ilike.${ilikeContains(search)}${extra})`;

                let query = supabase
                    .from("organizations")
                    .select("*, member_count")
                    .neq("state", "PENDING")
                    .neq("state", "PUNISHED")
                    .or(catalogQuery);
                /* ends with id, a fixed order so paging never repeats or skips a club */
                for (const [column, ascending] of SORT_ORDER[
                    debouncedSearchParams.sort
                ])
                    query = query.order(column, { ascending });
                ({ data: orgData, error: orgError } = await query.range(
                    originalOffset,
                    originalOffset + size - 1,
                ));
            }

            if (orgError) return null;

            const safe = orgData ?? [];
            return { data: safe, more: safe.length >= size };
        },
        [
            seed,
            debouncedSearchParams.tags,
            debouncedSearchParams.meetingDays,
            debouncedSearchParams.commitmentLevels,
            debouncedSearchParams.name,
            debouncedSearchParams.sort,
            querySize,
        ],
    );

    const getOrgs = useCallback(
        async (isReset = false, quiet = false, size = querySize) => {
            if (isFetchingRef.current && !isReset) return;
            isFetchingRef.current = true;
            const generation = isReset
                ? ++generationRef.current
                : generationRef.current;
            const current = () => generation === generationRef.current;
            if (!quiet) setFailed(false);
            if (isReset && !quiet) setLoadingInitial(true);
            else if (!isReset) setLoadingNext(true);

            try {
                const res = await fetchPage(isReset, size);
                if (!current()) return;
                if (!res) {
                    // a failed background refresh keeps the cached results
                    if (!quiet) setFailed(isReset ? "initial" : "more");
                    return;
                }
                setFailed(false);

                setSearchState((prev) => {
                    const next = {
                        orgs: isReset ? res.data : [...prev.orgs, ...res.data],
                        offset: (isReset ? 0 : prev.offset) + size,
                        more: res.more,
                    };
                    setData(cacheHash, next);
                    return next;
                });
            } finally {
                if (current()) {
                    if (isReset) setLoadingInitial(false);
                    else setLoadingNext(false);
                    isFetchingRef.current = false;
                }
            }
        },
        [fetchPage, cacheHash, querySize],
    );

    // on a param change show the cached pages, or reset and fetch the first page
    useEffect(() => {
        const cached = getEntry<SearchState>(cacheHash);
        setFailed(false);
        if (cached?.data) {
            generationRef.current++;
            isFetchingRef.current = false;
            setSearchState(cached.data);
            setLoadingInitial(false);
            setLoadingNext(false);
            // reload as many as are shown, so a restored scroll position holds
            if (isStale(cached, CATALOG_STALE))
                getOrgs(true, true, Math.max(querySize, cached.data.offset));
            return;
        }
        setSearchState({ orgs: [], offset: 0, more: true });
        setLoadingInitial(true);
        setLoadingNext(false);
        getOrgs(true);
    }, [getOrgs, cacheHash, querySize]);

    // infinite scroll only after initial load is done and we still have more
    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || loadingInitial || !searchState.more || failed) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) getOrgs(false);
            },
            {
                root: null,
                threshold: 0,
                // start loading next page before the skeletons come fully into view
                rootMargin: "890px 0px",
            },
        );

        observer.observe(node);
        return () => observer.disconnect();
        // a fresh observer after each page, since one that stays in view never fires again
    }, [getOrgs, searchState.more, searchState.offset, loadingInitial, failed]);

    // new results start at the top, if you had scrolled past it
    const firstParams = useRef(true);
    useEffect(() => {
        if (firstParams.current) {
            firstParams.current = false;
            return;
        }
        const results = resultsRef.current;
        if (results && results.getBoundingClientRect().top < 0)
            results.scrollIntoView({ block: "start" });
    }, [debouncedSearchParams]);

    const approvedOrgs = searchState.orgs.filter((o) => o.state !== "PENDING");

    const SkeletonGrid = ({ count }: { count: number }) => (
        <div className="flex gap-4 flex-wrap">
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton key={i} className="h-[445px] flex-1 rounded-[20px]" />
            ))}
        </div>
    );

    return (
        <section className={"flex relative flex-wrap"}>
            <h1 className="sr-only">StuyActivities Catalog</h1>
            <Helmet>
                <title>StuyActivities Catalog - Epsilon</title>
                <meta
                    name="description"
                    content="Discover and explore student organizations at Stuyvesant High School. Find Activities that match your interests."
                />
            </Helmet>

            <SearchFilter
                isOneColumn={isOne}
                isTwoColumn={isTwo}
                isTwoWrap={isTwoWrap}
                value={searchParams}
                onChange={setSearchParams}
            />

            <div
                ref={resultsRef}
                className="relative scroll-mt-4 pb-[20vh]"
                style={{
                    width: isOne || isTwoWrap ? "100%" : isTwo ? "70%" : "75%",
                    paddingInline: isOne ? "1rem" : isTwoWrap ? "3rem" : "2rem",
                }}
            >
                <div className="[overflow-anchor:none]">
                    {failed === "initial" ? (
                        <ContentUnavailable
                            icon="bx-error-circle"
                            iconColor="text-red"
                            headingLevel="h2"
                            title="Activities could not load"
                            description="Check your connection and try again. If this keeps happening, contact it@stuysu.org."
                            action={
                                <AsyncButton onClick={() => getOrgs(true)}>
                                    Try Again
                                </AsyncButton>
                            }
                        />
                    ) : loadingInitial ? (
                        <div className={"relative top-10"}>
                            <SkeletonGrid count={columns} />
                        </div>
                    ) : (
                        <Masonry
                            columns={columns}
                            gap={isOne ? 0 : 16}
                            className={isOne ? "" : "pr-4"}
                        >
                            {searchState.orgs.map((org, i) => (
                                <div key={(org as any).id ?? `ghost-${i}`}>
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                            scale: 0.98,
                                            filter: "blur(10px)",
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            filter: "blur(0px)",
                                        }}
                                        transition={{
                                            duration: 0.4,
                                            ease: [0.33, 1, 0.68, 1],
                                            delay: (i % (columns * 3)) * 0.08,
                                        }}
                                        viewport={{
                                            once: true,
                                            amount: 0.2,
                                            margin: "200px",
                                        }}
                                        style={{
                                            willChange:
                                                "transform, opacity, filter",
                                            backfaceVisibility: "hidden",
                                        }}
                                    >
                                        <OrgCard organization={org} />
                                    </motion.div>
                                </div>
                            ))}
                        </Masonry>
                    )}

                    {/* Paging sentinel, not for initial load*/}
                    <div
                        ref={sentinelRef}
                        className="w-full flex flex-col gap-16 my-10 pr-4 pt-4"
                        style={{ overflowAnchor: "none" }}
                    >
                        {failed === "more" ? (
                            <div className="flex flex-col items-center gap-3 text-center">
                                <p role="alert">
                                    More activities could not load.
                                </p>
                                <AsyncButton onClick={() => getOrgs(false)}>
                                    Try Again
                                </AsyncButton>
                            </div>
                        ) : searchState.more && !loadingInitial && !failed ? (
                            loadingNext ? (
                                <SkeletonGrid count={columns} />
                            ) : (
                                <div style={{ height: 1, width: "100%" }} />
                            )
                        ) : (
                            <div style={{ height: 1, width: "100%" }} />
                        )}
                    </div>

                    {!loadingInitial && !searchState.more && !failed && (
                        <div>
                            {approvedOrgs.length === 0 ? (
                                <h3
                                    className={
                                        "text-center pt-40 text-typography-2"
                                    }
                                >
                                    <i className={"bx bx-search bx-md m-5"}></i>
                                    <br />
                                    No Results
                                </h3>
                            ) : (
                                <h3 className={"text-center pt-8 opacity-70"}>
                                    {approvedOrgs.length}{" "}
                                    {`Organization${approvedOrgs.length > 1 ? "s" : ""} Found`}
                                </h3>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Catalog;
