import { Route, Routes } from "react-router-dom";
import Valentines from "./Valentines";
import LoginGate from "../../../comps/ui/LoginGate";
import Create from "./Create";

// overkill but leaving room for growth if needed
const ValentinesRouter = () => {
    return (
        <LoginGate>
            <Routes>
                <Route path="/" Component={Valentines} />
                <Route path="/create" Component={Create} />
            </Routes>
        </LoginGate>
    );
};

export default ValentinesRouter;
