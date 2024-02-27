import { Routes, Route, useNavigate } from "react-router-dom"

import { useEffect, useContext } from "react";
import UserContext from "../../comps/context/UserContext";

import AdminNav from "../../comps/admin/AdminNav";

/* MODULES */
import ApprovePending from "./ApprovePending";
import ApproveEdit from "./ApproveEdit";

const Redirect = () => {
    const navigate= useNavigate(); 

    useEffect(() => {
        navigate("/admin/approve-pending"); 
    })
    
    return (<div>Redirecting...</div>)
}

const AdminRouter = () => {
    const user = useContext(UserContext);

    if (!user.admin) {
        return (
            <div>You do not have access to this page.</div>
        )
    }

    return (
        <div>
            <AdminNav />
            <Routes>
                <Route path="/approve-pending" Component={ApprovePending} />
                <Route path="/approve-edit" Component={ApproveEdit} />
                <Route path="/*" Component={Redirect} />
            </Routes>
        </div>
    )
}

export default AdminRouter;