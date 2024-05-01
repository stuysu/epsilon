import { useNavigate } from "react-router-dom";

import { useContext, useState } from "react";

import OrgContext from "../../../context/OrgContext";

import { List, ListItemButton, ListItemText } from "@mui/material";

const OrgAdminNav = () => {
    const organization = useContext<OrgContextType>(OrgContext);
    const main = `/${organization.url}/admin`;
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);

    let navLinks = [
        {
            to: `${main}/members`,
            display: "Members",
        },
        {
            to: `${main}/member-requests`,
            display: "Member Requests",
        },
        {
            to: `${main}/meetings`,
            display: "Meetings",
        },
        {
            to: `${main}/posts`,
            display: "Posts",
        },
        {
            to: `${main}/strikes`,
            display: "Strikes",
        },
        {
            to: `${main}/org-edits`,
            display: "Org Edits",
        },
    ];

    return (
        <List sx={{ width: "100%", display: "flex", flexWrap: "nowrap" }}>
            {navLinks.map((linkData, i) => (
                <ListItemButton
                    key={i}
                    selected={currentIndex === i}
                    onClick={() => {
                        setCurrentIndex(i);
                        navigate(linkData.to);
                    }}
                >
                    <ListItemText>{linkData.display}</ListItemText>
                </ListItemButton>
            ))}
        </List>
    );
};

export default OrgAdminNav;
