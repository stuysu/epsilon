import { Box } from "@mui/material"

import { useState, useEffect, useContext } from "react";

import OrgSelector from "../../comps/admin/OrgSelector";

import { supabase } from "../../supabaseClient";
import UserContext from "../../comps/context/UserContext";

const Strikes = () => {
    const user = useContext(UserContext);

    const [orgId, setOrgId] = useState<Number>();
    const [orgName, setOrgName] = useState("");
    const [orgStrikes, setOrgStrikes] = useState<Strike[]>([]);

    useEffect(() => {
        if (!orgId) return;

        const fetchOrgStrikes = async () => {
            const { data, error } = await supabase
                .from("strikes")
                .select(`
                    id,
                    reason,
                    created_at,
                    organizations (
                        name
                    ),
                    users (
                        email
                    )
                `)
                .eq('organization_id', orgId)
            
            if (error || !data) {
                return user.setMessage("Failed to load strikes. Contact it@stuysu.org for support.");
            }

            setOrgStrikes(data as Strike[]);
        }

        fetchOrgStrikes();
    }, [orgId, user])

    return (
        <Box>
            <h1>Strikes</h1>
            <OrgSelector onSelect={(orgId, orgName) => {
                setOrgId(orgId);
                setOrgName(orgName);
            }}/>
            <h1>{orgName}</h1>
            <pre>{JSON.stringify(orgStrikes, undefined, 4)}</pre>
        </Box>
    )
}

export default Strikes;