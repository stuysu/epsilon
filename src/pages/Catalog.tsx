import { useEffect, useContext, useState } from "react";
import { supabase } from "../supabaseClient";
import UserContext from "../comps/context/UserContext";

import OrgCard from "../comps/pages/catalog/OrgCard"

const Catalog = () => {
    const user = useContext(UserContext)
    const [orgs, setOrgs] = useState<Partial<Organization>[]>([])

    useEffect(() => {
        const getOrgs = async () => {
            const { data, error } = await supabase
                    .from('organizations')
                    .select(`
                        id,
                        name,
                        url,
                        picture,
                        mission,
                        state
                    `)

            if (error) {
                user.setMessage("Error fetching organizations.")
                return;
            }

            setOrgs(data)
        }
        getOrgs()
    }, [user])

    return (
        <div>
            <h1>Catalog!</h1>
            <div>
                {
                    orgs.map(
                        (org, i) => {
                            if (org.state === "PENDING" || org.state === "LOCKED") return;
                            return <OrgCard organization={org} key={i} />
                        }
                    )
                }
            </div>
        </div>
    )
}

export default Catalog;