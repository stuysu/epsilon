import React, {
    ReactNode,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";
import UserContext from "./UserContext";
import { supabase } from "../lib/supabaseClient";
import useLiveRefresh from "../utils/useLiveRefresh";

export type PendingInvite = {
    id: number;
    created_at: string;
    organizations: Pick<Organization, "id" | "name" | "url" | "picture">;
    inviter: Pick<User, "first_name" | "last_name"> | null;
};

type InvitesContextType = {
    invites: PendingInvite[];
    refresh: () => Promise<void>;
};

export const InvitesContext = React.createContext<InvitesContextType>({
    invites: [],
    refresh: async () => {},
});

export const useInvites = () => useContext(InvitesContext);

const InvitesProvider = ({ children }: { children: ReactNode }) => {
    const user = useContext<UserContextType>(UserContext);
    const [invites, setInvites] = useState<PendingInvite[]>([]);
    /* only the latest request may set invites, so a slow older one can't undo a decline or sign-out */
    const latest = useRef(0);

    const refresh = useCallback(async () => {
        const request = ++latest.current;
        if (!user.signed_in || user.id < 0) {
            setInvites((current) => (current.length ? [] : current));
            return;
        }

        // admins can also read their club's invites, so filter to the user's own
        const { data, error } = await supabase
            .from("organization_invites")
            .select(
                "id, created_at, organizations (id, name, url, picture), inviter:users!organization_invites_invited_by_fkey (first_name, last_name)",
            )
            .eq("user_id", user.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .returns<PendingInvite[]>();

        if (request === latest.current && !error && data) setInvites(data);
    }, [user.signed_in, user.id]);

    /* new invites show up without a reload; the invites page checks more often */
    useLiveRefresh(refresh, 60000);

    return (
        <InvitesContext.Provider value={{ invites, refresh }}>
            {children}
        </InvitesContext.Provider>
    );
};

export default InvitesProvider;
