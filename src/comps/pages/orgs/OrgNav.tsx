import React, { useContext, useEffect, useState } from "react";
import { Box, List, Typography } from "@mui/material";
import OrgContext from "../../context/OrgContext";

import { useLocation, useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";

const OrgNav = ({ isMobile }: { isMobile: boolean }) => {
    const organization = useContext<OrgContextType>(OrgContext);
    const user = useContext<UserContextType>(UserContext);

    const navigate = useNavigate();
    const main = `/${organization.url}`;

    const membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );

    const location = useLocation();

    const navLinks = [
        { to: main, display: "Overview" },
        { to: `${main}/charter`, display: "Charter" },
        { to: `${main}/meetings`, display: "Meetings" },
        { to: `${main}/members`, display: "Members" },
        { to: `${main}/audit`, display: "Audit" },
        ...(membership ? [{ to: `${main}/stream`, display: "Stream" }] : []),
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        let isCorrectIndex = false;
        if (location.pathname === main) {
            if (currentIndex !== 0) {
                setCurrentIndex(0);
            } else {
                isCorrectIndex = true;
            }
        } else {
            if (currentIndex === 0) {
                isCorrectIndex = location.pathname === main;
            } else {
                isCorrectIndex = location.pathname.startsWith(
                    navLinks[currentIndex]?.to,
                );
            }
        }

        if (!isCorrectIndex) {
            const correctIndex =
                navLinks
                    .slice(1)
                    .findIndex((link) =>
                        location.pathname.startsWith(link.to),
                    ) + 1;
            setCurrentIndex(~correctIndex ? correctIndex : 0);
        }
    }, [navLinks, location.pathname, currentIndex, main]);

    if (isMobile) {
        return (
            <>
                <button
                    className={`fixed cursor-pointer transition-colors text-gray-300 hover:text-gray-400 mr-10 top-5 right-0`}
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
                    <div className="overflow-scroll pb-10 -mx-5 fixed inset-0 flex flex-col items-center justify-start bg-black/70 backdrop-blur-3xl">
                        <button
                            className="absolute top-4 right-14 text-3xl text-white font-bold"
                            onClick={() => setMenuOpen(false)}
                            aria-label="Close menu"
                        >
                            <i
                                className={
                                    "bx bx-x bx-sm relative right-1 bottom-0.5"
                                }
                            ></i>
                        </button>
                        <div className="flex flex-col gap-1 w-full p-16">
                            <div
                                className=" text-l text-white/50 ml-3"
                                style={{ fontVariationSettings: "'wght' 700" }}
                            >
                                About
                            </div>
                            {navLinks.map((linkData, i) => (
                                <button
                                    key={i}
                                    className={`border border-zinc-600/20 w-full text-left py-2 px-3 rounded-lg text-lg transition-colors ${currentIndex === i ? "bg-neutral-400 text-white bg-opacity-40" : "bg-neutral-600 text-gray-200 bg-opacity-20"}`}
                                    onClick={() => {
                                        navigate(linkData.to);
                                        setCurrentIndex(i);
                                        setMenuOpen(false);
                                    }}
                                >
                                    {linkData.display}
                                </button>
                            ))}
                            {organization.memberships?.some(
                                (m) =>
                                    m.users?.id === user.id &&
                                    (m.role === "ADMIN" ||
                                        m.role === "CREATOR"),
                            ) && (
                                <>
                                    <div
                                        className="mt-5 text-l text-white/50 ml-3"
                                        style={{
                                            fontVariationSettings: "'wght' 700",
                                        }}
                                    >
                                        Admin Tools
                                    </div>
                                    {[
                                        {
                                            to: `${main}/admin/members`,
                                            display: "Members",
                                        },
                                        {
                                            to: `${main}/admin/member-requests`,
                                            display: "Join Requests",
                                        },
                                        {
                                            to: `${main}/admin/meetings`,
                                            display: "Meetings",
                                        },
                                        {
                                            to: `${main}/admin/posts`,
                                            display: "Posts",
                                        },
                                        {
                                            to: `${main}/admin/strikes`,
                                            display: "Strikes",
                                        },
                                        {
                                            to: `${main}/admin/messages`,
                                            display: "Messages",
                                        },
                                        {
                                            to: `${main}/admin/org-edits`,
                                            display: "Amend Charter",
                                        },
                                    ].map((linkData, i) => (
                                        <button
                                            key={i}
                                            className={`border border-zinc-600/20 w-full text-left py-2 px-3 rounded-lg text-lg transition-colors ${currentIndex === i ? "bg-neutral-400 text-white bg-opacity-40" : "bg-neutral-600 text-gray-200 bg-opacity-20"}`}
                                            onClick={() => {
                                                navigate(linkData.to);
                                                setMenuOpen(false);
                                            }}
                                        >
                                            {linkData.display}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <Box
            sx={{
                minWidth: "160px",
                marginTop: "15px",
            }}
        >
            <Typography>About</Typography>
            <List sx={{ width: "100%" }}>
                {navLinks.map((linkData, i) => (
                    <Box
                        key={i}
                        sx={{
                            height: `30px`,
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            navigate(linkData.to);
                            setCurrentIndex(i);
                        }}
                    >
                        <Typography
                            sx={{
                                fontVariationSettings: `'wght' 600`,
                                color:
                                    currentIndex === i
                                        ? "rgba(232,232,232,80)"
                                        : "#rgba(174,174,174,80)",
                            }}
                        >
                            {linkData.display}
                        </Typography>
                    </Box>
                ))}
            </List>

            {/* OrgAdminNav if user is admin or creator */}
            {organization.memberships?.some(
                (m) =>
                    m.users?.id === user.id &&
                    (m.role === "ADMIN" || m.role === "CREATOR"),
            ) && (
                <div>
                    <div className={"h-px w-5/6 bg-neutral-600 my-2"}></div>
                    <Typography marginTop={2}>Admin Tools</Typography>

                    <List sx={{ width: "100%" }}>
                        {[
                            {
                                to: `${main}/admin/members`,
                                display: "Members",
                            },
                            {
                                to: `${main}/admin/member-requests`,
                                display: "Join Requests",
                            },
                            {
                                to: `${main}/admin/meetings`,
                                display: "Meetings",
                            },
                            { to: `${main}/admin/posts`, display: "Posts" },
                            {
                                to: `${main}/admin/messages`,
                                display: "Messages",
                            },
                            {
                                to: `${main}/admin/org-edits`,
                                display: "Amend Charter",
                            },
                        ].map((linkData, i) => (
                            <Box
                                key={i}
                                sx={{
                                    height: `30px`,
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    navigate(linkData.to);
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontVariationSettings: `'wght' 600`,
                                        color:
                                            location.pathname === linkData.to
                                                ? "rgba(232,232,232,80)"
                                                : "#rgba(174,174,174,80)",
                                    }}
                                >
                                    {linkData.display}
                                </Typography>
                            </Box>
                        ))}
                    </List>
                </div>
            )}
        </Box>
    );
};

export default OrgNav;
