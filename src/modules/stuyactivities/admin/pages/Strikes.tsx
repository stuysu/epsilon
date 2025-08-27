import { Box, Card, Divider, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";

const Strikes = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [orgId, setOrgId] = useState<number>();
    const [orgName, setOrgName] = useState("");
    const [orgStrikes, setOrgStrikes] = useState<Strike[]>([]);
    const [reason, setReason] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]);

    useEffect(() => {
        const fetchAllOrgs = async () => {
            const { data, error } = await supabase
                .from("organizations")
                .select("*");
            if (error || !data) {
                enqueueSnackbar(
                    "Failed to load organizations. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }
            setAllOrgs(data);
        };

        fetchAllOrgs();
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (searchInput) {
            setFilteredOrgs(
                allOrgs.filter((org) =>
                    org.name.toLowerCase().includes(searchInput.toLowerCase()),
                ),
            );
        } else {
            setFilteredOrgs([]);
        }
    }, [searchInput, allOrgs]);

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
                    organizations (name),
                    users (first_name, last_name, picture)
                `,
                )
                .eq("organization_id", orgId);

            if (error || !data) {
                return enqueueSnackbar(
                    "Failed to load strikes. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            setOrgStrikes(data as Strike[]);
        };

        fetchOrgStrikes();
    }, [orgId, enqueueSnackbar]);

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
        <div className={"w-full p-4 sm:p-12"}>
            <h1>
                Strikes
            </h1>
                <TextField
                    sx={{ width: "300px", marginTop: "1rem" }}
                    label="Search Organizations"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            {searchInput.length < 3 ? (
                <p className={"mt-3"}>
                    Keep typing to find an Activity.
                </p>
            ) : filteredOrgs.length > 20 ? (
                <p>
                    Too many activities, try a more specific query.
                </p>
            ) : filteredOrgs.length > 0 ? (
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    {filteredOrgs.map((org) => (
                        <AsyncButton
                            key={org.id}
                            onClick={() => {
                                setOrgId(org.id);
                                setOrgName(org.name);
                                setSearchInput(""); // Clear search input after selecting an org
                                setFilteredOrgs([]); // Clear filtered orgs after selecting an org
                            }}
                            sx={{ margin: "5px" }}
                        >
                            {org.name}
                        </AsyncButton>
                    ))}
                </Box>
            ) : null}
            {orgId && (
                <>
                    <div className={"my-10"}>
                        <Divider />
                    </div>
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <Box
                            sx={{
                                width: "500px",
                                display: "flex",
                                justifyContent: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            <h3>
                                Give Strike to {orgName}
                            </h3>
                            <TextField
                                sx={{ width: "100%" }}
                                label="Reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                multiline
                                rows={4}
                            />
                            <AsyncButton
                                onClick={issueStrike}
                                variant="contained"
                                sx={{ width: "100%", marginTop: "10px" }}
                            >
                                Issue
                            </AsyncButton>
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
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                                key={i}
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
                                    <AsyncButton
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
                                    </AsyncButton>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </>
            )}
        </div>
    );
};

export default Strikes;
