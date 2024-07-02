import { Routes, Route } from "react-router-dom";

import { useContext } from "react";
import UserContext from "../../comps/context/UserContext";

import AdminNav from "../../comps/admin/AdminNav";

/* MODULES */
import ApprovePending from "./ApprovePending";
import ApproveEdit from "./ApproveEdit";
import Strikes from "./Strikes";
import SendMessage from "./SendMessage";
import Announcements from "./Announcements";
import Rooms from "./Rooms";

const AdminRouter = () => {
    const user = useContext(UserContext);

    if (!user.admin) {
        return <div>You do not have access to this page.</div>;
    }

    return (
        <div>
            <AdminNav />
            <Routes>
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
