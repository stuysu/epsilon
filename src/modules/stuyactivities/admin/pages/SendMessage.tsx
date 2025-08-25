import { Box, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import OrgChat from "../components/OrgChat";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";

const SendMessage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [orgId, setOrgId] = useState<number>();
    const [orgName, setOrgName] = useState("");
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
                    "Failed to load organizations. Contact support.",
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

    return (
        <Box minHeight={"70vh"}>
            <Typography variant="h1" align="center">
                Send Message
            </Typography>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                }}
            >
                <TextField
                    sx={{ width: "300px" }}
                    label="Search Organizations"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </Box>
            {searchInput.length < 3 ? (
                <Typography align="center" sx={{ mt: 2 }}>
                    Keep typing to find an Activity.
                </Typography>
            ) : filteredOrgs.length > 20 ? (
                <Typography align="center" sx={{ mt: 2 }}>
                    Too many activities, try a more specific query.
                </Typography>
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
            <Box
                sx={{
                    marginTop: "20px",
                    width: "100%",
                    justifyContent: "center",
                    padding: "20px",
                }}
            >
                {orgId && <OrgChat organization_id={orgId} />}
            </Box>
        </Box>
    );
};

export default SendMessage;
