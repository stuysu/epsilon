import React, { useContext, useState } from "react";
import { Box, List } from "@mui/material";
import OrgContext from "../../../../contexts/OrgContext";
import { useLocation, useNavigate } from "react-router-dom";
import UserContext from "../../../../contexts/UserContext";

type LinkItem = { to: string; display: string };

const OrgNav = ({ isMobile }: { isMobile: boolean }) => {
    const organization = useContext<OrgContextType>(OrgContext);
    const user = useContext<UserContextType>(UserContext);
    const pendingMembers =
        organization.memberships?.filter((m) => !m.active) || [];

    const navigate = useNavigate();
    const location = useLocation();

    const main = `/${organization.url}`;
    const membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );

    const isOrgAdmin =
        organization.memberships?.some(
            (m) =>
                m.users?.id === user.id &&
                (m.role === "ADMIN" || m.role === "CREATOR"),
        ) ?? false;

    const isStuyActivitiesAdmin = Boolean(user.permission);

    const navLinks: LinkItem[] = [
        { to: main, display: "Overview" },
        { to: `${main}/charter`, display: "Charter" },
        { to: `${main}/meetings`, display: "Meetings" },
        { to: `${main}/members`, display: "Members" },
        { to: `${main}/audit`, display: "Audit" },
        ...(membership?.active
            ? [{ to: `${main}/stream`, display: "Stream" }]
            : []),
    ];

    const fullAdminLinks: LinkItem[] = [
        { to: `${main}/admin/roster`, display: "Roster" },
        {
            to: `${main}/admin/join-requests`,
            display: `Join Requests (${pendingMembers?.length})`,
        },
        { to: `${main}/admin/scheduler`, display: "Scheduler" },
        { to: `${main}/admin/attendance`, display: "Attendance" },
        { to: `${main}/admin/posts`, display: "Posts" },
        { to: `${main}/admin/messages`, display: "Messages" },
        { to: `${main}/admin/org-edits`, display: "Amend Charter" },
    ];

    const stuyActivitiesAdminLinks: LinkItem[] = [
        { to: `${main}/admin/messages`, display: "Messages" },
    ];

    const adminLinks: LinkItem[] = isOrgAdmin
        ? fullAdminLinks
        : isStuyActivitiesAdmin
          ? stuyActivitiesAdminLinks
          : [];

    const [menuOpen, setMenuOpen] = useState(false);

    const renderDesktopList = (links: LinkItem[]) => (
        <List sx={{ width: "100%" }}>
            {links.map((linkData, i) => (
                <Box
                    key={i}
                    sx={{
                        height: `30px`,
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={() => navigate(linkData.to)}
                >
                    <p
                        className={`important cursor-pointer ${
                            location.pathname === linkData.to
                                ? "text-typography-1"
                                : "text-typography-3"
                        }`}
                    >
                        {linkData.display}
                    </p>
                </Box>
            ))}
        </List>
    );

    const renderMobileButtons = (links: LinkItem[]) =>
        links.map((linkData, i) => (
            <button
                key={i}
                className={`important border border-zinc-600/20 w-full text-left py-2 px-3 rounded-lg text-lg transition-colors bg-neutral-600 text-typography-2 bg-opacity-20`}
                onClick={() => {
                    navigate(linkData.to);
                    setMenuOpen(false);
                }}
            >
                {linkData.display}
            </button>
        ));

    if (isMobile) {
        return (
            <>
                {/* Need to fix this later */}
                <button
                    className={`z-[5001] fixed cursor-pointer transition-colors text-typography-2 hover:text-typography-1 mr-4 top-5 right-0`}
                    onClick={() => setMenuOpen(true)}
                >
                    <span
                        style={{
                            fontVariationSettings: "'wght' 700",
                            marginLeft: 3,
                            position: "relative",
                        }}
                    >
                        <i className={"bx bx-menu bx-sm relative bottom-1"}></i>
                    </span>
                </button>

                {menuOpen && (
                    <div className="z-[5002] overflow-scroll pb-10 -mx-5 fixed inset-0 flex flex-col items-center justify-start bg-blurDark backdrop-blur-3xl">
                        <button
                            className="absolute top-4 right-14 text-3xl text-typography-1 font-bold"
                            onClick={() => setMenuOpen(false)}
                            aria-label="Close menu"
                        >
                            <i
                                className={
                                    "bx bx-x bx-sm relative -right-5 bottom-1.5"
                                }
                            ></i>
                        </button>

                        <div className="flex flex-col gap-1 w-full p-16">
                            <div
                                className=" text-l text-typography-2 ml-3"
                                style={{ fontVariationSettings: "'wght' 700" }}
                            >
                                About
                            </div>

                            {renderMobileButtons(navLinks)}

                            {adminLinks.length > 0 && (
                                <>
                                    <div
                                        className="mt-5 text-l text-typography-2 ml-3"
                                        style={{
                                            fontVariationSettings: "'wght' 700",
                                        }}
                                    >
                                        Admin Tools
                                    </div>
                                    {renderMobileButtons(adminLinks)}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className={"w-[160px] mt-4"}>
            <p>About</p>
            {renderDesktopList(navLinks)}

            {adminLinks.length > 0 && (
                <div>
                    <div className={"h-px w-5/6 bg-divider my-2"}></div>
                    <p className={"mt-6"}>Admin Tools</p>
                    {renderDesktopList(adminLinks)}
                </div>
            )}
        </div>
    );
};

export default OrgNav;
