import { Route, Routes } from "react-router-dom";
import Valentines from "./Valentines";
import LoginGate from "../../../comps/ui/LoginGate";

// overkill but leaving room for growth if needed
const ValentinesRouter = () => {
    return (
        <LoginGate>
            <Routes>
                <Route path="/" Component={Valentines} />
            </Routes>
        </LoginGate>
    );
};

export default ValentinesRouter;
