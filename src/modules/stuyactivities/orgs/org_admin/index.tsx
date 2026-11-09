import React, { useContext } from "react";

import { Navigate, Route, Routes } from "react-router-dom";

import UserContext from "../../../../contexts/UserContext";
import OrgContext from "../../../../contexts/OrgContext";

import Roster from "./pages/Roster";
import JoinRequests from "./pages/JoinRequests";
import Scheduler from "./pages/Scheduler";
import Posts from "./pages/Posts";
import Organization from "./pages/Organization";
import Messages from "./pages/Messages";
import AttendanceOverview from "./pages/AttendanceOverview";
import MeetingAttendance from "./pages/MeetingAttendance";
import MemberAttendance from "./pages/MemberAttendance";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";

const OrgAdminRouter = () => {
    const user = useContext<UserContextType>(UserContext);
    const organization = useContext<OrgContextType>(OrgContext);

    const membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );

    const isOrgAdmin =
        !!membership &&
        (membership.role === "CREATOR" || membership.role === "ADMIN") &&
        membership.active;

    const isAdvisor =
        !!membership && membership.role === "ADVISOR" && membership.active;

    const isStuyActivitiesAdmin = user.permission === "ADMIN";

    if (isAdvisor) {
        return (
            <Routes>
                <Route index Component={Roster} />
                <Route path={"/roster"} Component={Roster} />
                <Route
                    path={"/roster/join-requests"}
                    Component={JoinRequests}
                />
                <Route
                    path={"/join-requests"}
                    element={
                        <Navigate
                            to={`/${organization.url}/admin/roster/join-requests`}
                            replace
                        />
                    }
                />
                <Route path={"/scheduler"} Component={Scheduler} />
                <Route path={"/posts"} Component={Posts} />
                <Route path={"/attendance"} Component={AttendanceOverview} />
                <Route
                    path="/attendance/:meetingId"
                    Component={MeetingAttendance}
                />
                <Route
                    path="/attendance/members/:userId"
                    Component={MemberAttendance}
                />
                <Route
                    path={"/*"}
                    element={
                        <ContentUnavailable
                            icon="bx-no-entry"
                            iconColor="text-red"
                            title="Student Leaders Only"
                            description="Advisors can manage the roster, meetings, attendance and posts. Messages and charter changes are handled by the Activity's student leaders."
                        />
                    }
                />
            </Routes>
        );
    }

    if (isOrgAdmin) {
        return (
            <Routes>
                <Route path={"/roster"} Component={Roster} />
                <Route
                    path={"/roster/join-requests"}
                    Component={JoinRequests}
                />
                <Route
                    path={"/join-requests"}
                    element={
                        <Navigate
                            to={`/${organization.url}/admin/roster/join-requests`}
                            replace
                        />
                    }
                />
                <Route path={"/scheduler"} Component={Scheduler} />
                <Route path={"/posts"} Component={Posts} />
                <Route path={"/attendance"} Component={AttendanceOverview} />
                <Route
                    path="/attendance/:meetingId"
                    Component={MeetingAttendance}
                />
                <Route
                    path="/attendance/members/:userId"
                    Component={MemberAttendance}
                />
                <Route path={"/org-edits"} Component={Organization} />
                <Route path={"/messages"} Component={Messages} />
                <Route path={"/*"} Component={Roster} />
            </Routes>
        );
    }

    if (isStuyActivitiesAdmin) {
        return (
            <Routes>
                <Route path={"/roster"} element={<Roster readOnly />} />
                <Route path={"/messages"} Component={Messages} />
                <Route
                    path={"/*"}
                    element={
                        <ContentUnavailable
                            icon="bx-no-entry"
                            iconColor="text-red"
                            title="Limited Access"
                            description="You are not an administrator for this Activity. You are a Clubs & Pubs administrator, which gives you access to the roster (read-only) and messaging. To access global administrator actions, please use the StuyActivities Admin Panel."
                        />
                    }
                />
            </Routes>
        );
    }

    return (
        <ContentUnavailable
            icon="bx-no-entry"
            iconColor="text-red"
            title="Restricted Access"
            description="You are not an administrator for this Activity. Please contact the Activity owner for more details."
        />
    );
};

export default OrgAdminRouter;
