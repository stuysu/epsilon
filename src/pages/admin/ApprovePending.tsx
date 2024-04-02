import { useEffect, useState, useContext } from "react"
import { supabase } from "../../supabaseClient"
import UserContext from "../../comps/context/UserContext";
import { Button } from "@mui/material";

import OrgApproval from "../../comps/admin/OrgApproval";

const ApprovePending = () => {
    const user = useContext(UserContext);
    const [pendingOrgs, setPendingOrgs] = useState<Partial<OrgContextType>[]>([]);

    const [view, setView] = useState<Partial<OrgContextType>>()

    useEffect(() => {
        const fetchPendingOrgs = async () => {
            const { error, data } = await supabase
                .from("organizations")
                .select(`
                    id,
                    name,
                    url,
                    picture,
                    mission,
                    purpose,
                    benefit,
                    appointment_procedures,
                    uniqueness,
                    meeting_schedule,
                    meeting_days,
                    commitment_level,
                    state,
                    joinable,
                    join_instructions,
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
                `)
                .eq('state', 'PENDING')
            
            if (error || !data) {
                return user.setMessage("Failed to fetch pending organizations. Contact it@stuysu.org for support.")
            }

            setPendingOrgs(data as Partial<OrgContextType>[])
        }

        fetchPendingOrgs()
    }, [user])

    if (view) {
        return (
            <OrgApproval 
                {...view} 
                onBack={() => setView(undefined)} 
                onApprove={() => {
                    // remove self from pending orgs
                    setPendingOrgs(pendingOrgs.filter(o => o.id !== view.id))
                    setView(undefined);
                }}
            />
        )
    }

    return (
        <div>
            <h1>Org Approvals</h1>
            <div>
                {pendingOrgs.map(
                    (org, i) => (
                        <div key={i}>
                            {org.name || "NO NAME"}
                            <Button variant="contained" onClick={() => setView(org)}>View</Button>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

export default ApprovePending;