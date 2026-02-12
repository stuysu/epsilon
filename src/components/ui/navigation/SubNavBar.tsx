import { Stack, useMediaQuery } from "@mui/material";
import React, { FC, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserContext from "../../../contexts/UserContext";
import {
    isAboutPath,
    isOpportunitiesPath,
    isSchedulePath,
    isStuyActivitiesPath,
} from "../../../config/routes";

type SubNavBarProps = {
    forceVisible?: boolean;
    // if pointer is over floating subnav so parent can hold nav-mode.
    onHoverChange?: (hovered: boolean) => void;
    floating?: boolean;
    variant?: "activities" | "schedule" | "opportunities" | "about";
};

const SubNavBar: FC<SubNavBarProps> = ({
    forceVisible = false,
    onHoverChange,
    floating = false,
    variant = "activities",
}) => {
    const user = useContext(UserContext);
    const isMobile = useMediaQuery("(max-width: 640px)");
    const navigate = useNavigate();
    const location = useLocation();

    const isOnStuyActivitiesPage = isStuyActivitiesPath(location.pathname);
    const isOnSchedulePage = isSchedulePath(location.pathname);
    const isOnOpportunitiesPage = isOpportunitiesPath(location.pathname);
    const isOnAboutPage = isAboutPath(location.pathname);
    const activityItems = [
        { label: "Catalog", path: "/stuyactivities" },
        { label: "Charter", path: "/stuyactivities/charter" },
        { label: "Regulations", path: "/stuyactivities/rules" },
        { label: "Archives", path: "/stuyactivities/archives" },
        { label: "Support", path: "/stuyactivities/support" },
    ] as const;
    const opportunitiesItems = [
        { label: "Discover", path: "/opportunities" },
        { label: "Catalog", path: "/opportunities/catalog" },
        { label: "My Opportunities", path: "/opportunities/my-opportunities" },
        { label: "Advertise", path: "/opportunities/advertise" },
    ] as const;
    const scheduleItems = [
        { label: "Calendar", path: "/meetings" },
        { label: "Special Events", path: "/meetings/special-events" },
    ] as const;
    const aboutItems = [
        { label: "Credits", path: "/about" },
        { label: "Join Us", path: "/about/join-us" },
        { label: "Design", path: "/about/design" },
        { label: "Epsilon Support", path: "/about/epsilon-support" },
        { label: "Blog", path: "/about/blog" },
        { label: "Our Services", path: "/about/our-services" },
    ] as const;
    const visibleItems = floating
        ? variant === "activities"
            ? activityItems
            : variant === "schedule"
              ? scheduleItems
            : variant === "opportunities"
              ? opportunitiesItems
              : aboutItems
        : isOnStuyActivitiesPage
          ? activityItems
          : isOnSchedulePage
            ? scheduleItems
          : isOnOpportunitiesPage
            ? opportunitiesItems
            : aboutItems;
    const isActivitySubNav = floating
        ? variant === "activities"
        : isOnStuyActivitiesPage;

    const handleNavigate = (path: string) => {
        // Clicking an item should collapse hover-preview/nav-mode immediately.
        onHoverChange?.(false);
        navigate(path);
    };

    const isItemActive = (path: string) => {
        if (path === "/opportunities") {
            return (
                location.pathname === "/opportunities" ||
                location.pathname === "/opportunities/discover"
            );
        }
        if (path === "/meetings") {
            return (
                location.pathname === "/meetings" ||
                location.pathname === "/meetings/calendar"
            );
        }
        if (path === "/about") {
            return (
                location.pathname === "/about" ||
                location.pathname === "/about/credits"
            );
        }
        return location.pathname === path;
    };

    const links = (
        <Stack
            direction="row"
            spacing={3}
            ml={isMobile ? "1rem" : "3rem"}
            mt={isMobile ? 1.5 : 2}
            position="relative"
            zIndex={2}
        >
            {visibleItems.map(({ label, path }) => (
                <p
                    key={path}
                    className="cursor-pointer whitespace-nowrap important text-typography-1"
                    onClick={() => handleNavigate(path)}
                    style={{
                        opacity: isItemActive(path) ? 1 : 0.5,
                    }}
                >
                    {label}
                </p>
            ))}

            {isActivitySubNav && user.permission && (
                <div
                    onClick={() => handleNavigate("/admin")}
                    className="inline-flex cursor-pointer whitespace-nowrap gap-1 text-yellow"
                >
                    <i className="bx bx-shield pt-px" />
                    <p className="cursor-pointer whitespace-nowrap important text-yellow">
                        Admin Panel
                    </p>
                </div>
            )}
            <div className="min-w-4" />
        </Stack>
    );

    if (floating) {
        if (isMobile) return null;
        if (!forceVisible) return null;
        return (
            <div
                className="max-sm:hidden absolute top-full left-0 right-0 z-50 pointer-events-none"
            >
                <div
                    className="relative pb-10 -mb-10 pointer-events-auto"
                    onMouseEnter={() => onHoverChange?.(true)}
                    onMouseLeave={() => onHoverChange?.(false)}
                    style={{
                        overflowX: "scroll",
                        scrollbarWidth: "none",
                    }}
                >
                    {links}
                </div>
            </div>
        );
    }

    // non floating subnav should render only on modules that define one
    if (
        !isOnStuyActivitiesPage &&
        !isOnSchedulePage &&
        !isOnOpportunitiesPage &&
        !isOnAboutPage
    )
        return null;

    return (
        <div
            className="max-sm:pb-3"
            style={{
                overflowX: "scroll",
                scrollbarWidth: "none",
                position: isMobile ? "fixed" : undefined,
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
            {links}
        </div>
    );
};

export default SubNavBar;
