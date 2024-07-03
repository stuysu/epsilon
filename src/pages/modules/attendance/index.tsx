import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import MeetingAttendance from "./pages/MeetingAttendance";

const AttendanceRouter = () => {
    return (
        <div>
            <Routes>
                <Route path="/" Component={Home} />
                <Route path="/meeting/:meetingId" Component={MeetingAttendance} />
            </Routes>
        </div>
    )
}

export default AttendanceRouter;