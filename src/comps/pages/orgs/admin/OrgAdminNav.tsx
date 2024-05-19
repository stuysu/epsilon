import { useContext } from "react";

import OrgContext from "../../../context/OrgContext";

import RouteTabs from "../../../ui/RouteTabs";

import PeopleIcon from '@mui/icons-material/People';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import PostAddIcon from '@mui/icons-material/PostAdd';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import EditIcon from '@mui/icons-material/Edit';

const OrgAdminNav = () => {
    const organization = useContext<OrgContextType>(OrgContext);
    const main = `/${organization.url}/admin`;

    let navLinks = [
        {
            to: `${main}/members`,
            label: "Members",
            icon: <PeopleIcon />
        },
        {
            to: `${main}/member-requests`,
            label: "Member Requests",
            icon: <PersonAddAltIcon />
        },
        {
            to: `${main}/meetings`,
            label: "Meetings",
            icon: <CalendarMonth />
        },
        {
            to: `${main}/posts`,
            label: "Posts",
            icon: <PostAddIcon />
        },
        {
            to: `${main}/strikes`,
            label: "Strikes",
            icon: <ReportProblemIcon />
        },
        {
            to: `${main}/org-edits`,
            label: "Org Edits",
            icon: <EditIcon />
        },
    ];

    return <RouteTabs tabs={navLinks} />;
};

export default OrgAdminNav;
