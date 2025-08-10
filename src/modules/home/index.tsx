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
                <title>Home - Epsilon</title>
                <meta
                    name="description"
                    content="The Everything App for Stuyvesant High School."
                />
            </Helmet>
            {user.signed_in ? <UserHome /> : <UnauthenticatedLanding />}
        </Box>
    );
};

export default Index;
