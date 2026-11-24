import { Route, Routes, useLocation } from "react-router-dom";

import React, { useContext, useEffect } from "react";
import { invalidate } from "../../../lib/queryCache";

import UserContext from "../../../contexts/UserContext";

import AdminNav from "./components/AdminNav";
import AdminRedirect from "./AdminRedirect";
import ApprovePending from "./pages/ApprovePending";
import ApproveEdit from "./pages/ApproveEdit";
import Strikes from "./pages/Strikes";
import SendMessage from "./pages/SendMessage";
import Announcements from "./pages/Announcements";
import Rooms from "./pages/Rooms";
import Reserve from "./pages/Reserve";
import RoomBlocks from "./pages/RoomBlocks";
import Valentines from "./pages/Valentines";
import ApprovedValentines from "./pages/ApprovedValentines";
import ContentUnavailable from "../../../components/ui/content/ContentUnavailable";
import AddUser from "./pages/AddUser";
import Analytics from "./pages/Analytics";
import ActivityLog from "./pages/ActivityLog";
import { ALL_LINKS, canOpen, getLinks } from "./links";
import usePageMeta from "../../../utils/usePageMeta";

const PAGES: Record<string, React.ComponentType> = {
    "/admin/approve-pending": ApprovePending,
    "/admin/approve-edit": ApproveEdit,
    "/admin/strikes": Strikes,
    "/admin/send-message": SendMessage,
    "/admin/announcements": Announcements,
    "/admin/rooms": Rooms,
    "/admin/reserve": Reserve,
    "/admin/block-rooms": RoomBlocks,
    "/admin/add-user": AddUser,
    "/admin/analytics": Analytics,
    "/admin/activity-log": ActivityLog,
    "/admin/valentines": Valentines,
    "/admin/approved-valentines": ApprovedValentines,
};

const Restricted = () => (
    <ContentUnavailable
        icon="bx-no-entry"
        iconColor="text-red"
        title="Restricted Access"
        description="You do not have access to this page at this time."
    />
);

const AdminRouter = () => {
    const user = useContext(UserContext);
    const { pathname } = useLocation();
    const page = ALL_LINKS.find((link) => pathname.startsWith(link.to));
    usePageMeta(page ? `${page.label} - Admin - Epsilon` : "Admin - Epsilon");

    // approvals, edits and rooms change shared data, so leaving refreshes it
    useEffect(
        () => () => {
            for (const key of [
                "org",
                "catalog",
                "orgList",
                "rooms",
                "roomGrants",
            ])
                invalidate([key]);
        },
        [],
    );
    const links = getLinks(user);

    if (!links.length) return <Restricted />;

    return (
        <div className={"min-h-screen"}>
            <AdminNav links={links} />
            <Routes>
                <Route path="/" Component={AdminRedirect} />
                {ALL_LINKS.map(({ to, permission }) => (
                    <Route
                        key={to}
                        path={to.slice("/admin".length)}
                        Component={
                            canOpen(user, permission) ? PAGES[to] : Restricted
                        }
                    />
                ))}
                <Route path="/*" Component={AdminRedirect} />
            </Routes>
        </div>
    );
};

export default AdminRouter;
