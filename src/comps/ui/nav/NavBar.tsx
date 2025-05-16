import {
    Typography,
    Box,
    Divider,
    Avatar,
    Stack,
    useMediaQuery,
} from "@mui/material";
import React, {
    CSSProperties,
    useContext,
    useEffect,
    useState,
    useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import UserContext from "../../context/UserContext";
import { useSnackbar } from "notistack";
import { ThemeContext } from "../../context/ThemeProvider";
import { PUBLIC_URL } from "../../../constants";

const navStyles: CSSProperties = {
    width: "100%",
    height: "50px",
    top: "5px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 5.5,
    paddingLeft: 5.5,
    position: "relative",
    zIndex: 50,
};

const titleStyle: CSSProperties = {
    color: "inherit",
    fontSize: "25px",
    bottom: "2px",
    position: "relative",
    height: "100%",
    display: "flex",
    alignItems: "center",
};

const linkStyle: CSSProperties = {
    color: "inherit",
    textDecoration: "none",
};

const topNavItems = [
    {
        label: "Home",
        path: "/",
        icon: "bx bx-home-alt",
        external: false,
    },
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
        label: "About",
        path: "/about",
        icon: "bx bx-file",
        external: false,
    },
];

const NavBar = () => {
    const showBigNav = useMediaQuery("(min-width:950px)");
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fourDigitId, setFourDigitId] = useState<Number | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const theme = useContext(ThemeContext);
    const wordmarkSrc = theme.colorMode
        ? `${PUBLIC_URL}/wordmark.svg`
        : `${PUBLIC_URL}/wordmark_light.svg`;

    const itemRefs = useRef<HTMLDivElement[]>([]);
    const [optionUnderline, setOptionUnderline] = useState({
        left: 0,
        width: 0,
    });

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return enqueueSnackbar(
                "Error signing out. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }
        setDrawerOpen(false);
        navigate("/");
    };

    useEffect(() => {
        setDrawerOpen(false);
    }, [location]);

    useEffect(() => {
        const fetchID = async () => {
            const { data, error } = await supabase
                .from("fourdigitids")
                .select("value")
                .maybeSingle();
            if (error) console.log(error);
            else if (data) setFourDigitId(data.value as Number);
        };
        fetchID();
    }, [user]);

    const getActivePaths = (item: (typeof topNavItems)[0]) => {
        if (!item.external && item.path === "/catalog") {
            return [
                "/catalog",
                "/create",
                "/rules",
                "/admin/approve-edit",
                "/admin/approve-pending",
                "/admin/strikes",
                "/admin/send-message",
                "/admin/announcements",
                "/admin/rooms",
            ];
        }
        return [item.path];
    };

    const isPageOptnActive = (item: (typeof topNavItems)[0]) =>
        getActivePaths(item).includes(location.pathname);

    const isOnStuyActivitiesPage =
        ["/catalog", "/create", "/rules"].some((p) =>
            location.pathname.startsWith(p),
        ) || location.pathname.startsWith("/admin");

    useEffect(() => {
        const currentIndex = topNavItems.findIndex(
            (item) =>
                !item.external &&
                getActivePaths(item).includes(location.pathname),
        );

        if (currentIndex !== -1 && itemRefs.current[currentIndex]) {
            const el = itemRefs.current[currentIndex];
            setOptionUnderline({
                left: el.offsetLeft,
                width: el.offsetWidth,
            });
        } else {
            setOptionUnderline({ left: 0, width: 0 });
        }
    }, [location.pathname, showBigNav]);

    if (!user?.signed_in && location.pathname === "/") {
        return <Box height={20} />;
    }

    return (
        <>
            <div
                className={`bg-black/40 z-40 fixed left-0 w-full h-full backdrop-blur-3xl transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            ></div>

            <Box sx={navStyles}>
                <Box sx={titleStyle}>
                    <span
                        style={{ ...linkStyle, cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    >
                        <img
                            src={wordmarkSrc}
                            alt="Epsilon"
                            style={{
                                marginTop: "10px",
                                maxWidth: "100px",
                                height: "auto",
                                position: "relative",
                                zIndex: 1,
                            }}
                        />
                    </span>
                </Box>

                <div className={"relative flex flex-row justify-end"}>
                    <div
                        className={
                            "flex flex-row items-center justify-center gap-2 bg-neutral-800 rounded-lg pl-1.5 pr-2.5 h-10 shadow-[inset_0px_0px_2px_0px_rgba(255,255,255,0.3)] cursor-pointer"
                        }
                        onClick={() => setDrawerOpen(!drawerOpen)}
                    >
                        <Avatar
                            style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "5px",
                            }}
                            src={user.picture}
                        />
                        <p
                            className={"top-0.5 relative pr-2"}
                        >{`${user.first_name} ${user.last_name}`}</p>
                        <i className="bx bx-chevron-down bx-sm"></i>
                    </div>
                    {drawerOpen && (
                        <div
                            className={
                                "flex flex-col gap-2 p-5 absolute w-72 top-14 rounded-lg z-50 bg-neutral-800/80 backdrop-blur-xl shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.15),_0_10px_25px_rgba(0,0,0,0.5)]"
                            }
                        >
                            <p
                                className={
                                    "cursor-pointer hover:text-white transition-colors"
                                }
                                onClick={() => navigate("/profile")}
                            >
                                My Profile
                            </p>
                            <p
                                className={
                                    "cursor-pointer hover:text-white transition-colors"
                                }
                                onClick={() => navigate("/settings")}
                            >
                                Communication Options
                            </p>
                            <div
                                className={
                                    "bg-neutral-600 w-full h-px mb-1.5 mt-1 opacity-50"
                                }
                            />

                            <p
                                className={
                                    "cursor-pointer hover:text-white transition-colors"
                                }
                                onClick={() => navigate("/modules/attendance")}
                            >
                                Attendance Module
                            </p>

                            <div
                                className={
                                    "bg-neutral-600 w-full h-px mb-1.5 mt-1 opacity-50"
                                }
                            />
                            <p>Report an Issue</p>
                            <div
                                className={
                                    "bg-neutral-600 w-full h-px mb-1.5 mt-1 opacity-50"
                                }
                            />
                            <p
                                onClick={() => {
                                    theme.toggleColorMode();
                                    if (theme.colorMode) {
                                        enqueueSnackbar(
                                            "Light mode is experimental.",
                                            {
                                                variant: "warning",
                                            },
                                        );
                                    }
                                }}
                                className={
                                    "cursor-pointer hover:text-white transition-colors"
                                }
                            >
                                Light Mode Beta
                            </p>
                            <div
                                className={
                                    "bg-neutral-600 w-full h-px mb-1.5 mt-1 opacity-50"
                                }
                            />
                            <p
                                className={
                                    "cursor-pointer text-red-500 hover:text-red-600 transition-colors"
                                }
                                onClick={signOut}
                            >
                                Sign Out
                            </p>
                        </div>
                    )}
                </div>
            </Box>

            <Box
                onMouseLeave={() => setIsHovered(false)}
            >
                <Box
                    sx={{
                        position: "absolute",
                        width: "100%",
                        height: "100px",
                        top: "0px",
                        backgroundImage: `url(${PUBLIC_URL}/textures/menubar.png)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        pointerEvents: "none",
                        opacity: 0.5,
                        filter: "blur(10px)",
                        zIndex: 1,
                        display: showBigNav ? "block" : "none",
                    }}
                />
                <Stack
                    direction="row"
                    spacing={3.5}
                    sx={{
                        zIndex: 40,
                        fontSize: "20px",
                        fontVariationSettings: "'wght' 700",
                        position: "relative",
                        marginLeft: 7,
                        marginTop: 3,
                        marginBottom: 1,
                        display: showBigNav ? "flex" : "none",
                    }}
                >
                    {topNavItems.map((item, index) => (
                        <div
                            key={item.path + index}
                            ref={(el) => {
                                if (el) itemRefs.current[index] = el;
                            }}
                            className={`transition-colors cursor-pointer ${
                                isPageOptnActive(item)
                                    ? "text-gray-300"
                                    : "hover:text-gray-300"
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
                            <span
                                style={{
                                    marginLeft: "3px",
                                    position: "relative",
                                    top: "-1px",
                                }}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}

                    <div
                        style={{
                            position: "absolute",
                            bottom: -8,
                            left: optionUnderline.left - 27,
                            width: optionUnderline.width,
                            height: "1px",
                            backgroundColor: "#FFFFFF80",
                            transition: "left 0.3s, width 0.3s",
                            pointerEvents: "none",
                        }}
                    />
                </Stack>
            </Box>

            <Divider style={{ position: "relative", zIndex: 45, bottom: 1 }} />

            {isOnStuyActivitiesPage && (
                <Stack
                    marginLeft={7}
                    marginTop={2}
                    direction="row"
                    spacing={3}
                    zIndex={1002}
                    position="relative"
                >
                    <Typography
                        className="transition-opacity cursor-pointer"
                        onClick={() => navigate("/catalog")}
                        sx={{
                            fontVariationSettings: "'wght' 700",
                            opacity: location.pathname === "/catalog" ? 1 : 0.5,
                        }}
                        color="rgb(209 213 219 / var(--tw-text-opacity, 1))"
                    >
                        Catalog
                    </Typography>
                    <Typography
                        className="transition-opacity cursor-pointer"
                        onClick={() => navigate("/create")}
                        sx={{
                            fontVariationSettings: "'wght' 700",
                            opacity: location.pathname === "/create" ? 1 : 0.5,
                        }}
                        color="rgb(209 213 219 / var(--tw-text-opacity, 1))"
                    >
                        Charter
                    </Typography>
                    <Typography
                        className="transition-opacity cursor-pointer"
                        onClick={() => navigate("/rules")}
                        sx={{
                            fontVariationSettings: "'wght' 700",
                            opacity: location.pathname === "/rules" ? 1 : 0.5,
                        }}
                        color="rgb(209 213 219 / var(--tw-text-opacity, 1))"
                    >
                        Regulations
                    </Typography>

                    <Typography
                        className="transition-opacity cursor-pointer"
                        onClick={() =>
                            window.open(
                                "https://docs.google.com/spreadsheets/d/1TyFnEPhY3gM-yRJKYDJkQSfHC6OsvC5ftkkoahjVcCU/edit?gid=485693778#gid=485693778",
                                "_blank",
                            )
                        }
                        sx={{
                            fontVariationSettings: "'wght' 700",
                            opacity: 0.5,
                        }}
                        color="rgb(209 213 219 / var(--tw-text-opacity, 1))"
                    >
                        Archive
                    </Typography>

                    <div
                        onClick={() => navigate("/admin")}
                        className="inline-flex gap-1 text-yellow-500 cursor-pointer"
                    >
                        <i className="bx bx-shield"></i>
                        <Typography
                            sx={{
                                fontVariationSettings: "'wght' 700",
                                color: "rgb(234 179 8 / var(--tw-text-opacity, 1))",
                            }}
                        >
                            Admin Panel
                        </Typography>
                    </div>
                </Stack>
            )}
        </>
    );
};

export default NavBar;
