import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import { Box, useMediaQuery, Typography, Card } from "@mui/material";
import { Masonry } from "@mui/lab";

import OrgCard from "../comps/pages/catalog/OrgCard";
import { useSnackbar } from "notistack";

import InfiniteScroll from "react-infinite-scroll-component";

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

    const isTwo = useMediaQuery("(max-width: 1525px)");
    const isTwoWrap = useMediaQuery("(max-width: 1100px)");
    const isOne = useMediaQuery("(max-width: 700px)");

    let columns = 3;
    if (isTwo) columns = 2;
    if (isOne) columns = 1;

    const getOrgs = async (isReset?: boolean) => {
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
        getOrgs(true);
    }, [seed, searchParams]);

    useEffect(() => {
        sessionStorage.setItem("seed", seed.toString());
    }, [seed]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data, error } = await supabase
                .from("announcements")
                .select("*");

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
    });

    /*
  Testing
  useEffect(() => {
    console.log(`${orgs.length} orgs!`)
    console.log(`${Object.keys(getUnique(orgs)).length} unique orgs!`);
  }, [orgs])
  */

    let approvedOrgs = searchState.orgs.filter(
        (o) => o.state !== "PENDING" && o.state !== "LOCKED",
    );

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
                    {announcements.map((announcement, i) => {
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
                                <Typography variant="body1" width="100%">
                                    {announcement.content}
                                </Typography>
                            </Card>
                        );
                    })}
                </Box>
                <Typography variant="h3">Catalog</Typography>

                <InfiniteScroll
                    dataLength={searchState.offset}
                    next={getOrgs}
                    hasMore={searchState.more}
                    loader={<Loading />}
                    endMessage={
                        <Box>
                            {approvedOrgs.length === 0 ? (
                                <Typography align="center" variant="h3">
                                    No Organizations Found.
                                </Typography>
                            ) : (
                                <Typography align="center" variant="h3">
                                    Total of {approvedOrgs.length}{" "}
                                    {`Organization${approvedOrgs.length > 1 ? "s" : ""}`}
                                </Typography>
                            )}
                        </Box>
                    }
                    style={{ overflow: "hidden", paddingTop: "20px" }}
                >
                    <Masonry columns={columns} spacing={2}>
                        {
                            searchState.orgs.length ? (
                                searchState.orgs.map((org, i) => {
                                    if (
                                        org.state === "PENDING" ||
                                        org.state === "LOCKED" ||
                                        org.state === "PUNISHED"
                                    )
                                        return <></>;
                                    return (
                                        <OrgCard organization={org} key={i} />
                                    );
                                })
                            ) : (
                                <Box></Box>
                            ) /* To make masonry resize accordingly */
                        }
                    </Masonry>
                </InfiniteScroll>
            </Box>
        </Box>
    );
};

export default Catalog;
