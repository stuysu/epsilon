import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

import { Box, useMediaQuery, Typography, Card } from "@mui/material";
import { Masonry } from "@mui/lab";
import DisplayLinks from "../comps/ui/DisplayLinks";

import OrgCard from "../comps/pages/catalog/OrgCard";
import { useSnackbar } from "notistack";

import Loading from "../comps/ui/Loading";
import SearchFilter from "../comps/pages/catalog/SearchFilter";
import AsyncButton from "../comps/ui/AsyncButton";

/*
function getUnique(arr : Partial<Organization>[]) {
  let obj : {[k: number] : any} = {};
  for (let thing of arr) {
    obj[thing.id || 0] = true;
  }

  return obj;
}
*/

type SearchState = {
    orgs: Partial<Organization>[];
    offset: number;
    more: boolean;
};

/*
If there are search params
- reset orgs to empty
- new function that doesn't order by random, but gets by search params
- should work with infinite scroll
*/
const querySize = 10;
const Catalog = () => {
    const { enqueueSnackbar } = useSnackbar();
    const loadingObserver = useRef(null);

    const [searchState, setSearchState] = useState<SearchState>({
        orgs: [],
        offset: 0,
        more: true,
    });

    const [searchParams, setSearchParams] = useState<SearchParams>({
        name: "",
        meetingDays: [],
        commitmentLevels: [],
        tags: [],
    });

    const [seed, setSeed] = useState(
        sessionStorage.getItem("seed")
            ? parseFloat(sessionStorage.getItem("seed") as string)
            : Math.random(),
    );

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [visibleAnnouncements, setVisibleAnnouncements] = useState(3);

    const isTwo = useMediaQuery("(max-width: 1525px)");
    const isTwoWrap = useMediaQuery("(max-width: 1100px)");
    const isOne = useMediaQuery("(max-width: 700px)");

    let columns = 3;
    if (isTwo) columns = 2;
    if (isOne) columns = 1;

    const getOrgs = async (searchState: SearchState, isReset?: boolean) => {
        const originalOffset = isReset ? 0 : searchState.offset;
        // setSearchState({...searchState, offset: originalOffset + querySize});

        let orgData, orgError;

        if (
            !searchParams.name.length &&
            !searchParams.meetingDays.length &&
            !searchParams.commitmentLevels.length &&
            !searchParams.tags.length
        ) {
            // get orgs in random order (no search params)
            ({ data: orgData, error: orgError } = await supabase.rpc(
                "get_random_organizations",
                { seed, query_offset: originalOffset, query_limit: querySize },
            ));
        } else {
            // get orgs with search params

            let orgReqs = [];
            if (searchParams.tags.length) {
                let tagReqs = searchParams.tags
                    .map((tag) => `tags.cs.{${tag}}`)
                    .join(",");
                orgReqs.push(`and(or(${tagReqs}))`);
            }

            if (searchParams.meetingDays.length) {
                let dayReqs = searchParams.meetingDays
                    .map((day) => `meeting_days.cs.{${day}}`)
                    .join(",");
                orgReqs.push(`and(or(${dayReqs}))`);
            }
            if (searchParams.commitmentLevels.length) {
                let commitmentReqs = searchParams.commitmentLevels
                    .map((level) => `commitment_level.eq.${level}`)
                    .join(",");
                orgReqs.push(`and(or(${commitmentReqs}))`);
            }

            let orgReqsQuery = "";
            if (orgReqs.length) {
                orgReqsQuery = `,and(${orgReqs.join(",")})`;
            }

            var catalogQuery = `and(or(name.ilike.%${searchParams.name}%,keywords.ilike.%${searchParams.name}%)${orgReqsQuery})`;

            ({ data: orgData, error: orgError } = await supabase
                .from("organizations")
                .select("*")
                .neq("state", "PENDING")
                .neq("state", "PUNISHED")
                .or(catalogQuery)
                // .ilike("name", `%${searchParams.name}%`)
                .range(originalOffset, originalOffset + querySize - 1));
        }

        if (orgError || !orgData) {
            enqueueSnackbar(
                "Error fetching organizations. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        let more = true;
        let finalOrgs = isReset ? orgData : [...searchState.orgs, ...orgData];

        if (orgData.length < querySize) {
            more = false;
        }

        setSearchState(() => {
            return {
                orgs: finalOrgs,
                offset: originalOffset + querySize,
                more,
            };
        });
    };

    useEffect(() => {
        getOrgs(
            {
                orgs: [],
                offset: 0,
                more: true,
            },
            true,
        );
    }, [seed, searchParams]);

    useEffect(() => {
        sessionStorage.setItem("seed", seed.toString());
    }, [seed]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data, error } = await supabase
                .from("announcements")
                .select("*")
                .order("created_at", { ascending: false });

            if (error || !data) {
                enqueueSnackbar(
                    "Failed to load announcements. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }

            setAnnouncements(data as Announcement[]);
        };

        fetchAnnouncements();
    }, [enqueueSnackbar, setAnnouncements]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    getOrgs(searchState);
                }
            },
            { threshold: 0.1 },
        );

        if (loadingObserver.current) {
            observer.observe(loadingObserver.current);
        }

        return () => {
            if (loadingObserver.current) {
                observer.unobserve(loadingObserver.current);
            }
        };
    }, [loadingObserver, searchState]);

    let approvedOrgs = searchState.orgs.filter((o) => o.state !== "PENDING");

    return (
        <Box sx={{ display: "flex", position: "relative", flexWrap: "wrap" }}>
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
                    padding: "20px",
                    position: "relative",
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexWrap: "wrap",
                        paddingTop: "10px",
                        marginBottom: "20px",
                    }}
                >
                    <Typography variant="h3">Announcements</Typography>
                    {announcements
                        .slice(0, visibleAnnouncements)
                        .map((announcement, i) => {
                            return (
                                <Card
                                    key={i}
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        marginTop: "10px",
                                        padding: "20px",
                                    }}
                                >
                                    <DisplayLinks text={announcement.content} />
                                </Card>
                            );
                        })}
                    {visibleAnnouncements < announcements.length && (
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "10px",
                            }}
                        >
                            <AsyncButton
                                variant="contained"
                                onClick={() =>
                                    setVisibleAnnouncements((prev) => prev + 3)
                                }
                            >
                                Show More
                            </AsyncButton>
                        </Box>
                    )}
                </Box>
                <Typography variant="h3">Catalog</Typography>

                <Box>
                    <Masonry
                        columns={columns}
                        spacing={2}
                        sx={
                            searchState.orgs.length
                                ? undefined
                                : { display: "none" }
                        }
                    >
                        {searchState.orgs.map((org, i) => {
                            return <OrgCard organization={org} key={i} />;
                        })}
                    </Masonry>
                    {searchState.more ? (
                        <div ref={loadingObserver}>
                            <Loading />
                        </div>
                    ) : (
                        <Box>
                            {approvedOrgs.length === 0 ? (
                                <Typography
                                    align="center"
                                    variant="h3"
                                    sx={{ paddingTop: "1em" }}
                                >
                                    No Organizations Found.
                                </Typography>
                            ) : (
                                <Typography align="center" variant="h3">
                                    Total of {approvedOrgs.length}{" "}
                                    {`Organization${approvedOrgs.length > 1 ? "s" : ""}`}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Catalog;
