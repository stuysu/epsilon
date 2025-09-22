import { useContext, useEffect, useState } from "react";
import UserContext from "../../contexts/UserContext";
import { supabase } from "../../lib/supabaseClient";
import { enqueueSnackbar } from "notistack";
import LoginGate from "../../components/ui/content/LoginGate";
import Loading from "../../components/ui/content/Loading";
import Divider from "../../components/ui/Divider";
import { Switch } from "radix-ui";

type Memberships = {
    id: number;
    organization_id: number;
    organization_name: string;
    allow_notifications: boolean;
};

const CommsSettings = () => {
    const user = useContext(UserContext);
    const [memberships, setMemberships] = useState<Memberships[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemberships = async () => {
            setLoading(true);
            const { data: membershipsData, error: membershipsError } =
                await supabase
                    .from("memberships")
                    .select(`id, organization_id`)
                    .eq("user_id", user.id);

            if (membershipsError) {
                enqueueSnackbar("Failed to fetch memberships", {
                    variant: "error",
                });
                setLoading(false);
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
                    setLoading(false);
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
                    setLoading(false);
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
            setLoading(false);
        };

        fetchMemberships();
    }, [user.id]);

    if (loading) {
        return (
            <LoginGate sx={{ width: "100%", padding: "20px" }}>
                <Loading />
            </LoginGate>
        );
    }

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
        <LoginGate>
            <div className={"sm:m-12 m-6 min-h-dvh"}>
                <h1>Communications</h1>
                <p>Manage your email preferences.</p>
                <Divider />

                <div>
                    {memberships.map((membership) => (
                        <div>
                            <div
                                key={membership.id}
                                className={
                                    "flex flex-row justify-between my-4 text-typography-1"
                                }
                            >
                                <div
                                    className={
                                        "flex flex-row items-center gap-2"
                                    }
                                >
                                    <i className={"bx bx-group bx-lg"}></i>
                                    <div className={"flex flex-col gap-1 w-[60vw]"}>
                                        <h4>{membership.organization_name}</h4>
                                        <p>
                                            Activity{" "}
                                            <span className={"font-mono"}>
                                                {membership.organization_id}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <Switch.Root
                                    checked={membership.allow_notifications}
                                    onCheckedChange={() =>
                                        handleToggle(
                                            membership.id,
                                            membership.allow_notifications,
                                        )
                                    }
                                    className="relative h-6 w-11 cursor-pointer rounded-full bg-layer-3 transition-colors data-[state=checked]:bg-blue"
                                >
                                    <Switch.Thumb className="sm:hover:scale-110 block h-5 w-5 translate-x-0.5 rounded-full bg-white/90 shadow transition-transform data-[state=checked]:translate-x-[22px] ease-in-out" />
                                </Switch.Root>
                            </div>
                            <div className={"ml-14"}>
                                <Divider />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </LoginGate>
    );
};

export default CommsSettings;
