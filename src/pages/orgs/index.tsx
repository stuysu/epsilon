/* ORG ROUTING INFORMATION HERE */
import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import UserContext from "../../comps/context/UserContext";
import OrgContext from "../../comps/context/OrgContext";
import { supabase } from "../../supabaseClient";

import OrgNav from "../../comps/pages/orgs/OrgNav";

import Overview from "./Overview";
import Charter from "./Charter";
import Meetings from "./Meetings";
import Members from "./Members";
import OrgAdminRouter from "./admin";

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
    }, [orgUrl, user])

    return (
        <OrgContext.Provider value={org}>
            {
                org.id === -1 ? 
                (<div></div>) : /* ORG DOESN'T EXIST HERE */
                (
                    <React.Fragment>
                        <OrgNav />
                        <Routes>
                            <Route path={`/`} Component={Overview} />
                            <Route path={`/charter`} Component={Charter} />
                            <Route path={`/meetings`} Component={Meetings} />
                            <Route path={`/members`} Component={Members} />
                            <Route path={`/admin/*`} Component={OrgAdminRouter} />
                        </Routes>
                    </React.Fragment>
                )
            }
        </OrgContext.Provider>
    )
}

export default OrgRouter;