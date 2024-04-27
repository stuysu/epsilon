import { useContext } from "react";
import { Helmet } from "react-helmet";
import UserContext from "../comps/context/UserContext";

/* Home Pages */
import UnauthenticatedLanding from "../comps/pages/home/UnauthenticatedLanding";
import UserHome from "../comps/pages/home/UserHome";
import { Box } from "@mui/material";

const Home = () => {
  const user: UserContextType = useContext(UserContext);

  return (
    <Box sx={{ width: '100%'}}>
      <Helmet>
        <title>Home | Epsilon</title>
      </Helmet>
      {user.signed_in ? <UserHome /> : <UnauthenticatedLanding />}
    </Box>
  );
};

export default Home;
