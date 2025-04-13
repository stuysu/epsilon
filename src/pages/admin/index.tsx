import { Route, Routes } from "react-router-dom";

import { useContext } from "react";
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

/* ICONS */
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import EditIcon from "@mui/icons-material/Edit";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import EmailIcon from "@mui/icons-material/Email";
import CampaignIcon from "@mui/icons-material/Campaign";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { Add } from "@mui/icons-material";

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
    ];

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
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Typography variant="h1">
                    You do not have access to this page.
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
                <Route path="/*" Component={ApprovePending} />
            </Routes>
        </div>
    );
};

export default AdminRouter;
