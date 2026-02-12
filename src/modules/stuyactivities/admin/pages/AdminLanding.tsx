import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";
import AdminOrgSelector from "../components/AdminOrgSelector";
import { useAdminOrg } from "../AdminOrgContext";

type AdminActionCardProps = {
    title: string;
    description: string;
    icon: string;
    iconColorClass: string;
    count?: number | string;
    onClick?: () => void;
    disabled?: boolean;
};

const AdminActionCard = ({
    title,
    description,
    icon,
    iconColorClass,
    count,
    onClick,
    disabled = false,
}: AdminActionCardProps) => {
    const isDisabled = disabled || !onClick;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            className={`relative w-full rounded-xl bg-layer-1 px-5 py-4 text-left shadow-control transition ${
                isDisabled
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-layer-2"
            }`}
        >
            <div className="flex items-center gap-5">
                <i className={`bx ${icon} ${iconColorClass} bx-md`} />
                <div className="flex flex-col -mt-1">
                    <div className="flex items-center gap-2">
                        <h3>
                            {title}
                        </h3>
                        {count !== undefined && (
                            <p className="rounded-full px-3 py-1 bg-layer-2 important text-typography-1">
                                {count}
                            </p>
                        )}
                    </div>
                    <p>
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
};

const AdminLanding = () => {
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState<number | null>(null);
    const [editCount, setEditCount] = useState<number | null>(null);
    const { selectedOrg } = useAdminOrg();

    useEffect(() => {
        const fetchCounts = async () => {
            const { count: pending } = await supabase
                .from("organizations")
                .select("id", { count: "exact", head: true })
                .eq("state", "PENDING");

            const { count: edits } = await supabase
                .from("organizationedits")
                .select("id", { count: "exact", head: true });

            setPendingCount(pending ?? 0);
            setEditCount(edits ?? 0);
        };

        fetchCounts();
    }, []);

    return (
        <div className="flex w-full justify-center px-6 pb-20 pt-12 sm:px-10">
            <div className="w-full max-w-4xl">
                <div className="relative mb-10 flex h-40 items-center justify-center">
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-lineSeparator opacity-40" />
                    <div className="relative flex h-48 w-48 items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-bg z-1 blur-xl" />
                        <i className="bx bx-shield bx-lg text-beige z-10" />
                    </div>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className={"text-typography-1"}>
                            Activity Moderation
                        </h2>
                        <div className="mt-5 flex flex-col gap-4">
                            <AdminOrgSelector />
                            <div className="flex flex-col gap-4">
                                <AdminActionCard
                                    title="Messaging"
                                    description="Send messages privately to Activity administrators"
                                    icon="bx-message"
                                    iconColorClass="text-blue"
                                    onClick={() => navigate("/admin/send-message")}
                                    disabled={!selectedOrg}
                                />
                                <AdminActionCard
                                    title="Strikes"
                                    description="Issue strikes and review punishment history"
                                    icon="bx-flag"
                                    iconColorClass="text-red"
                                    onClick={() => navigate("/admin/strikes")}
                                    disabled={!selectedOrg}
                                />
                                <AdminActionCard
                                    title="Reservations"
                                    description="Reserve meetings for an Activity"
                                    icon="bx-calendar-check"
                                    iconColorClass="text-yellow"
                                    onClick={() => navigate("/admin/reserve")}
                                    disabled={!selectedOrg}
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={"text-typography-1"}>General Tools</h2>
                        <div className="mt-5 flex flex-col gap-4">
                            <AdminActionCard
                                title="Active Interventions (Coming Soon)"
                                description="Review current reports of Activities"
                                icon="bx-error"
                                iconColorClass="text-yellow"
                                count={0}
                                disabled
                            />
                            <AdminActionCard
                                title="New Activities"
                                description="Review and approve or deny pending Activities"
                                icon="bx-carousel"
                                iconColorClass="text-green"
                                count={pendingCount ?? "—"}
                                onClick={() =>
                                    navigate("/admin/approve-pending")
                                }
                            />
                            <AdminActionCard
                                title="Approve Edits"
                                description="Review and approve or deny pending edits to existing Charters"
                                icon="bx-edit-alt"
                                iconColorClass="text-green"
                                count={editCount ?? "—"}
                                onClick={() => navigate("/admin/approve-edit")}
                            />
                            <AdminActionCard
                                title="StuyActivities Announcements"
                                description="Create homepage announcements for all users"
                                icon="bx-news"
                                iconColorClass="text-blue"
                                onClick={() => navigate("/admin/announcements")}
                            />
                            <AdminActionCard
                                title="To-Do Item (Coming Soon)"
                                description="Create a homepage to-do item for all users"
                                icon="bx-calendar-exclamation"
                                iconColorClass="text-blue"
                                disabled
                            />
                            <AdminActionCard
                                title="New User"
                                description="Add a new user to the Epsilon Registry"
                                icon="bx-user-plus"
                                iconColorClass="text-yellow"
                                onClick={() => navigate("/admin/add-user")}
                            />
                            <AdminActionCard
                                title="Room Registry"
                                description="Manage rooms available for meetings"
                                icon="bx-door-open"
                                iconColorClass="text-beige"
                                onClick={() => navigate("/admin/rooms")}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminLanding;
