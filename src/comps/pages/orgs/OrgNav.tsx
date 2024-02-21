import { useContext } from "react";
import { Link } from "react-router-dom";

import { Box, Button } from "@mui/material";

import OrgContext from "../../context/OrgContext";
import UserContext from "../../context/UserContext";

const OrgNav = () => {
    const organization = useContext<OrgContextType>(OrgContext);
    const user = useContext<UserContextType>(UserContext)
    const main = `/${organization.url}`

    const isInOrg : boolean = organization.memberships?.find(m => m.users?.id === user.id) ? true : false;
    let isCreator = false;

    if (
        isInOrg && 
        organization.memberships?.find(m => m.users?.id === user.id)?.role === 'CREATOR'
    ) {
        isCreator = true;
    }

    let isActive = false;
    if (
        isInOrg && 
        organization.memberships?.find(m => m.users?.id === user.id)?.active
    ) {
        isActive = true;
    }

    let interactString = isInOrg ? (isActive ? "LEAVE" : "CANCEL JOIN") : "JOIN";
    const handleInteract = () => {
        if (interactString === "JOIN") {

        } else if (interactString === "LEAVE" || interactString === "CANCEL JOIN") {

        }
    }

    return (
        <div>
            <Box bgcolor="gray">
                { 
                    isCreator ? 
                        (
                            <Button disabled>LEAVE</Button>
                        ) : 
                        (
                            <Button onClick={handleInteract}>{interactString}</Button>
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
        </div>
    )
}

export default OrgNav;