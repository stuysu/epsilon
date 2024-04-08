import { useContext } from "react";
import { Helmet } from "react-helmet";
import UserContext from "../comps/context/UserContext";

/* Home Pages */
import UnauthenticatedLanding from "../comps/pages/home/UnauthenticatedLanding";
import UserHome from "../comps/pages/home/UserHome";

const Home = () => {
  const user: UserContextType = useContext(UserContext);

  return (
    <div>
      <Helmet>
        <title>Home | StuyActivities</title>
      </Helmet>
      {user.signed_in ? <UserHome /> : <UnauthenticatedLanding />}
    </div>
  );
};

export default Home;
