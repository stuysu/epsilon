import { useContext } from "react";
import UserContext from "../../contexts/UserContext";

/* Index Pages */
import UnauthenticatedLanding from "./components/UnauthenticatedLanding";
import UserHome from "./components/UserHome";
import usePageMeta from "../../utils/usePageMeta";

const Index = () => {
    usePageMeta("Home - Epsilon");

    const user: UserContextType = useContext(UserContext);

    return (
        <div className="w-full">
            {user.signed_in ? <UserHome /> : <UnauthenticatedLanding />}
        </div>
    );
};

export default Index;
