/* ORG ROUTING INFORMATION HERE */
import { useContext, useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import UserContext from "../../comps/context/UserContext";
import OrgContext from "../../comps/context/OrgContext";
import { supabase } from "../../supabaseClient";

import Overview from "./Overview";

const OrgRouter = () => {
    const user = useContext(UserContext)
    const { orgUrl } = useParams();

    const [org, setOrg] = useState<OrgContextType>({
        id: -1,
        name: "",
        url: "",
        picture: "",
        mission: "",
        purpose: "",
        benefit: "",
        appointment_procedures: "",
        uniqueness: "",
        meeting_schedule: "",
        meeting_days: [],
        commitment_level: "NONE",
        state: "PENDING",
        joinable: false,
        join_instructions: "",
        memberships: [],
        meetings: []
    });

    useEffect(() => {
        const getOrgData = async () => {
            const { data, error } = await supabase
                .from('organizations')
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
                        role,
                        role_name,
                        users (
                            first_name,
                            last_name,
                            email,
                            picture,
                            is_faculty
                        )
                    ),
                    meetings (
                        id,
                        is_public,
                        title,
                        description,
                        start_time,
                        end_time,
                        rooms (
                            id,
                            name,
                            floor
                        )
                    )
                `)
                .eq('url', orgUrl)
            
            if (error) {
                user.setMessage("Error fetching organization.");
                return;
            }

            if (data?.length === 0) {
                user.setMessage("Invalid organization URL.");
                return;
            }

            setOrg(data[0] as OrgContextType)
        }

        getOrgData();
    }, [])

    return (
        <OrgContext.Provider value={org}>
            <Routes>
                <Route path={"/"} Component={Overview} />
            </Routes>
        </OrgContext.Provider>
    )
}

export default OrgRouter;