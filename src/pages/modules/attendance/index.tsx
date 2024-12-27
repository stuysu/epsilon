import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import MeetingAdminAttendance from "./pages/MeetingAdminAttendance";
import MeetingAttendance from "./pages/MeetingAttendance";

const AttendanceRouter = () => {
    return (
        <div>
            <Routes>
                <Route path="/" Component={Home} />
                <Route
                    path="/meeting/:meetingId"
                    Component={MeetingAttendance}
                />
                <Route
                    path="/meeting-admin/:meetingId"
                    Component={MeetingAdminAttendance}
                />
            </Routes>
        </div>
    );
};

export default AttendanceRouter;
