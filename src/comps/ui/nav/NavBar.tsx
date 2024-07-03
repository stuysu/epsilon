import {
    Typography,
    Box,
    Button,
    Drawer,
    List,
    ListItemText,
    Divider,
    ListSubheader,
    ListItemButton,
    ListItemIcon,
    IconButton,
    Avatar,
} from "@mui/material";
import {
    Brightness4Rounded,
    Brightness7Rounded,
    Menu,
    PersonSearch,
} from "@mui/icons-material";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import UserContext from "../../context/UserContext";
import { useSnackbar } from "notistack";
import OrgBar from "../../pages/home/ui/OrgBar";
import { ThemeContext } from "../../context/ThemeProvider";

/* Navbar Button Icons */
import HomeIcon from "@mui/icons-material/Home";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FeedIcon from "@mui/icons-material/Feed";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddCircleIcon from "@mui/icons-material/AddCircle";
import InfoIcon from '@mui/icons-material/Info';
import GavelIcon from '@mui/icons-material/Gavel';

const navStyles: CSSProperties = {
    width: "100%",
    height: "50px",
    display: "flex",
    flexWrap: "wrap",
    position: "relative",
};

const titleStyle: CSSProperties = {
    color: "inherit",
    fontSize: "25px",
    height: "100%",
    display: "flex",
    alignItems: "center"
};

const linkStyle: CSSProperties = {
    color: "inherit",
    textDecoration: "none",
};

const NavBar = () => {
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation(); // disable drawer when location changes
    const navigate = useNavigate();

    const theme = useContext(ThemeContext);

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

    return (
        <>
            <Box sx={navStyles}>
                <Button
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    sx={{ borderRadius: "100%", width: "50px" }}
                >
                    <Menu />
                </Button>
                <Box sx={titleStyle}>
                    <Link style={linkStyle} to="/">
                        EPSILON
                    </Link>
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
                    <IconButton onClick={theme.toggleColorMode} color="inherit">
                        {theme.colorMode ? (
                            <Brightness4Rounded />
                        ) : (
                            <Brightness7Rounded />
                        )}
                    </IconButton>
                </Box>
            </Box>

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
                                    fontSize: "50px"
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
                                    <Typography width="100%">
                                        ID: {String(user.id).padStart(5, '0') || "No ID"}
                                    </Typography>
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
                            <ListItemButton onClick={() => navigate("/modules/attendance")}>
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
                                    return (<OrgBar
                                        key={membership.id}
                                        name={membership?.organizations?.name}
                                        role={membership?.role}
                                        role_name={membership?.role_name}
                                        url={membership?.organizations?.url || "/"}
                                        picture={membership?.organizations?.picture}
                                    />)
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
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

export default NavBar;
