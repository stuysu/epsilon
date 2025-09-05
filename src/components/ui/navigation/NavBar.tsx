import { Avatar, Box, Stack, useMediaQuery } from "@mui/material";
import React, {
    CSSProperties,
    FC,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import UserContext from "../../../contexts/UserContext";
import { useSnackbar } from "notistack";
import { ThemeContext } from "../../../contexts/ThemeProvider";
import { PUBLIC_URL } from "../../../config/constants";
import { isStuyActivitiesPath, topNavItems } from "../../../config/routes";
import Divider from "../Divider";

const linkStyle: CSSProperties = {
    color: "inherit",
    textDecoration: "none",
};

type TopNavItem = (typeof topNavItems)[number];

const NavBar: FC = () => {
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const theme = useContext(ThemeContext);
    const isMobile = useMediaQuery("(max-width: 640px)");
    const wordmarkSrc =
        theme.effectiveMode === "dark"
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
        paddingRight: "3rem",
        paddingLeft: "3rem",
        zIndex: 50,
    };

    const itemRefs = useRef<HTMLDivElement[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [optionUnderline, setOptionUnderline] = useState({
        left: 0,
        width: 0,
    });

    const [isOrgPage, setIsOrgPage] = useState(false);
    useEffect(() => {
        setIsOrgPage(!!document.querySelector("#activity-page"));
    }, [location.pathname]);

    const getActivePaths = (item: TopNavItem): string[] => [item.path];

    const isPageOptnActive = (item: TopNavItem): boolean => {
        if (!item.external && item.path === "/stuyactivities") {
            if (isOrgPage) return true;
            return isStuyActivitiesPath(location.pathname);
        }
        return getActivePaths(item).includes(location.pathname);
    };

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

    const updateUnderline = React.useCallback(() => {
        const currentIndex = topNavItems.findIndex((item) => {
            if (!item.external && item.path === "/stuyactivities") {
                return isStuyActivitiesPath(location.pathname) || isOrgPage;
            }
            return getActivePaths(item).includes(location.pathname);
        });

        const parent = containerRef.current;
        const el = currentIndex >= 0 ? itemRefs.current[currentIndex] : null;

        if (!parent || !el) {
            setOptionUnderline({ left: 0, width: 0 });
            return;
        }

        const parentRect = parent.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        setOptionUnderline({
            left: rect.left - parentRect.left,
            width: rect.width,
        });
    }, [location.pathname, isOrgPage]);

    useLayoutEffect(() => {
        let raf = requestAnimationFrame(updateUnderline);

        const onResize = () => requestAnimationFrame(updateUnderline);
        const onPageShow = () => requestAnimationFrame(updateUnderline);
        window.addEventListener("resize", onResize);
        window.addEventListener("pageshow", onPageShow);
        document?.fonts?.ready?.then?.(() =>
            requestAnimationFrame(updateUnderline),
        );
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("pageshow", onPageShow);
        };
    }, [updateUnderline, isMobile]);

    if (!user?.signed_in && location.pathname === "/")
        return <Box height={20} />;

    return (
        <nav>
            {/* Backdrop when hovering over nav items */}
            <div
                className={`max-sm:hidden bg-blurDark fixed left-0 top-0 z-40 h-full w-full backdrop-blur-2xl transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            {/* Top items — logo & user dropdown menu */}
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
                                marginTop: 14,
                                maxWidth: 100,
                                height: "auto",
                                position: "relative",
                                zIndex: 1,
                            }}
                        />
                    </span>
                </Box>

                {/* User dropdown */}
                <div className="pointer-events-auto absolute sm:relative flex flex-row justify-end sm:top-1 -top-10 sm:right-0 right-3">
                    <div
                        className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg bg-bg sm:bg-layer-1 pl-1.5 pr-1.5 shadow-control h-10"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                    >
                        <Avatar
                            style={{ width: 30, height: 30, borderRadius: 4 }}
                            src={user.picture}
                        />
                        <p className="pr-2 sm:block hidden">
                            {user?.signed_in
                                ? `${user.first_name} ${user.last_name}`
                                : "Guest"}
                        </p>
                        <i
                            className={`text-typography-2 bx bx-chevron-down bx-sm inline-block pr-1 transition-transform duration-200 ${drawerOpen ? "bx-flip-vertical" : ""}`}
                        />
                    </div>

                    {/* Drawer */}
                    <div
                        className={`absolute sm:top-14 top-auto sm:bottom-auto bottom-12 sm:right-auto right-0
                        z-50 flex w-72 flex-col gap-2 rounded-lg sm:bg-blurLight bg-bg p-5
                        backdrop-blur-xl shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.15),_0_10px_25px_rgba(0,0,0,0.5)]
                        transition-all duration-300 ${
                            drawerOpen
                                ? "translate-y-0 opacity-100"
                                : "pointer-events-none sm:-translate-y-3 translate-y-3 opacity-0"
                        }`}
                    >
                        {!user?.signed_in ? (
                            <p
                                style={{ fontVariationSettings: "'wght' 700" }}
                                className="cursor-pointer transition-colors hover:text-typography-3"
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
                                    className="cursor-pointer transition-colors hover:text-typography-3"
                                    onClick={() => navigate("/profile")}
                                >
                                    Profile
                                </p>
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className="cursor-pointer transition-colors hover:text-typography-3"
                                    onClick={() => navigate("/preferences")}
                                >
                                    Preferences
                                </p>
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className="cursor-pointer transition-colors hover:text-typography-3"
                                    onClick={() => navigate("/communications")}
                                >
                                    Communications
                                </p>
                                <Divider />
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className="cursor-pointer transition-[filter] text-red hover:brightness-75"
                                    onClick={signOut}
                                >
                                    Sign Out
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </Box>

            {/* Top-level tabs */}
            <Box
                onMouseLeave={() => setIsHovered(false)}
                overflow={"scroll"}
                sx={{
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                }}
            >
                {/* colorful backdrop */}
                {theme.effectiveMode === "dark" && (
                    <div
                        className="absolute top-0 w-full h-[100px] bg-cover bg-center pointer-events-none opacity-60 blur-[15px] z-[1]"
                        style={{
                            backgroundImage: `url(${PUBLIC_URL}/textures/navigation.png)`,
                        }}
                    />
                )}

                <Stack
                    ref={containerRef}
                    direction="row"
                    spacing={3}
                    sx={{
                        zIndex: 40,
                        fontSize: 20,
                        fontVariationSettings: "'wght' 700",
                        position: "relative",
                        marginLeft: isMobile ? "1rem" : "3rem",
                        mt: isMobile ? 2 : 3,
                        mb: isMobile ? 2 : 0,
                    }}
                >
                    {topNavItems.map((item, index) => (
                        <div
                            key={`${item.path}${index}`}
                            ref={(el) => {
                                if (el) itemRefs.current[index] = el;
                            }}
                            className={`text-nowrap flex items-start flex-nowrap cursor-pointer transition-colors ${
                                isPageOptnActive(item)
                                    ? "text-typography-1"
                                    : "sm:hover:text-typography-1 text-typography-2"
                            }`}
                            onMouseEnter={() => setIsHovered(true)}
                            onClick={() => {
                                if (item.external && (item as any).url) {
                                    window.open((item as any).url!, "_blank");
                                } else {
                                    navigate(item.path);
                                }
                                setTimeout(() => setIsHovered(false), 300);
                                requestAnimationFrame(updateUnderline);
                            }}
                            style={{ position: "relative" }}
                        >
                            <i className={item.icon}></i>
                            {!isMobile && (
                                <span
                                    style={{
                                        marginLeft: 3,
                                        position: "relative",
                                        bottom: 5,
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
                            className="absolute bottom-0 h-px bg-typography-1 pointer-events-none transition-[left,width] duration-300"
                            style={{
                                left: optionUnderline.left - 23,
                                width: optionUnderline.width,
                            }}
                        />
                    )}
                    <div className={"min-w-3"}></div>
                </Stack>
            </Box>

            {/* Divider under main nav */}
            <div
                className={
                    "max-sm:hidden relative z-[45] bottom-px w-full h-px bg-divider"
                }
            />
        </nav>
    );
};

export default NavBar;
