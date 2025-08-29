import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Box, Skeleton, useMediaQuery } from "@mui/material";
import { Masonry } from "@mui/lab";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import { Helmet } from "react-helmet";

import OrgCard from "./components/OrgCard";
import SearchFilter from "./components/SearchFilter";

type SearchState = {
    orgs: Partial<Organization>[];
    offset: number;
    more: boolean;
};

const Catalog = () => {
    const { enqueueSnackbar } = useSnackbar();
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const isFetchingRef = useRef(false);
    const offsetRef = useRef(0);

    const [searchState, setSearchState] = useState<SearchState>({
        orgs: [],
        offset: 0,
        more: true,
    });

    const [loadingInitial, setLoadingInitial] = useState(true);
    const [loadingNext, setLoadingNext] = useState(false);

    const [searchParams, setSearchParams] = useState<SearchParams>({
        name: "",
        meetingDays: [],
        commitmentLevels: [],
        tags: [],
    });

    const [debouncedSearchParams, setDebouncedSearchParams] =
        useState(searchParams);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearchParams(searchParams), 500);
        return () => clearTimeout(t);
    }, [searchParams]);

    const [seed] = useState(
        sessionStorage.getItem("seed")
            ? parseFloat(sessionStorage.getItem("seed") as string)
            : Math.random(),
    );
    useEffect(() => {
        sessionStorage.setItem("seed", seed.toString());
    }, [seed]);

    // keep new offset for fetch closures
    useEffect(() => {
        offsetRef.current = searchState.offset;
    }, [searchState.offset]);

    const isTwo = useMediaQuery("(max-width: 1400px)");
    const isTwoWrap = useMediaQuery("(max-width: 1000px)");
    const isOne = useMediaQuery("(max-width: 700px)");

    let columns = 3;
    if (isTwo) columns = 2;
    if (isOne) columns = 1;

    const querySize = columns * 3;

    const fetchPage = useCallback(
        async (isReset: boolean) => {
            const originalOffset = isReset ? 0 : offsetRef.current;

            let orgData: Partial<Organization>[] | null;
            let orgError: any;

            const noFilters =
                !debouncedSearchParams.name.length &&
                !debouncedSearchParams.meetingDays.length &&
                !debouncedSearchParams.commitmentLevels.length &&
                !debouncedSearchParams.tags.length;

            if (noFilters) {
                // get orgs in random order (no search params)
                ({ data: orgData, error: orgError } = await supabase.rpc(
                    "get_random_organizations",
                    {
                        seed,
                        query_offset: originalOffset,
                        query_limit: querySize,
                    },
                ));
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
                const catalogQuery = `and(or(name.ilike.%${debouncedSearchParams.name}%,keywords.ilike.%${debouncedSearchParams.name}%)${extra})`;

                ({ data: orgData, error: orgError } = await supabase
                    .from("organizations")
                    .select("*")
                    .neq("state", "PENDING")
                    .neq("state", "PUNISHED")
                    .or(catalogQuery)
                    .range(originalOffset, originalOffset + querySize - 1));
            }

            if (orgError) {
                enqueueSnackbar(
                    "Error fetching organizations. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return { data: [] as Partial<Organization>[], more: false };
            }

            const safe = orgData ?? [];
            return { data: safe, more: safe.length >= querySize };
        },
        [
            enqueueSnackbar,
            seed,
            debouncedSearchParams.tags,
            debouncedSearchParams.meetingDays,
            debouncedSearchParams.commitmentLevels,
            debouncedSearchParams.name,
        ],
    );

    const getOrgs = useCallback(
        async (isReset = false) => {
            if (isFetchingRef.current) return;
            isFetchingRef.current = true;
            if (isReset) setLoadingInitial(true);
            else setLoadingNext(true);

            try {
                const res = await fetchPage(isReset);
                if (!res) return;

                const pageIds = (res.data ?? [])
                    .map((o) => o.id)
                    .filter(Boolean) as number[];

                let counts = new Map<number, number>();
                if (pageIds.length) {
                    const { data: mems } = await supabase
                        .from("memberships")
                        .select("organization_id")
                        .in("organization_id", pageIds)
                        .eq("active", true);

                    counts = new Map<number, number>();
                    (mems ?? []).forEach((m: any) => {
                        counts.set(
                            m.organization_id,
                            (counts.get(m.organization_id) ?? 0) + 1,
                        );
                    });
                }

                const pageWithMems = res.data.map((o) => {
                    const count = counts.get(o.id as number) ?? 0;
                    const fakeMemberships = Array.from(
                        { length: count },
                        () => ({ active: true }),
                    ) as Partial<Membership>[];
                    return { ...o, memberships: fakeMemberships };
                });

                setSearchState((prev) => ({
                    orgs: isReset
                        ? pageWithMems
                        : [...prev.orgs, ...pageWithMems],
                    offset: (isReset ? 0 : prev.offset) + querySize,
                    more: res.more,
                }));

                if (isReset) window.scrollTo({ top: 0 });
            } finally {
                if (isReset) setLoadingInitial(false);
                else setLoadingNext(false);
                isFetchingRef.current = false;
            }
        },
        [fetchPage],
    );

    // reset and fetch first page on param change
    useEffect(() => {
        setSearchState({ orgs: [], offset: 0, more: true });
        setLoadingInitial(true);
        setLoadingNext(false);
        getOrgs(true);
    }, [getOrgs, seed, debouncedSearchParams]);

    // infinite scroll only after initial load is done and we still have more
    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || loadingInitial || !searchState.more) return;

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
    }, [getOrgs, searchState.more, loadingInitial]);

    const approvedOrgs = searchState.orgs.filter((o) => o.state !== "PENDING");

    const SkeletonGrid = ({ count }: { count: number }) => (
        <div className="flex gap-4 flex-wrap">
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton
                    key={i}
                    animation="wave"
                    height={445}
                    sx={{ borderRadius: "20px" }}
                    className="flex-1"
                    variant="rounded"
                />
            ))}
        </div>
    );

    return (
        <section className={"flex relative flex-wrap"}>
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

            <Box
                sx={{
                    width: isOne || isTwoWrap ? "100%" : isTwo ? "70%" : "75%",
                    paddingX: isOne ? "1rem" : "2rem",
                    position: "relative",
                    paddingBottom: "20vh",
                }}
            >
                <div className="[overflow-anchor:none]">
                    {/* When new search -show top skeletons */}
                    {loadingInitial ? (
                        <div className={"relative top-10"}>
                            <SkeletonGrid count={columns} />
                        </div>
                    ) : (
                        <Masonry columns={columns} spacing={isOne ? 0 : 2}>
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
                        {searchState.more && !loadingInitial ? (
                            loadingNext ? (
                                <SkeletonGrid count={columns} />
                            ) : (
                                <div style={{ height: 1, width: "100%" }} />
                            )
                        ) : (
                            <div style={{ height: 1, width: "100%" }} />
                        )}
                    </div>

                    {!loadingInitial && !searchState.more && (
                        <div>
                            {approvedOrgs.length === 0 ? (
                                <h3 className={"text-center pt-40 opacity-70"}>
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
            </Box>
        </section>
    );
};

export default Catalog;
