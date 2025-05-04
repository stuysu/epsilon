import { getLinks } from "./index";
import UserContext from "../../comps/context/UserContext";
import { useContext } from "react";
import { Navigate } from "react-router-dom";

const AdminRedirect = () => {
    const user = useContext(UserContext);
    const links = getLinks(user);
    return <Navigate to={links[0]?.to || "/"} />;
};

export default AdminRedirect;
