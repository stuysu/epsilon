import { Box, Paper, Switch, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import UserContext from "../comps/context/UserContext";
import { supabase } from "../supabaseClient";
import { enqueueSnackbar } from "notistack";
import LoginGate from "../comps/ui/LoginGate";

type Memberships = {
    id: number;
    organization_id: number;
    organization_name: string;
    allow_notifications: boolean;
};

const Settings = () => {
    const user = useContext(UserContext);
    const [memberships, setMemberships] = useState<Memberships[]>([]);

    useEffect(() => {
        const fetchMemberships = async () => {
            const { data: membershipsData, error: membershipsError } =
                await supabase
                    .from("memberships")
                    .select(`id, organization_id`)
                    .eq("user_id", user.id);

            if (membershipsError) {
                enqueueSnackbar("Failed to fetch memberships", {
                    variant: "error",
                });
                return;
            }

            if (membershipsData && membershipsData.length > 0) {
                const membershipIds = membershipsData.map((m) => m.id);
                const organizationIds = membershipsData.map(
                    (m) => m.organization_id,
                );

                const { data: notificationsData, error: notificationsError } =
                    await supabase
                        .from("membershipnotifications")
                        .select("membership_id, allow_notifications")
                        .in("membership_id", membershipIds);

                if (notificationsError) {
                    enqueueSnackbar("Failed to fetch notification settings", {
                        variant: "error",
                    });
                    return;
                }

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
                    const notification = notificationsData.find(
                        (n) => n.membership_id === membership.id,
                    );
                    const organization = organizationsData.find(
                        (org) => org.id === membership.organization_id,
                    );

                    return {
                        ...membership,
                        allow_notifications: notification
                            ? notification.allow_notifications
                            : true,
                        organization_name: organization
                            ? organization.name
                            : "Unknown",
                    };
                });

                setMemberships(mergedData);
            }
        };

        fetchMemberships();
    }, [user.id]);

    const handleToggle = async (
        membership_id: number,
        currentValue: boolean,
    ) => {
        const { error } = await supabase
            .from("membershipnotifications")
            .update({ allow_notifications: !currentValue })
            .eq("membership_id", membership_id);

        if (error) {
            enqueueSnackbar("Failed to update notification settings", {
                variant: "error",
            });
            return;
        }

        setMemberships((prevMemberships) =>
            prevMemberships.map((membership) =>
                membership.id === membership_id
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
                <Typography variant="h1" align="center" marginTop="50px">
                    Communication Options
                </Typography>
                <Typography variant="body1" align="center" marginBottom="50px">
                    Choose your preferred email communication options for each
                    organization you are a member of.
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
                        variant="body1"
                        sx={{
                            textAlign: "left",
                            width: "45%",
                        }}
                    >
                        Organization Name
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
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
                            key={membership.id}
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
                                    paddingRight: "3%",
                                }}
                            >
                                <Switch
                                    checked={membership.allow_notifications}
                                    onChange={() =>
                                        handleToggle(
                                            membership.id,
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
