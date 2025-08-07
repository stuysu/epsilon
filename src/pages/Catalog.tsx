import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { Masonry } from "@mui/lab";

import OrgCard from "../comps/pages/catalog/OrgCard";
import { useSnackbar } from "notistack";

import Loading from "../comps/ui/Loading";
import SearchFilter from "../comps/pages/catalog/SearchFilter";

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

    const [seed] = useState(
        sessionStorage.getItem("seed")
            ? parseFloat(sessionStorage.getItem("seed") as string)
            : Math.random(),
    );

    const isTwo = useMediaQuery("(max-width: 1350px)");
    const isTwoWrap = useMediaQuery("(max-width: 1000px)");
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

            const catalogQuery = `and(or(name.ilike.%${searchParams.name}%,keywords.ilike.%${searchParams.name}%)${orgReqsQuery})`;

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
                    paddingLeft: "2rem",
                    paddingRight: "2rem",
                    position: "relative",
                }}
            >
                <Box>
                    <Masonry
                        columns={columns}
                        spacing={isOne ? 0 : 2}
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
                        <div
                            ref={loadingObserver}
                            className={"bottom-16 relative right-52"}
                        >
                            <Loading />
                        </div>
                    ) : (
                        <Box>
                            {approvedOrgs.length === 0 ? (
                                <Typography
                                    align="center"
                                    variant="h3"
                                    sx={{ paddingTop: "10em", opacity: 0.7 }}
                                >
                                    <i className={"bx bx-search bx-md m-5"}></i>
                                    <br />
                                    No Results
                                </Typography>
                            ) : (
                                <Typography
                                    align="center"
                                    variant="h3"
                                    sx={{ paddingTop: "2em", opacity: 0.7 }}
                                >
                                    {approvedOrgs.length}{" "}
                                    {`Organization${approvedOrgs.length > 1 ? "s" : ""} Found`}
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
