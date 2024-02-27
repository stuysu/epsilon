import { Link } from "react-router-dom";

import { useContext } from "react";

import OrgContext from "../../../context/OrgContext";

import { Box } from "@mui/material";

const OrgAdminNav = () => {
    const organization = useContext<OrgContextType>(OrgContext);
    const main = `/${organization.url}/admin`

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'nowrap', width: '80%', marginLeft: '20%' }}>
            <Link to={`${main}/members`}>Members</Link>
            <Link to={`${main}/member-requests`}>Member Requests</Link>
            <Link to={`${main}/meetings`}>Meetings</Link>
            <Link to={`${main}/posts`}>Posts</Link>
            <Link to={`${main}/strikes`}>Strikes</Link>
            <Link to={`${main}/org-edits`}>Organization Edits</Link>
        </Box>
    )
}

export default OrgAdminNav;