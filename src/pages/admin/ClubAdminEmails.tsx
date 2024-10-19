import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Box, TextField, Typography } from "@mui/material";
import AsyncButton from "../../comps/ui/AsyncButton";
import UserContext from "../../comps/context/UserContext";

const ClubAdminEmails = () => {
    const { enqueueSnackbar } = useSnackbar();

    const user = useContext(UserContext);

    const [orgId, setOrgId] = useState<number>();
    const [orgName, setOrgName] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
    const [currentOrganization, setCurrentOrganization] =
        useState<Organization>();
    const [adminEmails, setAdminEmails] = useState<string>("");

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

    // useEffect(() => {
    //     if(currentOrganization) {
    //         const emails = currentOrganization?.memberships
    //             ?.filter((membership) => membership.role === "ADMIN" || membership.role === "CREATOR")
    //             .map((membership) => membership.users?.email)
    //             .join(", ");

    //         setAdminEmails(emails || "");
    //     }
    // }, [currentOrganization]);

    useEffect(() => {
        const fetchAdminEmails = async () => {
            const { data: memberships, error: membershipsError } =
                await supabase
                    .from("memberships")
                    .select("user_id")
                    .eq("organization_id", currentOrganization?.id)
                    .in("role", ["ADMIN", "CREATOR"]);

            if (membershipsError) {
                enqueueSnackbar(
                    "Error fetching memberships. Please try again later.",
                    { variant: "error" },
                );
                return;
            }
            const userIds = memberships.map((membership) => membership.user_id);

            const { data: users, error: usersError } = await supabase
                .from("users")
                .select("email")
                .in("id", userIds);

            if (usersError) {
                console.error("Error fetching users:", { variant: "error" });
                return;
            }

            const adminEmails = users.map((user) => user.email).join(", ");
            setAdminEmails(adminEmails);
        };
        if (currentOrganization) {
            fetchAdminEmails();
        }
    }, [currentOrganization]);

    return (
        <Box>
            <Typography variant="h1" align="center">
                Club Admin Emails
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
            {filteredOrgs.length > 0 && (
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
                                setCurrentOrganization(org);
                                setSearchInput("");
                                setFilteredOrgs([]);
                            }}
                            sx={{ margin: "5px" }}
                        >
                            {org.name}
                        </AsyncButton>
                    ))}
                </Box>
            )}
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
                                width: "100%",
                                display: "flex",
                                flexWrap: "nowrap",
                                alignItems: "center",
                                paddingLeft: "16px",
                                paddingRight: "16px",
                                marginLeft: "4em",
                                marginRight: "4em",
                            }}
                        >
                            <Box
                                sx={{
                                    paddingTop: "8px",
                                    paddingBottom: "8px",
                                    width: "100%",
                                }}
                            >
                                <TextField
                                    disabled
                                    fullWidth
                                    value={adminEmails}
                                    variant="outlined"
                                />
                            </Box>
                            <Box sx={{ paddingLeft: "16px", width: "100px" }}>
                                <AsyncButton
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(
                                                adminEmails,
                                            );
                                            enqueueSnackbar(
                                                "Copied emails to clipboard!",
                                                {
                                                    variant: "success",
                                                },
                                            );
                                        } catch (error) {
                                            enqueueSnackbar(
                                                "Failed to copy emails to clipboard. :( Try manually copying from the page.",
                                                { variant: "error" },
                                            );
                                        }
                                    }}
                                    variant="contained"
                                >
                                    Copy
                                </AsyncButton>
                            </Box>
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ClubAdminEmails;
