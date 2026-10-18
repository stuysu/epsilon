import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useMembershipJoinDates(
    organizationId: number,
    memberCount: number,
) {
    const [joinDates, setJoinDates] = useState<Map<number, string>>(new Map());

    useEffect(() => {
        if (organizationId < 0) return;

        let cancelled = false;

        supabase
            .from("memberships")
            .select("id, created_at")
            .eq("organization_id", organizationId)
            .then(({ data }) => {
                if (cancelled || !data) return;
                setJoinDates(new Map(data.map((m) => [m.id, m.created_at])));
            });

        return () => {
            cancelled = true;
        };
    }, [organizationId, memberCount]);

    return joinDates;
}
