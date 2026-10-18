import { useSnackbar } from "notistack";
import { useCallback, useEffect, useState } from "react";

import { supabase } from "../../../../lib/supabaseClient";

type Grant = {
    organization_id: number;
    organizations: { name: string } | null;
};

type OrgResult = {
    id: number;
    name: string;
};

const RoomGrants = ({
    roomId,
    roomName,
}: {
    roomId: number;
    roomName?: string;
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [grants, setGrants] = useState<Grant[]>([]);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<OrgResult[]>([]);

    const fetchGrants = useCallback(async () => {
        const { data, error } = await supabase
            .from("room_grants")
            .select("organization_id, organizations ( name )")
            .eq("room_id", roomId)
            .returns<Grant[]>();

        if (error || !data) {
            enqueueSnackbar("Failed to load room clubs", { variant: "error" });
            return;
        }

        setGrants(data);
    }, [roomId, enqueueSnackbar]);

    useEffect(() => {
        fetchGrants();
    }, [fetchGrants]);

    useEffect(() => {
        const term = search.trim();
        if (!term) {
            setResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            const { data } = await supabase
                .from("organizations")
                .select("id, name")
                .ilike("name", `%${term.replace(/[%_,()]/g, "")}%`)
                .order("name")
                .limit(6)
                .returns<OrgResult[]>();
            setResults(data || []);
        }, 200);

        return () => clearTimeout(timeout);
    }, [search]);

    const addGrant = async (org: OrgResult) => {
        const { error } = await supabase
            .from("room_grants")
            .insert({ room_id: roomId, organization_id: org.id });

        if (error) {
            enqueueSnackbar("Failed to add club", { variant: "error" });
            return;
        }

        enqueueSnackbar(`Bound ${org.name} to room ${roomName}`, {
            variant: "success",
        });
        setSearch("");
        setResults([]);
        fetchGrants();
    };

    const removeGrant = async (organizationId: number, orgName?: string) => {
        const { error } = await supabase
            .from("room_grants")
            .delete()
            .eq("room_id", roomId)
            .eq("organization_id", organizationId);

        if (error) {
            enqueueSnackbar("Failed to remove club", { variant: "error" });
            return;
        }

        enqueueSnackbar(`Unbound ${orgName} from room ${roomName}`, {
            variant: "success",
        });
        fetchGrants();
    };

    const granted = new Set(grants.map((grant) => grant.organization_id));

    return (
        <div className="flex flex-col gap-2 pl-2 pt-1 pb-1">
            <p className="text-sm text-typography-2">Special Access</p>
            <div className="flex flex-wrap gap-2">
                {grants.map((grant) => (
                    <button
                        key={grant.organization_id}
                        aria-label={`Remove ${grant.organizations?.name}`}
                        className="text-sm text-typography-2 bg-layer-2 shadow-control rounded-lg px-3 py-1 sm:hover:bg-layer-3"
                        onClick={() =>
                            removeGrant(
                                grant.organization_id,
                                grant.organizations?.name,
                            )
                        }
                    >
                        {grant.organizations?.name}
                        <i className="bx bx-x ml-1 align-middle" />
                    </button>
                ))}
            </div>
            <div className="relative w-72">
                <input
                    value={search}
                    className="text text-typography-1 w-full rounded-md px-3 h-9 bg-layer-1 outline-none"
                    placeholder="Add a club"
                    onChange={(e) => setSearch(e.target.value)}
                />
                {results.length > 0 && (
                    <div className="absolute z-30 mt-1 w-full rounded-md bg-bg border border-divider shadow-lg overflow-hidden">
                        {results
                            .filter((org) => !granted.has(org.id))
                            .map((org) => (
                                <button
                                    key={org.id}
                                    className="block w-full text-left px-3 py-2 text-sm sm:hover:bg-layer-3"
                                    onClick={() => addGrant(org)}
                                >
                                    {org.name}
                                </button>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomGrants;
