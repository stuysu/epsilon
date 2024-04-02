import { useContext, useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import OrgEditApproval from "../../comps/admin/OrgEditApproval";

import UserContext from "../../comps/context/UserContext";

import { supabase } from "../../supabaseClient";

const ApproveEdit = () => {
    const user = useContext(UserContext);
    const [pendingEdits, setPendingEdits] = useState<EditType[]>([])
    const [view, setView] = useState<EditType>();

    useEffect(() => {
        const fetchPendingEdits = async () => {
            let pEdits : EditType[] = [];
            
            let { data, error } = await supabase
                .from('organizationedits')
                .select()
            
            if (error || !data) {
                return user.setMessage("Failed to fetch pending edits. Contact it@stuysu.org for support.")
            }

            let orgIds = [];
            for (let edit of (data as OrganizationEdit[]) ) {
                orgIds.push(edit.organization_id)
            }

            /* get name and picture from corresponding organization */
            let { data: odata, error: oerror } = await supabase
                .from('organizations')
                .select(`
                    id,
                    name,
                    picture
                `)
                .in('id', orgIds)
            
            if (oerror || !odata) {
                return user.setMessage("Failed to fetch corresponding org data. Contact it@stuysu.org for support.")
            }

            for (let edit of (data as OrganizationEdit[])) {
                let meta = odata.find(o => o.id === edit.organization_id);
                if (!meta) {
                    meta = {
                        id: edit.organization_id,
                        name: `Invalid Organization ID: ${edit.organization_id}`,
                        picture: ""
                    }
                }

                pEdits.push({
                    ...edit,
                    organization_name: meta.name,
                    organization_picture: meta.picture
                })
            }

            setPendingEdits(pEdits)
        }

        fetchPendingEdits()
    }, [user])

    if (view) {
        return (
            <OrgEditApproval 
                {...view} 
                onBack={() => setView(undefined)}
                onApprove={() => {
                    // remove self from pending edits
                    setPendingEdits(pendingEdits.filter(e => e.id !== view.id))
                    setView(undefined)
                }} 
            />
        )
    }

    return (
        <div>
            <h1>Approve Edits</h1>
            {
                pendingEdits.map((edit, i) => {
                    return (
                        <Box key={i}>
                            {edit.organization_name || "NO NAME"}
                            <Button variant="contained" onClick={() => setView(edit)}>View</Button>
                        </Box>
                    )
                })
            }
        </div>
    )
}

export default ApproveEdit;