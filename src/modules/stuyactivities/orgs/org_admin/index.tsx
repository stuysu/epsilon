import React, { useContext } from "react";

import { Route, Routes } from "react-router-dom";

import UserContext from "../../../../contexts/UserContext";
import OrgContext from "../../../../contexts/OrgContext";

import Members from "./pages/Members";
import MemberRequests from "./pages/MemberRequests";
import Meetings from "./pages/Meetings";
import Posts from "./pages/Posts";
import Organization from "./pages/Organization";

import Messages from "./pages/Messages";
import { Box, Typography } from "@mui/material";
import AttendanceOverview from "./pages/AttendanceOverview";
import MeetingAttendance from "./pages/MeetingAttendance";

const OrgAdminRouter = () => {
    const user = useContext<UserContextType>(UserContext);
    const organization = useContext<OrgContextType>(OrgContext);

    const membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );

    let isOrgAdmin = false;

    if (
        membership &&
        (membership.role === "ADMIN" || membership.role === "CREATOR")
    )
        isOrgAdmin = true;

    return (
        <>
            {isOrgAdmin ? (
                <>
                    <Routes>
                        <Route path={"/members"} Component={Members} />
                        <Route
                            path={"/member-requests"}
                            Component={MemberRequests}
                        />
                        <Route path={"/meetings"} Component={Meetings} />
                        <Route path={"/posts"} Component={Posts} />

                        <Route
                            path={"/attendance"}
                            Component={AttendanceOverview}
                        />
                        <Route
                            path="/attendance/:meetingId"
                            Component={MeetingAttendance}
                        />

                        <Route path={"/org-edits"} Component={Organization} />
                        <Route path={"/messages"} Component={Messages} />
                        <Route path={"/*"} Component={Members} />
                    </Routes>
                </>
            ) : (
                <Box
                    sx={{
                        marginTop: "2rem",
                        display: "flex",
                        minHeight: "55vh",
                        marginBottom: "5rem",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <i className="bx bx-no-entry bx-lg text-red-500 mb-5"></i>
                    <Typography variant="h1" marginBottom={3}>
                        Restricted Access
                    </Typography>
                    <Typography variant="body1" align={"center"}>
                        You are not an administrator for this Activity.
                        <br />
                        Please contact the Activity owner for more details.
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default OrgAdminRouter;
