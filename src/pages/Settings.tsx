import { Box, Paper, Switch, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import UserContext from "../comps/context/UserContext";
import { supabase } from "../supabaseClient";
import { enqueueSnackbar } from "notistack";
import LoginGate from "../comps/ui/LoginGate";

type Memberships = {
    organization_id: number;
    allow_notifications: boolean;
    organization_name?: string;
};

const Settings = () => {
    const user = useContext(UserContext);
    const [memberships, setMemberships] = useState<Memberships[]>([]);

    useEffect(() => {
        const fetchMemberships = async () => {
            const { data: membershipsData, error: membershipsError } =
                await supabase
                    .from("memberships")
                    .select(
                        `
                    organization_id,
                    allow_notifications
                `,
                    )
                    .eq("user_id", user.id)
                    .returns<Memberships[]>();

            if (membershipsError) {
                enqueueSnackbar("Failed to fetch memberships", {
                    variant: "error",
                });
                return;
            }

            if (membershipsData && membershipsData.length > 0) {
                const organizationIds = membershipsData.map(
                    (m) => m.organization_id,
                );

                const { data: organizationsData, error: organizationsError } =
                    await supabase
                        .from("organizations")
                        .select("id, name")
                        .in("id", organizationIds);

                if (organizationsError) {
                    enqueueSnackbar("Failed to fetch organization names", {
                        variant: "error",
                    });
                    return;
                }

                const mergedData = membershipsData.map((membership) => {
                    const organization = organizationsData.find(
                        (org) => org.id === membership.organization_id,
                    );
                    return {
                        ...membership,
                        organization_name: organization
                            ? organization.name
                            : "Unknown",
                    };
                });
                mergedData.sort((membershipA, membershipB) =>
                    membershipA.organization_name.localeCompare(
                        membershipB.organization_name,
                    ),
                );

                setMemberships(mergedData);
            }
        };

        fetchMemberships();
    }, [user.id]);

    const handleToggle = async (
        organization_id: number,
        currentValue: boolean,
    ) => {
        const { data, error } = await supabase
            .from("memberships")
            .update({ allow_notifications: !currentValue })
            .eq("organization_id", organization_id)
            .eq("user_id", user.id)
            .select();

        if (error || !data || data[0].allow_notifications !== !currentValue) {
            enqueueSnackbar("Failed to update notification settings", {
                variant: "error",
            });
            return;
        }

        setMemberships((prevMemberships) =>
            prevMemberships.map((membership) =>
                membership.organization_id === organization_id
                    ? { ...membership, allow_notifications: !currentValue }
                    : membership,
            ),
        );
        enqueueSnackbar("Notification settings updated successfully", {
            variant: "success",
        });
    };

    return (
        <LoginGate sx={{ width: "100%", paddingLeft: "20px" }}>
            <Box
                sx={{
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "30px",
                }}
            >
                <Typography variant="h1" align="center" marginBottom="50px">
                    Email Settings
                </Typography>
            </Box>

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "43%",
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: "2rem",
                            textAlign: "left",
                            width: "45%",
                        }}
                    >
                        Organization Name
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: "2rem",
                            textAlign: "right",
                            width: "45%",
                        }}
                    >
                        Allow Notifications
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "45%",
                    }}
                >
                    {memberships.map((membership) => (
                        <Paper
                            key={membership.organization_id}
                            elevation={1}
                            sx={{
                                width: "100%",
                                borderRadius: "7px",
                                marginBottom: "15px",
                                padding: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: "1.5rem",
                                    flex: 1,
                                    paddingLeft: "3%",
                                }}
                            >
                                {membership.organization_name}
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    paddingRight: "11%",
                                }}
                            >
                                <Switch
                                    checked={membership.allow_notifications}
                                    onChange={() =>
                                        handleToggle(
                                            membership.organization_id,
                                            membership.allow_notifications,
                                        )
                                    }
                                    color="primary"
                                />
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Box>
        </LoginGate>
    );
};

export default Settings;
