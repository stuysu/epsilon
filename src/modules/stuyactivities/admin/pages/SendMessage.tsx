import { Box, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import OrgChat from "../components/OrgChat";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import SearchInput from "../../../../components/ui/input/SearchInput";
import Divider from "../../../../components/ui/Divider";

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
        <div className={"w-full p-4 sm:p-12 min-h-dvh flex flex-col gap-4"}>
            <h1>Send Message</h1>
            <SearchInput
                placeholder="Search Activities..."
                value={searchInput}
                onChange={(e) => setSearchInput(e)}
            />
            {searchInput.length < 3 ? (
                <p>Keep typing to find an Activity.</p>
            ) : filteredOrgs.length > 10 ? (
                <p>Too many activities, try a more specific query.</p>
            ) : filteredOrgs.length > 0 ? (
                <div>
                    {filteredOrgs.map((org) => (
                        <div>
                            <a
                                className={"important cursor-pointer"}
                                key={org.id}
                                onClick={() => {
                                    setOrgId(org.id);
                                    setOrgName(org.name);
                                    setSearchInput(""); // Clear search input after selecting an org
                                    setFilteredOrgs([]); // Clear filtered orgs after selecting an org
                                }}
                            >
                                {org.name}
                            </a>
                            <Divider />
                        </div>
                    ))}
                </div>
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
        </div>
    );
};

export default SendMessage;
