import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

const AttendanceRouter = () => {
    return (
        <div>
            <Routes>
                <Route path="/" Component={Home} />
            </Routes>
        </div>
    )
}

export default AttendanceRouter;