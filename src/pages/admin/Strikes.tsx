import {
    Box,
    TextField,
    Button,
    Typography,
    Card,
    useMediaQuery,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";

import { supabase } from "../../supabaseClient";
import OrgSelector from "../../comps/admin/OrgSelector";
import SearchFilter from "../../comps/pages/catalog/SearchFilter";

const querySize = 10;

type SearchState = {
    orgs: Partial<Organization>[];
    offset: number;
    more: boolean;
};

const Strikes = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [orgId, setOrgId] = useState<number>();
    const [orgName, setOrgName] = useState("");
    const [orgStrikes, setOrgStrikes] = useState<Strike[]>([]);

    const [reason, setReason] = useState("");

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

    const isTwo = useMediaQuery("(max-width: 1525px)");
    const isTwoWrap = useMediaQuery("(max-width: 1100px)");
    const isOne = useMediaQuery("(max-width: 700px)");

    let columns = 3;
    if (isTwo) columns = 2;
    if (isOne) columns = 1;

    useEffect(() => {
        if (!orgId) return;

        const fetchOrgStrikes = async () => {
            const { data, error } = await supabase
                .from("strikes")
                .select(
                    `
                    id,
                    reason,
                    created_at,
                    organizations (
                        name
                    ),
                    users (
                        first_name,
                        last_name,
                        picture
                    )
                    `,
                )
                .eq("organization_id", orgId);

            if (error || !data) {
                enqueueSnackbar(
                    "Failed to load strikes. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }

            setOrgStrikes(data as Strike[]);
        };

        fetchOrgStrikes();
    }, [orgId, enqueueSnackbar]);

    useEffect(() => {
        getOrgs(true);
    }, [searchParams]);

    const getOrgs = async (isReset?: boolean) => {
        const originalOffset = isReset ? 0 : searchState.offset;

        let orgData, orgError;

        if (
            !searchParams.name.length &&
            !searchParams.meetingDays.length &&
            !searchParams.commitmentLevels.length &&
            !searchParams.tags.length
        ) {
            // get orgs in random order (no search params)
            ({ data: orgData, error: orgError } = await supabase
                .from("organizations")
                .select("*")
                .order("name", { ascending: true })
                .range(originalOffset, originalOffset + querySize - 1));
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

    const issueStrike = async () => {
        const { data, error } = await supabase.functions.invoke(
            "issue-strike",
            {
                body: {
                    organization_id: orgId,
                    reason,
                },
            },
        );

        if (error) {
            enqueueSnackbar(
                "Error issuing strike. Contact it@stuysu.org for support",
                { variant: "error" },
            );
            return;
        }

        setOrgStrikes([...orgStrikes, data as Strike]);
        enqueueSnackbar("Strike issued!", { variant: "success" });
        setReason("");
    };

    return (
        <Box>
            <Typography variant="h1" align="center">
                Strikes
            </Typography>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                }}
            >
                <OrgSelector
                    onSelect={(orgId, orgName) => {
                        setReason("");
                        setOrgId(orgId);
                        setOrgName(orgName);
                    }}
                />
            </Box>

            {orgId && (
                <>
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <Typography variant="h2" width="100%" align="center">
                            Org: {orgName}
                        </Typography>
                        <Box
                            sx={{
                                width: "500px",
                                display: "flex",
                                justifyContent: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            <Typography variant="h3" width="100%">
                                Give Strike
                            </Typography>
                            <TextField
                                sx={{ width: "100%" }}
                                label="Reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                multiline
                                rows={4}
                            />
                            <Button
                                onClick={issueStrike}
                                variant="contained"
                                sx={{ width: "100%", marginTop: "10px" }}
                            >
                                Issue
                            </Button>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            marginTop: "10px",
                            width: "100%",
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        {orgStrikes.map((strike, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Card
                                    sx={{
                                        width: "500px",
                                        padding: "20px",
                                        marginTop: "10px",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <Typography variant="h2">
                                        {strike.reason}
                                    </Typography>
                                    <Typography variant="body1">
                                        Issued by {strike.users?.first_name}{" "}
                                        {strike.users?.last_name}
                                    </Typography>
                                    <Button
                                        onClick={async () => {
                                            const { error } = await supabase
                                                .from("strikes")
                                                .delete()
                                                .eq("id", strike.id);

                                            if (error) {
                                                enqueueSnackbar(
                                                    "Error deleting strike. Contact it@stuysu.org for support",
                                                    { variant: "error" },
                                                );
                                            }

                                            setOrgStrikes(
                                                orgStrikes.filter(
                                                    (s) => s.id !== strike.id,
                                                ),
                                            );
                                            enqueueSnackbar("Strike deleted!", {
                                                variant: "success",
                                            });
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </>
            )}

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                }}
            >
                <SearchFilter
                    value={searchParams}
                    onChange={setSearchParams}
                    isOneColumn={isOne}
                    isTwoColumn={isTwo}
                    isTwoWrap={isTwoWrap}
                />
            </Box>

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                }}
            >
                {searchState.orgs.map((org) => (
                    <Typography key={org.id} variant="body1">
                        {org.name}
                    </Typography>
                ))}
            </Box>
        </Box>
    );
};

export default Strikes;
