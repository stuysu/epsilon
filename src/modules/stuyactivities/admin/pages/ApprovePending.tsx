import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

import OrgApproval from "../components/OrgApproval";
import { useSnackbar } from "notistack";
import OrgBlock from "../../../../components/ui/OrgBlock";
import Divider from "../../../../components/ui/Divider";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";

const ApprovePending = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [pendingOrgs, setPendingOrgs] = useState<Partial<OrgContextType>[]>(
        [],
    );

    const [view, setView] = useState<Partial<OrgContextType>>();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchPendingOrgs = async () => {
            const { error, data } = await supabase
                .from("organizations")
                .select(
                    `
                    id,
                    name,
                    url,
                    picture,
                    mission,
                    purpose,
                    goals,
                    appointment_procedures,
                    uniqueness,
                    meeting_description,
                    meeting_schedule,
                    meeting_days,
                    keywords,
                    tags,
                    commitment_level,
                    faculty_email,
                    fair,
                    state,
                    joinable,
                    is_returning,
                    returning_info,
                    memberships (
                        id,
                        role,
                        role_name,
                        active,
                        users (
                            id,
                            first_name,
                            last_name,
                            email,
                            picture,
                            is_faculty
                        )
                    )
                `,
                )
                .eq("state", "PENDING");

            if (error || !data) {
                return enqueueSnackbar(
                    "Failed to fetch pending organizations. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            setPendingOrgs(data as Partial<OrgContextType>[]);
            setLoaded(true);
        };

        fetchPendingOrgs();
    }, []);

    if (view) {
        return (
            <OrgApproval
                {...view}
                onBack={() => setView(undefined)}
                onDecision={() => {
                    // remove self from pending orgs
                    setPendingOrgs(pendingOrgs.filter((o) => o.id !== view.id));
                    setView(undefined);
                }}
            />
        );
    }

    return (
        <div className={"w-full p-4 sm:p-12"}>
            <h1>Pending Organizations</h1>
            <Divider />
            {loaded && pendingOrgs.length === 0 && (
                <ContentUnavailable
                    icon="bx-check-circle"
                    iconColor="text-green"
                    title="No Pending Activities"
                    description="There are no new Activities waiting for approval."
                />
            )}
            <div className={"flex mt-8 gap-3 flex-wrap"}>
                {pendingOrgs.map((org) => (
                    <button
                        type="button"
                        key={org.id}
                        onClick={() => setView(org)}
                        className="rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                    >
                        <OrgBlock
                            name={org.name}
                            role_name={org.id?.toFixed()}
                            picture={org.picture || ""}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ApprovePending;
