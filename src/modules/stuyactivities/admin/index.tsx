import { Route, Routes } from "react-router-dom";

import React, { useContext } from "react";

import UserContext from "../../../contexts/UserContext";

import ApprovePending from "./pages/ApprovePending";
import ApproveEdit from "./pages/ApproveEdit";
import Strikes from "./pages/Strikes";
import SendMessage from "./pages/SendMessage";
import Announcements from "./pages/Announcements";
import Rooms from "./pages/Rooms";
import Reserve from "./pages/Reserve";
import Valentines from "./pages/Valentines";
import ApprovedValentines from "./pages/ApprovedValentines";
import ContentUnavailable from "../../../components/ui/content/ContentUnavailable";
import AddUser from "./pages/AddUser";
import AdminLanding from "./pages/AdminLanding";
import { AdminOrgProvider } from "./AdminOrgContext";

const VALENTINES = false;

export type Link = {
    to: string;
    label: string;
    icon: string;
    permission?: string;
};

export const getLinks = (user: UserContextType) => {
    let navLinks: Link[] = [
        {
            to: "/admin/approve-pending",
            label: "Pending Orgs",
            icon: "bx-carousel",
        },
        {
            to: "/admin/approve-edit",
            label: "Approve Edits",
            icon: "bx-edit",
        },
        {
            to: "/admin/strikes",
            label: "Strikes",
            icon: "bx-error",
        },
        {
            to: "/admin/send-message",
            label: "Send Message",
            icon: "bx-message-dots",
        },
        {
            to: "/admin/announcements",
            label: "Announcements",
            icon: "bxs-megaphone",
        },
        {
            to: "/admin/rooms",
            label: "Rooms",
            icon: "bx-door-open",
        },
        {
            to: "/admin/reserve",
            label: "Reserve",
            icon: "bx-calendar-check",
        },
        {
            to: "/admin/add-user",
            label: "Add User",
            icon: "bx-user-plus",
        },
    ];
    if (VALENTINES) {
        navLinks.push(
            ...[
                {
                    to: "/admin/valentines",
                    label: "Valentines",
                    icon: "bx-heart",
                    permission: "VALENTINES",
                },
                {
                    to: "/admin/approved-valentines",
                    label: "Approved Valentines",
                    icon: "bx-book-heart",
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
            <ContentUnavailable
                icon="bx-no-entry"
                iconColor="text-red"
                title="Restricted Access"
                description="You do not have access to this page at this time."
            />
        );
    }

    return (
        <AdminOrgProvider>
            <div className={"min-h-screen"}>
                <Routes>
                    <Route path="/" Component={AdminLanding} />
                    <Route path="/approve-pending" Component={ApprovePending} />
                    <Route path="/approve-edit" Component={ApproveEdit} />
                    <Route path="/strikes" Component={Strikes} />
                    <Route path="/send-message" Component={SendMessage} />
                    <Route path="/announcements" Component={Announcements} />
                    <Route path="/rooms" Component={Rooms} />
                    <Route path="/reserve" Component={Reserve} />
                    <Route path="/add-user" Component={AddUser} />
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
        </AdminOrgProvider>
    );
};

export default AdminRouter;
