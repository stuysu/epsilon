import React, { FC, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import UserContext from "../../../contexts/UserContext";
import { isStuyActivitiesPath } from "../../../config/routes";
import useMediaQuery from "../../../utils/useMediaQuery";
import revealOnKeyboardFocus from "../../../utils/revealOnKeyboardFocus";

const STUY_ACTIVITIES_ITEMS = [
    { label: "Catalog", path: "/stuyactivities" },
    { label: "Charter", path: "/charter" },
    { label: "Regulations", path: "/rules" },
    { label: "Archives", path: "/archives" },
    { label: "Support", path: "/activities-support" },
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
    if (!isOnStuyActivitiesPage) return null;

    return (
        <nav
            aria-label="StuyActivities"
            className="max-sm:pb-3 scroll-pe-10 max-[1099px]:[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]"
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
                {STUY_ACTIVITIES_ITEMS.map(({ label, path }) => {
                    const isCurrent = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            aria-current={isCurrent ? "page" : undefined}
                            onFocus={revealOnKeyboardFocus}
                            className={`${ITEM_CLASS} ${
                                isCurrent
                                    ? "text-typography-1"
                                    : "text-typography-2 hover:text-typography-1"
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}

                {user.permission && (
                    <Link
                        to="/admin"
                        onFocus={revealOnKeyboardFocus}
                        // /admin opens on one of its sub-pages
                        aria-current={
                            location.pathname === "/admin" ||
                            location.pathname.startsWith("/admin/")
                                ? "page"
                                : undefined
                        }
                        className={`${ITEM_CLASS} inline-flex gap-1 text-yellow`}
                    >
                        <i
                            className="bx bx-shield text-base leading-[1.2rem]"
                            aria-hidden="true"
                        />
                        <span>Admin Panel</span>
                    </Link>
                )}
                <div className="min-w-4" />
            </div>
        </nav>
    );
};

export default SubNavBar;
