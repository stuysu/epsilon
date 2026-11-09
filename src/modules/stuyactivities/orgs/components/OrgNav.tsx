import React, { useContext, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import OrgContext from "../../../../contexts/OrgContext";
import { Link, useLocation } from "react-router-dom";
import UserContext from "../../../../contexts/UserContext";

type LinkItem = {
    to: string;
    display: string;
    alsoActiveOn?: string;
    badge?: number;
};

const CountBadge = ({ count }: { count?: number }) =>
    count ? (
        <span
            aria-label={`${count} pending`}
            className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-layer-2 px-1.5 text-sm text-typography-2"
        >
            {count}
        </span>
    ) : null;

const OrgNav = ({ isMobile }: { isMobile: boolean }) => {
    const organization = useContext<OrgContextType>(OrgContext);
    const user = useContext<UserContextType>(UserContext);
    const pendingMembers =
        organization.memberships?.filter((m) => !m.active) || [];

    const location = useLocation();

    const main = `/${organization.url}`;
    const membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );

    const isOrgAdmin =
        organization.memberships?.some(
            (m) =>
                m.users?.id === user.id &&
                (m.role === "CREATOR" || m.role === "ADMIN") &&
                m.active,
        ) ?? false;

    const isAdvisor = membership?.role === "ADVISOR" && !!membership.active;

    const isStuyActivitiesAdmin = user.permission === "ADMIN";

    const navLinks: LinkItem[] = [
        { to: main, display: "Overview" },
        { to: `${main}/charter`, display: "Charter" },
        { to: `${main}/meetings`, display: "Meetings" },
        { to: `${main}/members`, display: "Members" },
        ...(isStuyActivitiesAdmin
            ? [{ to: `${main}/audit`, display: "Audit" }]
            : []),
        ...(membership?.active
            ? [{ to: `${main}/stream`, display: "Stream" }]
            : []),
        ...(membership?.active && !isAdvisor
            ? [{ to: `${main}/attendance`, display: "My Attendance" }]
            : []),
    ];

    const fullAdminLinks: LinkItem[] = [
        {
            to: `${main}/admin/roster`,
            display: "Roster",
            badge: pendingMembers.length,
            alsoActiveOn: `${main}/admin/roster/join-requests`,
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
        : isAdvisor
          ? fullAdminLinks.slice(0, 4)
          : isStuyActivitiesAdmin
            ? stuyActivitiesAdminLinks
            : [];

    const [menuOpen, setMenuOpen] = useState(false);
    const sectionLabel = "cursor-default select-none tracking-wider";

    const renderDesktopList = (links: LinkItem[]) => (
        <div className="w-full py-2">
            {links.map((linkData, i) => (
                <Link
                    key={i}
                    to={linkData.to}
                    aria-current={
                        location.pathname === linkData.to ? "page" : undefined
                    }
                    className="flex min-h-[30px] w-5/6 items-center gap-2 rounded no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                >
                    <p
                        className={`important cursor-pointer ${
                            location.pathname === linkData.to ||
                            location.pathname === linkData.alsoActiveOn
                                ? "text-typography-1"
                                : "text-typography-3"
                        }`}
                    >
                        {linkData.display}
                    </p>
                    <CountBadge count={linkData.badge} />
                </Link>
            ))}
        </div>
    );

    const renderMobileButtons = (links: LinkItem[]) =>
        links.map((linkData, i) => {
            const current =
                location.pathname === linkData.to ||
                location.pathname === linkData.alsoActiveOn;
            return (
                <Link
                    key={i}
                    to={linkData.to}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`important flex min-h-11 w-full items-center rounded-lg px-3 text-left no-underline shadow-control transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-typography-1 ${
                        current
                            ? "bg-layer-3 text-typography-1"
                            : "bg-layer-2 text-typography-2 sm:hover:bg-layer-3 sm:hover:text-typography-1"
                    }`}
                >
                    {linkData.display}
                    <CountBadge count={linkData.badge} />
                </Link>
            );
        });

    if (isMobile) {
        return (
            <>
                {/* a real dialog: focus moves in and stays in, Escape
                    closes it, and focus returns to the Menu button.
                    The button sits in the top corner on phones (their nav
                    bar is at the bottom) and across from Catalog on tablets */}
                <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
                    <Dialog.Trigger asChild>
                        <button
                            aria-label="Open menu"
                            className={`touch-target cursor-pointer transition-colors text-typography-2 sm:hover:text-typography-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1 max-sm:flex max-sm:size-11 max-sm:-mr-2.5 max-sm:items-center max-sm:justify-center sm:flex sm:items-center sm:gap-1 sm:rounded-lg sm:bg-layer-2 sm:shadow-control sm:pl-1 sm:pr-3 sm:py-1.5`}
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
                                        "bx bx-menu bx-sm relative sm:top-0.5"
                                    }
                                ></i>
                            </span>
                            <span className="max-sm:hidden important">
                                Menu
                            </span>
                        </button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Content
                            aria-describedby={undefined}
                            className="fixed inset-0 z-[5002] overflow-y-auto bg-blurDark outline-none backdrop-blur-3xl"
                        >
                            <div className="mx-auto flex w-full max-w-lg flex-col gap-1.5 px-4 pb-10 pt-3 sm:px-6 sm:pt-6">
                                {/* the close button sits where the phone menu button was */}
                                <div className="mb-4 flex min-h-11 items-center justify-between gap-3">
                                    <Dialog.Title className="important min-w-0 truncate text-typography-1">
                                        {organization.name}
                                    </Dialog.Title>
                                    <Dialog.Close
                                        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-typography-1 sm:hover:bg-layer-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1"
                                        aria-label="Close menu"
                                    >
                                        <i
                                            className="bx bx-x bx-sm"
                                            aria-hidden="true"
                                        />
                                    </Dialog.Close>
                                </div>

                                <h5 className={`px-3 ${sectionLabel}`}>
                                    About
                                </h5>

                                {renderMobileButtons(navLinks)}

                                {adminLinks.length > 0 && (
                                    <>
                                        <h5
                                            className={`mt-6 px-3 ${sectionLabel}`}
                                        >
                                            Admin Tools
                                        </h5>
                                        {renderMobileButtons(adminLinks)}
                                    </>
                                )}
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </>
        );
    }

    return (
        <div className={"w-[160px] mt-4"}>
            <h5 className={sectionLabel}>About</h5>
            {renderDesktopList(navLinks)}

            {adminLinks.length > 0 && (
                <div>
                    <div className={"h-px w-5/6 bg-divider my-2"}></div>
                    <h5 className={`mt-6 ${sectionLabel}`}>Admin Tools</h5>
                    {renderDesktopList(adminLinks)}
                </div>
            )}
        </div>
    );
};

export default OrgNav;
