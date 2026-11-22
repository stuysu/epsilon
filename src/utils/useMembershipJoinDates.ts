import { supabase } from "../lib/supabaseClient";
import useCachedQuery, { unwrap } from "../lib/useCachedQuery";

const empty = new Map<number, string>();

// shared by the member and attendance pages; a new member changes the key
export default function useMembershipJoinDates(
    organizationId: number,
    memberCount: number,
) {
    const { data } = useCachedQuery(
        organizationId < 0 ? null : ["joinDates", organizationId, memberCount],
        async () => {
            const rows = unwrap(
                await supabase
                    .from("memberships")
                    .select("id, created_at")
                    .eq("organization_id", organizationId),
            );
            return new Map(rows.map((m) => [m.id, m.created_at]));
        },
    );
    return data ?? empty;
}
