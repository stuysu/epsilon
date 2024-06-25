import { useContext } from "react";

import { Routes, Route } from "react-router-dom";

import UserContext from "../../../comps/context/UserContext";
import OrgContext from "../../../comps/context/OrgContext";

import Members from "./Members";
import MemberRequests from "./MemberRequests";
import Meetings from "./Meetings";
import Posts from "./Posts";
import Strikes from "./Strikes";
import Organization from "./Organization";

import OrgAdminNav from "../../../comps/pages/orgs/admin/OrgAdminNav";
import { Box } from "@mui/material";
import Messages from "./Messages";

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
                <div>You don't have access to this page</div>
            )}
        </>
    );
};

export default OrgAdminRouter;
