import { useContext } from "react";
import { Helmet } from "react-helmet";
import UserContext from "../../contexts/UserContext";

/* Index Pages */
import UnauthenticatedLanding from "./components/UnauthenticatedLanding";
import UserHome from "./components/UserHome";

const Index = () => {
    const user: UserContextType = useContext(UserContext);

    return (
        <div className="w-full">
            <Helmet>
                <title>Home - Epsilon</title>
                <meta
                    name="description"
                    content="Epsilon is the everything app for Stuyvesant High School. Find and join Activities, browse the calendar, discover new opportunities, and more."
                />
            </Helmet>
            {user.signed_in ? <UserHome /> : <UnauthenticatedLanding />}
        </div>
    );
};

export default Index;
