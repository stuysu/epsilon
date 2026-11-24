import { getLinks } from "./links";
import UserContext from "../../../contexts/UserContext";
import { useContext } from "react";
import { Navigate } from "react-router-dom";

const AdminRedirect = () => {
    const user = useContext(UserContext);
    const links = getLinks(user);
    return <Navigate to={links[0]?.to || "/"} replace />;
};

export default AdminRedirect;
