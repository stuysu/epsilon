import {
    Typography,
    Box,
    Drawer,
    List,
    ListItemText,
    Divider,
    ListSubheader,
    ListItemButton,
    ListItemIcon,
    IconButton,
    Avatar,
    Stack, useMediaQuery,
} from "@mui/material";
import {
    Brightness4Rounded,
    Brightness7Rounded,
    Menu,
    PersonSearch,
} from "@mui/icons-material";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import UserContext from "../../context/UserContext";
import { useSnackbar } from "notistack";
import OrgBar from "../../pages/home/ui/OrgBar";
import { ThemeContext } from "../../context/ThemeProvider";
import { PUBLIC_URL } from "../../../constants";

/* Navbar Button Icons */
import HomeIcon from "@mui/icons-material/Home";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SettingsIcon from "@mui/icons-material/Settings";
import FeedIcon from "@mui/icons-material/Feed";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import InfoIcon from "@mui/icons-material/Info";
import GavelIcon from "@mui/icons-material/Gavel";
import ArchiveIcon from "@mui/icons-material/Archive";
import AsyncButton from "../AsyncButton";

const navStyles: CSSProperties = {
    width: "100%",
    height: "50px",
    display: "flex",
    flexWrap: "wrap",
    position: "relative",
    zIndex: 50,
};

const titleStyle: CSSProperties = {
    color: "inherit",
    fontSize: "25px",
    height: "100%",
    display: "flex",
    alignItems: "center",
};

const linkStyle: CSSProperties = {
    color: "inherit",
    textDecoration: "none",
};

