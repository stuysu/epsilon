import { Routes, Route, useNavigate } from "react-router-dom"

/* MODULES */
import Approve from "./Approve";
import { useEffect } from "react";

const Redirect = () => {
    const navigate= useNavigate(); 

    useEffect(() => {
        navigate("/admin/approve"); 
    })
    
    return (<div>Redirecting...</div>)
}

const AdminRouter = () => {
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