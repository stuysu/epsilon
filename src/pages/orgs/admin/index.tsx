import React, { useContext } from "react";

import { Route, Routes } from "react-router-dom";

import UserContext from "../../../comps/context/UserContext";
import OrgContext from "../../../comps/context/OrgContext";

import Members from "./Members";
import MemberRequests from "./MemberRequests";
import Meetings from "./Meetings";
import Posts from "./Posts";
import Strikes from "./Strikes";
import Organization from "./Organization";

import OrgAdminNav from "../../../comps/pages/orgs/admin/OrgAdminNav";
import Messages from "./Messages";
import { Box, Typography } from "@mui/material";

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
                    <OrgAdminNav />
                    <Routes>
                        <Route path={"/members"} Component={Members} />
                        <Route
                            path={"/member-requests"}
                            Component={MemberRequests}
                        />
                        <Route path={"/meetings"} Component={Meetings} />
                        <Route path={"/posts"} Component={Posts} />
                        <Route path={"/strikes"} Component={Strikes} />
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
                        You are not an administrator for this activity.
                        <br />
                        Please contact the activity owner for more details.
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default OrgAdminRouter;