const NavBar = () => {
    const showBigNav = useMediaQuery("(min-width:950px)");
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fourDigitId, setFourDigitId] = useState<Number | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation(); // disable drawer when location changes
    const navigate = useNavigate();

    const theme = useContext(ThemeContext);
    const wordmarkSrc = theme.colorMode
        ? `${PUBLIC_URL}/wordmark.svg`
        : `${PUBLIC_URL}/wordmark_light.svg`;

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

    return (
        <>
            <div
                className={`bg-black/40 z-50 fixed left-0 w-full h-full backdrop-blur-3xl transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            ></div>

            <Box sx={navStyles}>
                <AsyncButton
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    style={{
                        maxWidth: "50px",
                        maxHeight: "50px",
                        minWidth: "50px",
                        minHeight: "50px",
                    }}
                    sx={{ borderRadius: 50 }}
                >
                    <Menu />
                </AsyncButton>
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
                <Box
                    sx={{
                        width: "100px",
                        height: "100%",
                        position: "absolute",
                        right: 0,
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                    }}
                >
                    <IconButton
                        onClick={() => {
                            theme.toggleColorMode();
                            if (theme.colorMode) {
                                enqueueSnackbar("Light mode is experimental.", {variant: "warning"});
                            }
                        }}
                        color="inherit"
                    >
                        {theme.colorMode ? (
                            <Brightness4Rounded />
                        ) : (
                            <Brightness7Rounded />
                        )}
                    </IconButton>
                </Box>
            </Box>

            <Box
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}>
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
                        display: showBigNav ? "block": "none",
                    }}
                />
                <Stack
                    direction="row"
                    spacing={3.5}
                    sx={{
                        zIndex: 50,
                        fontSize: "20px",
                        fontVariationSettings: "'wght' 700",
                        position: "relative",
                        marginLeft: 7,
                        marginTop: 3,
                        marginBottom: 1,
                        display: showBigNav ? "flex" : "none",
                    }}
                >
                    <i className="bx bx-home-alt"></i>
                    <span
                        className={"transition-colors hover:text-gray-300"}
                        style={{
                            marginLeft: "3px",
                            position: "relative",
                            top: "2px",
                            cursor: "pointer"
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onClick={() => {
                            navigate("/");
                            setTimeout(() => setIsHovered(false), 300);
                        }}
                    >
                        Home
                    </span>
                    <i className="bx bx-group"></i>
                    <span
                        className={"transition-colors hover:text-gray-300"}
                        style={{
                            marginLeft: "3px",
                            position: "relative",
                            top: "2px",
                            cursor: "pointer",
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onClick={() => {
                            navigate("/catalog");
                            setTimeout(() => setIsHovered(false), 300);
                        }}
                    >
                        StuyActivities
                    </span>
                    <i className="bx bx-calendar"></i>
                    <span
                        className={"transition-colors hover:text-gray-300"}
                        style={{
                            marginLeft: "3px",
                            position: "relative",
                            top: "2px",
                            cursor: "pointer",
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onClick={() => {
                            navigate("/meetings");
                            setTimeout(() => setIsHovered(false), 300);
                        }}
                    >
                        Meetings
                    </span>
                    <i className="bx bx-note"></i>
                    <span
                        className={"transition-colors hover:text-gray-300"}
                        style={{
                            marginLeft: "3px",
                            position: "relative",
                            top: "2px",
                            cursor: "pointer",
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onClick={() => {
                            window.location.href = "https://vote.stuysu.org";
                            setTimeout(() => setIsHovered(false), 300);
                        }}
                    >
                        Voting Site
                    </span>
                    <i className="bx bx-glasses opacity-50"></i>
                    <span
                        style={{
                            opacity: 0.5,
                            marginLeft: "3px",
                            position: "relative",
                            top: "2px",
                        }}
                    >
                        Opportunities
                    </span>
                    <i className="bx bx-file"></i>
                    <span
                        className={"transition-colors hover:text-gray-300"}
                        style={{
                            marginLeft: "3px",
                            position: "relative",
                            top: "2px",
                            cursor: "pointer",
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onClick={() => {
                            navigate("/about");
                            setTimeout(() => setIsHovered(false), 300);
                        }}
                    >
                        About
                    </span>
                </Stack>
            </Box>
            <Divider></Divider>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box
                    sx={{
                        width: "260px",
                        height: "100%",
                        backgroundColor: "inherit",
                        overflowY: "auto",
                    }}
                >
                    <Box sx={{ width: "100%", height: "250px" }}>
                        <Box
                            sx={{
                                width: "100%",
                                height: "110px",
                                padding: "20px",
                            }}
                        >
                            <Avatar
                                alt={`${user.first_name} ${user.last_name}`}
                                style={{
                                    width: "110px",
                                    height: "110px",
                                    borderRadius: "100%",
                                    boxShadow:
                                        "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                                    fontSize: "50px",
                                }}
                                src={user.picture}
                            >
                                {user.first_name?.charAt(0).toUpperCase()}
                            </Avatar>
                        </Box>
                        <Box
                            sx={{
                                width: "100%",
                                height: "140px",
                                display: "flex",
                                flexWrap: "wrap",
                                padding: "20px",
                                alignContent: "flex-end",
                            }}
                        >
                            {user.signed_in ? (
                                <>
                                    <Typography width="100%">
                                        {user.email || "No Email"}
                                    </Typography>
                                    {fourDigitId && (
                                        <Typography width="100%">
                                            ID:{" "}
                                            {String(fourDigitId).padStart(
                                                4,
                                                "0",
                                            )}
                                        </Typography>
                                    )}
                                    <Typography width="100%">
                                        Grade: {user.grade || "No Grade"}
                                    </Typography>
                                </>
                            ) : (
                                <Typography width="100%">Signed Out</Typography>
                            )}
                        </Box>
                    </Box>

                    <Divider />
                    <List sx={{ width: "100%" }}>
                        {user.signed_in && (
                            <ListItemButton onClick={signOut}>
                                <ListItemIcon>
                                    <PowerSettingsNewIcon />
                                </ListItemIcon>
                                <ListItemText>Sign Out</ListItemText>
                            </ListItemButton>
                        )}
                        <ListItemButton onClick={() => navigate("/")}>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText>Home</ListItemText>
                        </ListItemButton>
                        {user.admin && (
                            <ListItemButton onClick={() => navigate("/admin")}>
                                <ListItemIcon>
                                    <AdminPanelSettingsIcon />
                                </ListItemIcon>
                                <ListItemText>Admin</ListItemText>
                            </ListItemButton>
                        )}
                        {user.signed_in && (
                            <ListItemButton
                                onClick={() => navigate("/settings")}
                            >
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText>Settings</ListItemText>
                            </ListItemButton>
                        )}
                    </List>
                    <Divider />
                    <List
                        sx={{ width: "100%" }}
                        subheader={<ListSubheader>Discover</ListSubheader>}
                    >
                        <ListItemButton onClick={() => navigate("/catalog")}>
                            <ListItemIcon>
                                <FeedIcon />
                            </ListItemIcon>
                            <ListItemText>Catalog</ListItemText>
                        </ListItemButton>
                        {user.signed_in && (
                            <ListItemButton
                                onClick={() => navigate("/meetings")}
                            >
                                <ListItemIcon>
                                    <CalendarMonthIcon />
                                </ListItemIcon>
                                <ListItemText>Meetings</ListItemText>
                            </ListItemButton>
                        )}
                    </List>

                    <Divider />

                    {user.signed_in && (
                        <List
                            sx={{ width: "100%" }}
                            subheader={<ListSubheader>Modules</ListSubheader>}
                        >
                            <ListItemButton
                                onClick={() => navigate("/modules/attendance")}
                            >
                                <ListItemIcon>
                                    <PersonSearch />
                                </ListItemIcon>
                                <ListItemText>Attendance</ListItemText>
                            </ListItemButton>
                        </List>
                    )}

                    <Divider />

                    {user.signed_in && (
                        <List
                            sx={{ width: "100%" }}
                            subheader={
                                <ListSubheader>My Activities</ListSubheader>
                            }
                        >
                            {user.memberships?.map((membership, i) => {
                                if (membership.active)
                                    return (
                                        <OrgBar
                                            key={membership.id}
                                            name={
                                                membership?.organizations?.name
                                            }
                                            role={membership?.role}
                                            role_name={membership?.role_name}
                                            url={
                                                membership?.organizations
                                                    ?.url || "/"
                                            }
                                            picture={
                                                membership?.organizations
                                                    ?.picture
                                            }
                                        />
                                    );
                                return null;
                            })}
                            <ListItemButton onClick={() => navigate("/create")}>
                                <ListItemIcon>
                                    <AddCircleIcon />
                                </ListItemIcon>
                                <ListItemText>Create Activity</ListItemText>
                            </ListItemButton>
                        </List>
                    )}

                    <Divider />
                    <List
                        sx={{ width: "100%" }}
                        subheader={<ListSubheader>Info</ListSubheader>}
                    >
                        <ListItemButton onClick={() => navigate("/about")}>
                            <ListItemIcon>
                                <InfoIcon />
                            </ListItemIcon>
                            <ListItemText>About</ListItemText>
                        </ListItemButton>
                        <ListItemButton onClick={() => navigate("/rules")}>
                            <ListItemIcon>
                                <GavelIcon />
                            </ListItemIcon>
                            <ListItemText>Rules</ListItemText>
                        </ListItemButton>
                        <ListItemButton
                            component="a"
                            href="https://docs.google.com/spreadsheets/d/1TyFnEPhY3gM-yRJKYDJkQSfHC6OsvC5ftkkoahjVcCU"
                            target="_blank"
                        >
                            <ListItemIcon>
                                <ArchiveIcon />
                            </ListItemIcon>
                            <ListItemText>Archive</ListItemText>
                        </ListItemButton>
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

export default NavBar;
