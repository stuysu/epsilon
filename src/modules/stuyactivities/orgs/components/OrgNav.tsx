import React, { useContext, useState } from "react";
import { List } from "@mui/material";
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
    ];

    const updatesLinks: LinkItem[] = membership?.active
        ? [{ to: `${main}/stream`, display: "Stream" }]
        : [];

    const fullAdminLinks: LinkItem[] = [
        { to: `${main}/admin/roster`, display: "Personnel" },
        { to: `${main}/admin/scheduler`, display: "Scheduler" },
        { to: `${main}/admin/attendance`, display: "Attendance" },
        { to: `${main}/admin/messages`, display: "Messages" },
        { to: `${main}/admin/org-edits`, display: "Amendments" },
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
        <nav>
            {links.map((linkData, i) => (
                <div
                    key={i}
                    style={{
                        height: `27px`,
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
                </div>
            ))}
        </nav>
    );

    const renderMobileButtons = (links: LinkItem[]) =>
        links.map((linkData, i) => (
            <button
                key={i}
                className={`important shadow-control w-full text-left py-2 px-3 rounded-lg transition-colors bg-layer-2 text-typography-1`}
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
                    className={`z-[5001] fixed cursor-pointer transition-colors text-typography-2 sm:hover:text-typography-1 mr-4 top-4 right-0`}
                    onClick={() => setMenuOpen(true)}
                >
                    <span
                        style={{
                            fontVariationSettings: "'wght' 700",
                            marginLeft: 3,
                            position: "relative",
                        }}
                    >
                        <i
                            className={"bx bx-menu bx-sm relative bottom-1.5"}
                        ></i>
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

                        <div className="flex flex-col gap-1.5 w-full p-16">
                            <h5 className={"px-3"}>About</h5>

                            {renderMobileButtons(navLinks)}

                            {updatesLinks.length > 0 && (
                                <>
                                    <h5 className={"mt-6 px-3"}>Updates</h5>
                                    {renderMobileButtons(updatesLinks)}
                                </>
                            )}

                            {adminLinks.length > 0 && (
                                <>
                                    <h5 className={"mt-6 px-3"}>Admin Tools</h5>
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
            <h5>About</h5>
            {renderDesktopList(navLinks)}

            {updatesLinks.length > 0 && (
                <div>
                    <div className={"h-px w-5/6 bg-divider my-3"}></div>
                    <h5>Updates</h5>
                    {renderDesktopList(updatesLinks)}
                </div>
            )}

            {adminLinks.length > 0 && (
                <div>
                    <div className={"h-px w-5/6 bg-divider my-3"}></div>
                    <h5>Admin Tools</h5>
                    {renderDesktopList(adminLinks)}
                </div>
            )}
        </div>
    );
};

export default OrgNav;
