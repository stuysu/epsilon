import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Organization = {
    id: number;
    name: string;
    purpose?: string;
    state?: string;
    tags?: string[];
    commitment_level?: string;
    meeting_days?: string[];
    picture?: string;
    url?: string;
};

type OrgListContextType = {
    orgs: Organization[] | null;
    loading: boolean;
};

const OrgListContext = createContext<OrgListContextType>({
    orgs: null,
    loading: true,
});

export const useOrgList = () => useContext(OrgListContext);

export const OrgListProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [orgs, setOrgs] = useState<Organization[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrgs = async () => {
            const { data, error } = await supabase
                .from("organizations")
                .select("*");

            if (!error && data) {
                setOrgs(data);
            }

            setLoading(false);
        };

        fetchOrgs();
    }, []);

    return (
        <OrgListContext.Provider value={{ orgs, loading }}>
            {children}
        </OrgListContext.Provider>
    );
};
