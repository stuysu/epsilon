import React, { useContext, useState } from "react";
import { createPortal } from "react-dom";
import OrgContext from "../../../../contexts/OrgContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
                (m.role === "CREATOR" || (m.role === "ADMIN" && m.active)),
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
        { to: `${main}/admin/roster`, display: "Roster" },
        { to: `${main}/admin/messages`, display: "Messages" },
    ];

    const adminLinks: LinkItem[] = isOrgAdmin
        ? fullAdminLinks
        : isStuyActivitiesAdmin
          ? stuyActivitiesAdminLinks
          : [];

    const [menuOpen, setMenuOpen] = useState(false);

    const renderDesktopList = (links: LinkItem[]) => (
        <div className="w-full py-2">
            {links.map((linkData, i) => (
                <Link
                    key={i}
                    to={linkData.to}
                    aria-current={
                        location.pathname === linkData.to ? "page" : undefined
                    }
                    className="flex h-[30px] w-fit items-center rounded no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
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
                </Link>
            ))}
        </div>
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
                {/* phones: top corner (their nav bar is at the bottom);
                    tablets: in the page, clear of the header and user menu */}
                <button
                    aria-label="Open menu"
                    aria-haspopup="dialog"
                    aria-expanded={menuOpen}
                    className={`cursor-pointer transition-colors text-typography-2 sm:hover:text-typography-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1 max-sm:z-[5001] max-sm:fixed max-sm:mr-4 max-sm:top-4 max-sm:right-0 sm:flex sm:items-center sm:gap-1 sm:mr-4 sm:rounded-lg sm:bg-layer-2 sm:shadow-control sm:pl-1 sm:pr-3 sm:py-1.5`}
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
                            className={
                                "bx bx-menu bx-sm relative bottom-1.5 sm:bottom-0 sm:top-0.5"
                            }
                        ></i>
                    </span>
                    <span className="max-sm:hidden important">Menu</span>
                </button>

                {menuOpen &&
                    // rendered at the body so the page's sticky column
                    // can't put it under the site header
                    createPortal(
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

                                {adminLinks.length > 0 && (
                                    <>
                                        <h5 className={"mt-6 px-3"}>
                                            Admin Tools
                                        </h5>
                                        {renderMobileButtons(adminLinks)}
                                    </>
                                )}
                            </div>
                        </div>,
                        document.body,
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
