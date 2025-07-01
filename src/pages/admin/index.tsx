import { Route, Routes } from "react-router-dom";

import React, { useContext } from "react";
import { Box, Typography } from "@mui/material";

import UserContext from "../../comps/context/UserContext";

import AdminNav from "../../comps/admin/AdminNav";
/* MODULES */
import AdminRedirect from "./AdminRedirect";
import ApprovePending from "./ApprovePending";
import ApproveEdit from "./ApproveEdit";
import Strikes from "./Strikes";
import SendMessage from "./SendMessage";
import Announcements from "./Announcements";
import Rooms from "./Rooms";
import Valentines from "./Valentines";

/* ICONS */
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import EditIcon from "@mui/icons-material/Edit";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import EmailIcon from "@mui/icons-material/Email";
import CampaignIcon from "@mui/icons-material/Campaign";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AddIcon from "@mui/icons-material/Add";
import AddUser from "./AddUser";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ApprovedValentines from "./ApprovedValentines";
import Debug from "./Debug";

const VALENTINES = false;

export type Link = {
    to: string;
    label: string;
    icon: React.ReactNode;
    permission?: string;
};

export const getLinks = (user: UserContextType) => {
    let navLinks: Link[] = [
        {
            to: "/admin/approve-pending",
            label: "Pending Orgs",
            icon: <PendingActionsIcon />,
        },
        {
            to: "/admin/approve-edit",
            label: "Approve Edits",
            icon: <EditIcon />,
        },
        {
            to: "/admin/strikes",
            label: "Strikes",
            icon: <ReportProblemIcon />,
        },
        {
            to: "/admin/send-message",
            label: "Send Message",
            icon: <EmailIcon />,
        },
        {
            to: "/admin/announcements",
            label: "Announcements",
            icon: <CampaignIcon />,
        },
        {
            to: "/admin/rooms",
            label: "Rooms",
            icon: <MeetingRoomIcon />,
        },
        {
            to: "/admin/add-user",
            label: "Add User",
            icon: <AddIcon />,
        },
        {
            to: "/",
            label: "CTA (Coming Soon)",
            icon: <i className="bx bx-bell bx-sm"></i>,
        },
    ];
    if (VALENTINES) {
        navLinks.push(
            ...[
                {
                    to: "/admin/valentines",
                    label: "Valentines",
                    icon: <FavoriteIcon />,
                    permission: "VALENTINES",
                },
                {
                    to: "/admin/approved-valentines",
                    label: "Approved Valentines",
                    icon: <FavoriteIcon />,
                    permission: "VALENTINES",
                },
            ],
        );
    }
    if (user.permission !== "ADMIN") {
        navLinks = navLinks.filter(
            (link) => link.permission === user.permission,
        );
    }
    return navLinks;
};

const AdminRouter = () => {
    const user = useContext(UserContext);
    const links = getLinks(user);
    console.log(links, "neow");

    if (!user.permission || !links.length) {
        return (
            <Box
                sx={{
                    width: "100vw",
                    minHeight: "55vh",
                    marginBottom: "5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <i className="bx bx-no-entry bx-lg text-red-500 mb-5"></i>
                <Typography variant="h1" marginBottom={3}>
                    Restricted Access
                </Typography>
                <Typography variant="body1">
                    {`You do not have access to this page${user.permission ? " at this time" : ""}.`}
                </Typography>
            </Box>
        );
    }

    return (
        <div>
            <AdminNav links={links} />
            <Routes>
                <Route path="/" Component={AdminRedirect} />
                <Route path="/approve-pending" Component={ApprovePending} />
                <Route path="/approve-edit" Component={ApproveEdit} />
                <Route path="/strikes" Component={Strikes} />
                <Route path="/send-message" Component={SendMessage} />
                <Route path="/announcements" Component={Announcements} />
                <Route path="/rooms" Component={Rooms} />
                <Route path="/add-user" Component={AddUser} />
                <Route path="/debug" Component={Debug} />
                {VALENTINES && (
                    <>
                        <Route path="/valentines" Component={Valentines} />
                        <Route
                            path="/approved-valentines"
                            Component={ApprovedValentines}
                        />
                    </>
                )}
                <Route path="/*" Component={ApprovePending} />
            </Routes>
        </div>
    );
};

export default AdminRouter;
