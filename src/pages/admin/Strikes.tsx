import { Box, TextField, Button } from "@mui/material";

import { useState, useEffect } from "react";

import OrgSelector from "../../comps/admin/OrgSelector";

import { supabase } from "../../supabaseClient";
import { useSnackbar } from "notistack";

const Strikes = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [orgId, setOrgId] = useState<Number>();
    const [orgName, setOrgName] = useState("");
    const [orgStrikes, setOrgStrikes] = useState<Strike[]>([]);

    const [reason, setReason] = useState("");

    useEffect(() => {
        if (!orgId) return;

        const fetchOrgStrikes = async () => {
            const { data, error } = await supabase
                .from("strikes")
                .select(
                    `
                    id,
                    reason,
                    created_at,
                    organizations (
                        name
                    ),
                    users (
                        first_name,
                        last_name,
                        picture
                    )
                `,
                )
                .eq("organization_id", orgId);

            if (error || !data) {
                return enqueueSnackbar(
                    "Failed to load strikes. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            setOrgStrikes(data as Strike[]);
        };

        fetchOrgStrikes();
    }, [orgId]);

    const issueStrike = async () => {
        const { data, error } = await supabase.functions.invoke(
            "issue-strike", 
            {
                body: { 
                    organization_id: orgId,
                    reason  
                }
            }
        )

        if (error) {
            enqueueSnackbar(
                "Error issuing strike. Contact it@stuysu.org for support",
                { variant: "error" }
            );
            return;
        }

        setOrgStrikes([...orgStrikes, data as Strike]);
        enqueueSnackbar("Strike issued!", { variant: "success" });
        setReason("");
    }

    return (
        <Box>
            <h1>Strikes</h1>
            <OrgSelector
                onSelect={(orgId, orgName) => {
                    setReason("");
                    setOrgId(orgId);
                    setOrgName(orgName);
                }}
            />
            <h1>{orgName}</h1>
            {
                orgId && (
                    <>
                        <Box>
                            <h1>Give Strike</h1>
                            <TextField label="Reason" value={reason} onChange={e => setReason(e.target.value)} />
                            <Button onClick={issueStrike}>Issue</Button>
                        </Box>

                        <Box>
                            {
                                orgStrikes.map((strike, i) => (
                                    <Box key={i}>
                                        <h2>{strike.reason}</h2>
                                        <p>Issued by {strike.users?.first_name} {strike.users?.last_name}</p>
                                        <Button onClick={async () => {
                                            const { error } = await supabase
                                                .from("strikes")
                                                .delete()
                                                .eq("id", strike.id);

                                            if (error) {
                                                enqueueSnackbar(
                                                    "Error deleting strike. Contact it@stuysu.org for support",
                                                    { variant: "error" }
                                                )
                                            }

                                            setOrgStrikes(orgStrikes.filter(s => s.id !== strike.id));
                                            enqueueSnackbar("Strike deleted!", { variant: "success" });
                                        }}>Delete</Button>
                                    </Box>
                                ))
                            }
                        </Box>
                    </>
                )
            }
        </Box>
    );
};

export default Strikes;
