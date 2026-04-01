import { useContext } from "react";
import { Helmet } from "react-helmet";
import UserContext from "../../contexts/UserContext";

/* Index Pages */
import UnauthenticatedLanding from "./components/UnauthenticatedLanding";
import UserHome from "./components/UserHome";
import { Box } from "@mui/material";

const Index = () => {
    const user: UserContextType = useContext(UserContext);

    return (
        <Box sx={{ width: "100%" }}>
            <Helmet>
                <title>Home - Sigma</title>
                <meta
                    name="description"
                    content="Sigma is the everything app for Stuyvesant High School. Find and join Activities, browse the calendar, discover new opportunities, and more."
                />
            </Helmet>
            {user.signed_in ? <UserHome /> : <UnauthenticatedLanding />}
        </Box>
    );
};

export default Index;
