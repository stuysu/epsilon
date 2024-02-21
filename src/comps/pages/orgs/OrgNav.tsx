import { Fragment, useContext } from "react";
import { Link } from "react-router-dom";

import { Box, Button } from "@mui/material";

import OrgContext from "../../context/OrgContext";
import UserContext from "../../context/UserContext";

import { supabase } from "../../../supabaseClient";

const OrgNav = () => {
    const organization = useContext<OrgContextType>(OrgContext);
    const user = useContext<UserContextType>(UserContext)
    const main = `/${organization.url}`

    const isInOrg : boolean = organization.memberships?.find(m => m.users?.id === user.id) ? true : false;
    let isCreator = false;
    let isAdmin = false;
    let isActive = false;

    /* CHECK IF CREATOR */
    if (
        isInOrg && 
        organization.memberships?.find(m => m.users?.id === user.id)?.role === 'CREATOR'
    ) {
        isCreator = true;
        isAdmin = true;
    }

    /* CHECK IF ADMIN */
    if (
        isInOrg &&
        organization.memberships?.find(m => m.users?.id === user.id)?.role === 'ADMIN'
    ) {
        isAdmin = true;
    }

    /* CHECK IF MEMBERSHIP IS ACTIVE */
    if (
        isInOrg && 
        organization.memberships?.find(m => m.users?.id === user.id)?.active
    ) {
        isActive = true;
    }

    /* Button on OrgNav that changes depending on the user */
    let interactString = isInOrg ? (isActive ? "LEAVE" : "CANCEL JOIN") : "JOIN";
    const handleInteract = async () => {
        if (interactString === "JOIN") {
            /* JOIN ORGANIZATION */
            const { error } = await supabase
                .from('memberships')
                .insert({ organization_id: organization.id, user_id: user.id });
            if (error) {
                return user.setMessage("Unable to join organization. Contact it@stuysu.org for support.");
            }
            
            user.setMessage("Sent organization a join request!")
        } else if (interactString === "LEAVE" || interactString === "CANCEL JOIN") {
            /* LEAVE ORGANIZATION */
            let membership = organization.memberships?.find(m => m.users?.id === user.id)

            const { error } = await supabase
                .from('memberships')
                .delete()
                .eq('id', membership?.id)
            if (error) {
                return user.setMessage("Unable to leave organization. Contact it@stuysu.org for support.");
            }
            
            user.setMessage("Left organization!")
        }
    }

    return (
        <div>
            <Box bgcolor="gray">
                { 
                    isCreator ? 
                        (
                            <Button variant="contained" disabled>LEAVE</Button>
                        ) : 
                        (
                            <Button variant="contained" onClick={handleInteract}>{interactString}</Button>
                        )
                }
            </Box>
            
            <br />
            <Link to={main}>Overview</Link>
            <br />
            <Link to={`${main}/charter`}>Charter</Link>
            <br />
            <Link to={`${main}/meetings`}>Meetings</Link>
            <br />
            <Link to={`${main}/members`}>Members</Link>
            <br/>
            {
                isAdmin ? 
                (<Link to={`${main}/admin`}>Admin</Link>)
                :
                (<Fragment></Fragment>)
            }
        </div>
    )
}

export default OrgNav;