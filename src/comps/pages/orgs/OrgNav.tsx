import { useContext } from "react";
import { Link } from "react-router-dom";

import OrgContext from "../../context/OrgContext";

const OrgNav = () => {
    const organization = useContext<OrgContextType>(OrgContext);
    const main = `/${organization.url}`

    return (
        <div>
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