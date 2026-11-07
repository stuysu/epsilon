import React, { FC, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import UserContext from "../../../contexts/UserContext";
import {
    isOpportunitiesPath,
    isStuyActivitiesPath,
    OPPORTUNITY_SUBMISSION_URL,
} from "../../../config/routes";
import useMediaQuery from "../../../utils/useMediaQuery";
import revealOnKeyboardFocus from "../../../utils/revealOnKeyboardFocus";

const STUY_ACTIVITIES_ITEMS = [
    { label: "Catalog", path: "/stuyactivities" },
    { label: "Charter", path: "/charter" },
    { label: "Regulations", path: "/rules" },
    { label: "Archives", path: "/archives" },
    { label: "Support", path: "/activities-support" },
];

const OPPORTUNITIES_ITEMS = [
    { label: "Discover", path: "/opportunities" },
    { label: "Catalog", path: "/opportunities/catalog" },
    { label: "My Opportunities", path: "/opportunities/saved" },
    {
        label: "Submit an Opportunity",
        path: OPPORTUNITY_SUBMISSION_URL,
        external: true,
    },
];

// matches the paragraph text these links used to be, without the link underline;
// the current page is shown brighter, as before
const ITEM_CLASS =
    "important whitespace-nowrap rounded text-[0.9rem] leading-[1.2rem] no-underline transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1";

const SubNavBar: FC = () => {
    const user = useContext(UserContext);
    const isMobile = useMediaQuery("not all and (min-width: 640px)");
    const location = useLocation();

    const isOnStuyActivitiesPage = isStuyActivitiesPath(location.pathname);
    const isOnOpportunitiesPage = isOpportunitiesPath(location.pathname);
    if (!isOnStuyActivitiesPage && !isOnOpportunitiesPage) return null;

    const items: { label: string; path: string; external?: boolean }[] =
        isOnOpportunitiesPage ? OPPORTUNITIES_ITEMS : STUY_ACTIVITIES_ITEMS;
    // only full admins publish bulletins
    const adminPath = isOnOpportunitiesPage ? "/opportunities/admin" : "/admin";
    const adminLink = isOnOpportunitiesPage
        ? user.permission === "ADMIN" && {
              label: "Opportunities Admin",
              path: adminPath,
          }
        : user.permission && { label: "Admin Panel", path: adminPath };
    const isAdminPage =
        location.pathname === adminPath ||
        location.pathname.startsWith(`${adminPath}/`);

    return (
        <nav
            aria-label={
                isOnOpportunitiesPage ? "Opportunities" : "StuyActivities"
            }
            // the scroller clips its content: pb-2 leaves room for the focus
            // outline and -mb-2 cancels it out so the layout doesn't move
            className="pb-2 -mb-2 max-sm:mb-0 max-sm:pb-3 scroll-pe-10 max-[1099px]:[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]"
            style={{
                overflowX: "scroll",
                scrollbarWidth: "none",
                position: isMobile ? "fixed" : "relative",
                top: isMobile ? 0 : undefined,
                left: isMobile ? 0 : undefined,
                backgroundColor: isMobile ? "var(--blur-dark)" : undefined,
                width: isMobile ? "100%" : undefined,
                zIndex: isMobile ? 1000 : undefined,
                borderBottom: isMobile
                    ? "1px solid rgba(255,255,255,0.1)"
                    : undefined,
                backdropFilter: isMobile ? "blur(30px)" : undefined,
            }}
        >
            <div
                className={`relative z-[2] flex flex-row gap-6 ${
                    isMobile ? "ml-4 mt-3" : "ml-12 mt-4"
                }`}
            >
                {items.map(({ label, path, external }) => {
                    const isCurrent = location.pathname === path;
                    const className = `${ITEM_CLASS} ${
                        isCurrent
                            ? "text-typography-1"
                            : "text-typography-2 hover:text-typography-1"
                    }`;
                    return external ? (
                        <a
                            key={path}
                            href={path}
                            target="_blank"
                            rel="noopener noreferrer"
                            onFocus={revealOnKeyboardFocus}
                            className={className}
                        >
                            {label}
                        </a>
                    ) : (
                        <Link
                            key={path}
                            to={path}
                            aria-current={isCurrent ? "page" : undefined}
                            onFocus={revealOnKeyboardFocus}
                            className={className}
                        >
                            {label}
                        </Link>
                    );
                })}

                {adminLink && (
                    <Link
                        to={adminLink.path}
                        onFocus={revealOnKeyboardFocus}
                        // the admin page opens on one of its sub-pages
                        aria-current={isAdminPage ? "page" : undefined}
                        // a thin bar under it marks the admin pages; it is
                        // drawn outside the box so nothing moves
                        className={`${ITEM_CLASS} inline-flex gap-1 text-yellow ${
                            isAdminPage
                                ? "relative after:absolute after:inset-x-0 after:-bottom-[3px] after:h-0.5 after:bg-current"
                                : ""
                        }`}
                    >
                        <i
                            className="bx bx-shield text-base leading-[1.2rem]"
                            aria-hidden="true"
                        />
                        <span>{adminLink.label}</span>
                    </Link>
                )}
                <div className="min-w-4" />
            </div>
        </nav>
    );
};

export default SubNavBar;
