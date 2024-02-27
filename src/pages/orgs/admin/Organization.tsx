import { useState, useEffect, useContext } from "react";

import { supabase } from "../../../supabaseClient";

import UserContext from "../../..//comps/context/UserContext";
import OrgContext from "../../../comps/context/OrgContext";

import OrgEditor from "../../../comps/pages/orgs/admin/OrgEditor";

const Organization = () => {
    const user = useContext(UserContext);
    const organization = useContext(OrgContext);
    const [pendingEdit, setPendingEdit] = useState<OrganizationEdit>();

    // eslint-disable-next-line
    useEffect(() => {
        const fetchEdits = async () => {
            const { data, error } = await supabase.from("organizationEdits")
                .select()
                .eq("id", organization.id)
            
            if (error) {
                return user.setMessage("Error fetching organization edits. Contact it@stuysu.org for support.");
            }

            if (data.length) {
                setPendingEdit(data[0])
            }
        }

        fetchEdits();
    // eslint-disable-next-line
    }, [])

    return (
        <div>
            <h1>Organization</h1>
            <OrgEditor organization={organization} organizationEdit={pendingEdit}/>
        </div>
    )
}

export default Organization;