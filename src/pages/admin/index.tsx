import { Routes, Route, useNavigate } from "react-router-dom"

/* MODULES */
import Approve from "./Approve";
import { useEffect, useContext } from "react";
import UserContext from "../../comps/context/UserContext";

const Redirect = () => {
    const navigate= useNavigate(); 

    useEffect(() => {
        navigate("/admin/approve"); 
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
            <Routes>
                <Route path="/approve" Component={Approve} />
                <Route path="/*" Component={Redirect} />
            </Routes>
        </div>
    )
}

export default AdminRouter;