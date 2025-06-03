import { Avatar, Box, Divider, Stack, Typography, useMediaQuery } from "@mui/material";
import React, { CSSProperties, FC, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import UserContext from "../../context/UserContext";
import { useSnackbar } from "notistack";
import { ThemeContext } from "../../context/ThemeProvider";
import { PUBLIC_URL } from "../../../constants";

/** Consolidated list of routes that belong to StuyActivities. */
const STUY_ACTIVITIES_PATHS = [
    "/catalog",
    "/charter",
    "/create",
    "/archives",
    "/rules",
    "/activities-support",
    "/admin",
    "/admin/approve-edit",
    "/admin/approve-pending",
    "/admin/strikes",
    "/admin/send-message",
    "/admin/add-user",
    "/admin/announcements",
    "/admin/rooms",
];

const linkStyle: CSSProperties = {
    color: "inherit",
    textDecoration: "none",
};

const topNavItems = [
    { label: "Home", path: "/", icon: "bx bx-home-alt", external: false },
    {
        label: "StuyActivities",
        path: "/catalog",
        icon: "bx bx-group",
        external: false,
    },
    {
        label: "Calendar",
        path: "/meetings",
        icon: "bx bx-calendar",
        external: false,
    },
    {
        label: "Vote",
        url: "https://vote.stuysu.org",
        path: "/none",
        icon: "bx bx-note",
        external: true,
    },
    {
        label: "Arista",
        url: "https://stuyarista.org/",
        path: "/none",
        icon: "bx bxs-hot",
        external: true,
    },
    {
        label: "Opportunities",
        url: "https://opportunities.stuysu.org",
        path: "/none",
        icon: "bx bx-glasses",
        external: true,
    },
    {
        label: "Apply",
        url: "https://applications.stuysu.org/",
        path: "/none",
        icon: "bx bx-check-circle",
        external: true,
    },
    { label: "About", path: "/about", icon: "bx bx-file", external: false },
] as const;

type TopNavItem = typeof topNavItems[number];

interface TabLinkProps {
    name: string;
    iconClass: string;
    onClick: () => void;
    setIsHovered: (hovered: boolean) => void;
}

const TabLink: FC<TabLinkProps> = ({
    name,
    iconClass,
    onClick,
    setIsHovered,
}) => (
    <>
        <i className={iconClass}></i>
        <span
            className="transition-colors hover:text-gray-300"
            style={{
                marginLeft: 3,
                position: "relative",
                top: 2,
                cursor: "pointer",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onClick={onClick}
        >
            {name}
        </span>
    </>
);

const NavBar: FC = () => {
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fourDigitId, setFourDigitId] = useState<number | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const theme = useContext(ThemeContext);
    const isMobile = useMediaQuery("(max-width: 640px)");
    const wordmarkSrc = theme.colorMode
        ? `${PUBLIC_URL}/wordmark.svg`
        : `${PUBLIC_URL}/wordmark_light.svg`;

    const titleStyle: CSSProperties = {
        color: "inherit",
        fontSize: "25px",
        bottom: "2px",
        right: "10px",
        position: "relative",
        height: "100%",
        display: isMobile ? "none" : "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const topStyle: CSSProperties = {
        width: "100%",
        height: "50px",
        top: "5px",
        pointerEvents: "none",
        position: isMobile ? "absolute" : "relative",
        justifyContent: "space-between",
        display: "flex",
        alignItems: "center",
        paddingRight: "4.5vw",
        paddingLeft: "4.5vw",
        zIndex: 50,
    };

    const itemRefs = useRef<HTMLDivElement[]>([]);
    const [optionUnderline, setOptionUnderline] = useState({
        left: 0,
        width: 0,
    });

    const [isOrgPage, setIsOrgPage] = useState(false);
    useEffect(() => {
        setIsOrgPage(!!document.querySelector("#activity-page"));
    }, [location.pathname]);

    const getActivePaths = (item: TopNavItem): string[] =>
        !item.external && item.path === "/catalog"
            ? STUY_ACTIVITIES_PATHS
            : [item.path];

    const isPageOptnActive = (item: TopNavItem): boolean => {
        if (!item.external && item.path === "/catalog") {
            if (isOrgPage) return true;
            return getActivePaths(item).includes(location.pathname);
        }
        return getActivePaths(item).includes(location.pathname);
    };

    const isOnStuyActivitiesPage = STUY_ACTIVITIES_PATHS.some((p) =>
        location.pathname.startsWith(p),
    );

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            enqueueSnackbar(
                "Error signing out. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }
        setDrawerOpen(false);
        navigate("/");
    };

    // Close drawer on route change
    useEffect(() => setDrawerOpen(false), [location]);

    useEffect(() => {
        const fetchID = async () => {
            const { data, error } = await supabase
                .from("fourdigitids")
                .select("value")
                .maybeSingle();
            if (error) console.error(error);
            else if (data) setFourDigitId(data.value as number);
        };
        fetchID();
    }, [user]);

    // Animate active‑tab underline
    useEffect(() => {
        let currentIndex = topNavItems.findIndex((item) => {
            if (!item.external && item.path === "/catalog") {
                return (
                    getActivePaths(item).includes(location.pathname) ||
                    isOrgPage
                );
            }
            return getActivePaths(item).includes(location.pathname);
        });
        if (currentIndex !== -1 && itemRefs.current[currentIndex]) {
            const el = itemRefs.current[currentIndex];
            setOptionUnderline({ left: el.offsetLeft, width: el.offsetWidth });
        } else {
            setOptionUnderline({ left: 0, width: 0 });
        }
    }, [location.pathname, isOrgPage]);

    // Hide navbar on public landing page when signed‑out
    if (!user?.signed_in && location.pathname === "/")
        return <Box height={20} />;

    return (
        <div>
            {/* Backdrop when hovering over nav items */}
            <div
                className={`max-sm:hidden bg-black/40 fixed left-0 top-0 z-40 h-full w-full backdrop-blur-3xl transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            {/* Top items — logo & user menu */}
            <Box sx={topStyle}>
                {/* Logo / Wordmark */}
                <Box sx={titleStyle}>
                    <span
                        style={{ ...linkStyle, cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    >
                        <img
                            src={wordmarkSrc}
                            alt="Epsilon"
                            style={{
                                marginTop: 10,
                                maxWidth: 100,
                                height: "auto",
                                position: "relative",
                                zIndex: 1,
                            }}
                        />
                    </span>
                </Box>

                {/* User dropdown */}
                <div className="pointer-events-auto absolute sm:relative flex flex-row justify-end sm:top-1 -top-20 sm:right-0 right-8">
                    <div
                        className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg bg-neutral-800 pl-1.5 pr-1.5 shadow-[inset_0px_0px_2px_0px_rgba(255,255,255,0.3)] h-10"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                    >
                        <Avatar
                            style={{ width: 30, height: 30, borderRadius: 4 }}
                            src={user.picture}
                        />
                        <p className="relative top-0.5 pr-2 sm:block hidden">{`${user.first_name} ${user.last_name}`}</p>
                        <i className="bx bx-chevron-down bx-sm hidden sm:inline-block pr-1" />
                    </div>

                    {/* Drawer */}
                    <div
                        className={`absolute sm:top-14 top-auto sm:bottom-auto bottom-0 sm:right-auto right-16
                        z-50 flex w-72 flex-col gap-2 rounded-lg bg-neutral-800 sm:bg-opacity-80 p-5
                        backdrop-blur-xl shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.15),_0_10px_25px_rgba(0,0,0,0.5)]
                        transition-all duration-300 ${
                            drawerOpen
                                ? "translate-y-0 opacity-100"
                                : "pointer-events-none sm:-translate-y-3 max-sm:translate-x-5 opacity-0"
                        }`}
                    >
                        {!user?.signed_in ? (
                            <p
                                style={{ fontVariationSettings: "'wght' 700" }}
                                className="cursor-pointer transition-colors hover:text-neutral-300"
                                onClick={() => navigate("/")}
                            >
                                <i
                                    className={
                                        "bx bx-user-circle relative top-px mr-1"
                                    }
                                ></i>
                                Sign In
                            </p>
                        ) : (
                            <>
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className="cursor-pointer transition-colors hover:text-neutral-300"
                                    onClick={() => navigate("/profile")}
                                >
                                    My Profile
                                </p>
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className="cursor-not-allowed opacity-30"
                                >
                                    My Documents
                                </p>
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className="cursor-pointer transition-colors hover:text-neutral-300"
                                    onClick={() => navigate("/settings")}
                                >
                                    Communication Options
                                </p>
                                <div className="bg-neutral-400 mt-1 mb-2 h-px w-full opacity-30" />
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className="cursor-pointer transition-colors hover:text-neutral-300"
                                    onClick={() =>
                                        navigate("/modules/attendance")
                                    }
                                >
                                    Attendance Module
                                </p>
                                <div className="bg-neutral-400 mt-1 mb-2 h-px w-full opacity-30" />
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className="cursor-pointer transition-colors hover:text-neutral-300"
                                    onClick={() => {
                                        theme.toggleColorMode();
                                        if (theme.colorMode) {
                                            enqueueSnackbar(
                                                "Light mode is in development. It is not recommended for use at this time.",
                                                { variant: "warning" },
                                            );
                                        }
                                    }}
                                >
                                    {theme.colorMode
                                        ? "Light Mode Beta"
                                        : "Dark Mode"}
                                </p>
                                <div className="bg-neutral-400 mt-1 mb-2 h-px w-full opacity-30" />
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className="cursor-pointer transition-colors text-red-500 hover:text-red-600"
                                    onClick={signOut}
                                >
                                    Sign Out
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </Box>

            {/* Top‑level tabs */}
            <Box
                onMouseLeave={() => setIsHovered(false)}
                overflow={"scroll"}
                sx={{
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                {/* Frosted backdrop */}
                {theme.colorMode && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            width: "100%",
                            height: 100,
                            backgroundImage: `url(${PUBLIC_URL}/textures/menubar.png)`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            pointerEvents: "none",
                            opacity: 0.5,
                            filter: "blur(10px)",
                            zIndex: 1,
                        }}
                    />
                )}

                <Stack
                    direction="row"
                    spacing={3.5}
                    sx={{
                        zIndex: 40,
                        fontSize: 20,
                        fontVariationSettings: "'wght' 700",
                        position: "relative",
                        marginLeft: "4.5vw",
                        mt: isMobile ? 2 : 3,
                        mb: isMobile ? 2 : 1.5,
                    }}
                >
                    {topNavItems.map((item, index) => (
                        <div
                            key={`${item.path}${index}`}
                            ref={(el) => {
                                if (el) itemRefs.current[index] = el;
                            }}
                            className={`flex items-start flex-nowrap cursor-pointer transition-colors ${
                                isPageOptnActive(item)
                                    ? "text-gray-300"
                                    : "sm:hover:text-gray-300"
                            }`}
                            onMouseEnter={() => setIsHovered(true)}
                            onClick={() => {
                                if (item.external && item.url) {
                                    window.location.href = item.url;
                                } else {
                                    navigate(item.path);
                                }
                                setTimeout(() => setIsHovered(false), 300);
                            }}
                            style={{ position: "relative" }}
                        >
                            <i className={item.icon}></i>
                            {!isMobile && (
                                <span
                                    style={{
                                        marginLeft: 3,
                                        position: "relative",
                                        top: 3,
                                    }}
                                >
                                    {item.label}
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Animated underline */}
                    {!isMobile && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: -12,
                                left: optionUnderline.left - 27,
                                width: optionUnderline.width,
                                height: 1,
                                backgroundColor: "#FFFFFF80",
                                transition: "left 0.3s,width 0.3s",
                                pointerEvents: "none",
                            }}
                        />
                    )}
                    <div className={"min-w-3"}></div>
                </Stack>
            </Box>

            {/* Divider under main nav */}
            <Divider sx={{ position: "relative", zIndex: 45, bottom: 1 }} />

            {/* Contextual sub‑nav for StuyActivities pages */}
            {isOnStuyActivitiesPage && (
                <div
                    className={"max-sm:pb-4"}
                    style={{
                        overflowX: "scroll",
                        scrollbarWidth: "none",
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={3}
                        ml="4.5vw"
                        mt={2}
                        position="relative"
                        zIndex={1002}
                    >
                        {(
                            [
                                { label: "Catalog", path: "/catalog" },
                                { label: "Charter", path: "/charter" },
                                { label: "Regulations", path: "/rules" },
                                { label: "Archives", path: "/archives" },
                                {
                                    label: "Support",
                                    path: "/activities-support",
                                },
                            ] as const
                        ).map(({ label, path }) => (
                            <Typography
                                key={path}
                                className="cursor-pointer transition-opacity whitespace-nowrap"
                                onClick={() => navigate(path)}
                                sx={{
                                    fontVariationSettings: "'wght' 700",
                                    opacity:
                                        location.pathname === path ? 1 : 0.5,
                                    color: "rgb(209 213 219 / var(--tw-text-opacity, 1))",
                                }}
                            >
                                {label}
                            </Typography>
                        ))}

                        {/* Admin panel shortcut */}
                        <div
                            onClick={() => navigate("/admin")}
                            className="inline-flex cursor-pointer whitespace-nowrap gap-1 text-yellow-500"
                        >
                            <i className="bx bx-shield" />
                            <Typography
                                sx={{
                                    fontVariationSettings: "'wght' 700",
                                    color: "rgb(234 179 8 / var(--tw-text-opacity, 1))",
                                }}
                            >
                                Admin Panel
                            </Typography>
                        </div>
                        <div className={"min-w-4"}></div>
                    </Stack>
                </div>
            )}
        </div>
    );
};

export default NavBar;
