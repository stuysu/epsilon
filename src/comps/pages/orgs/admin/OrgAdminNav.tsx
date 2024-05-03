import { useNavigate } from "react-router-dom";

import { useContext, useState } from "react";

import OrgContext from "../../../context/OrgContext";

import { List, ListItemButton, ListItemText } from "@mui/material";
import RouteTabs from "../../../ui/RouteTabs";

const OrgAdminNav = () => {
    const organization = useContext<OrgContextType>(OrgContext);
    const main = `/${organization.url}/admin`;
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);

    let navLinks = [
        {
            to: `${main}/members`,
            label: "Members",
        },
        {
            to: `${main}/member-requests`,
            label: "Member Requests",
        },
        {
            to: `${main}/meetings`,
            label: "Meetings",
        },
        {
            to: `${main}/posts`,
            label: "Posts",
        },
        {
            to: `${main}/strikes`,
            label: "Strikes",
        },
        {
            to: `${main}/org-edits`,
            label: "Org Edits",
        },
    ];

    return (
        <RouteTabs tabs={navLinks} />
    );
};

export default OrgAdminNav;
