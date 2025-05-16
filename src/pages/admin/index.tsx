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
import FavoriteIcon from "@mui/icons-material/Favorite";

export type Link = {
    to: string;
    label: string;
    icon: React.ReactNode;
    permission?: string;
};

export const getLinks = (user: UserContextType) => {
    let navLinks = [
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
            to: "/admin/valentines",
            label: "Valentines",
            icon: <FavoriteIcon />,
            permission: "VALENTINES",
        },
    ];
    if (user.permission != "ADMIN") {
        navLinks = navLinks.filter(
            (link) => link.permission === user.permission,
        );
    }
    return navLinks;
};

const AdminRouter = () => {
    const user = useContext(UserContext);
    const links = getLinks(user);

    if (!user.permission) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    width: "100vw",
                    height: "80vh",
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
                    You cannot access the administrator panel. If you think this is a mistake, please contact us.
                </Typography>
            </Box>
        );
    }

    return (
        <div>
            <AdminNav />
            <Routes>
                <Route path="/" Component={AdminRedirect} />
                <Route path="/approve-pending" Component={ApprovePending} />
                <Route path="/approve-edit" Component={ApproveEdit} />
                <Route path="/strikes" Component={Strikes} />
                <Route path="/send-message" Component={SendMessage} />
                <Route path="/announcements" Component={Announcements} />
                <Route path="/rooms" Component={Rooms} />
                <Route path="/valentines" Component={Valentines} />
                <Route path="/*" Component={ApprovePending} />
            </Routes>
        </div>
    );
};

export default AdminRouter;
