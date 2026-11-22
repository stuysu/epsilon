import { Route, Routes } from "react-router-dom";
import Valentines from "./Valentines";
import LoginGate from "../../components/ui/content/LoginGate";
import Create from "./Create";

// overkill but leaving room for growth if needed
const ValentinesRouter = () => {
    return (
        <LoginGate>
            <div className="mt-[2rem] w-full flex items-center flex-col pb-[10vh]">
                {/* the page's heading; styled as it was when it was an h2 */}
                <h1 className="text-[3.75rem] leading-[1.2] my-1 font-semibold text-typography-2">
                    Valentines
                </h1>
                <div className="mt-4 mb-[2rem] w-[80vw]">
                    <hr className="border-divider" />
                </div>
                <Routes>
                    <Route path="/" Component={Valentines} />
                    <Route path="/create" Component={Create} />
                </Routes>
            </div>
        </LoginGate>
    );
};

export default ValentinesRouter;
