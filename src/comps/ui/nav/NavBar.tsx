import { Box, Button, Drawer } from "@mui/material";
import { Menu } from "@mui/icons-material";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import UserContext from "../../context/UserContext";
import { useSnackbar } from "notistack";
import NavButton from "./NavButton";

const navStyles : CSSProperties = { 
    width: "100%", 
    height: "50px",
    display: "flex",
    flexWrap: "wrap"
}

const titleStyle : CSSProperties = {
    color: 'inherit',
    fontSize: "40px"
}

const linkStyle : CSSProperties = {
    color: 'inherit',
    textDecoration: 'none'
}

const NavBar = () => {
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const [drawerOpen, setDrawerOpen] = useState(false)
    const location = useLocation(); // disable drawer when location changes
    const navigate = useNavigate();

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return enqueueSnackbar("Error signing out. Contact it@stuysu.org for support.", { variant: "error" })
        }
        
        setDrawerOpen(false);
        navigate("/");
    }

    useEffect(() => {
        setDrawerOpen(false);
    }, [location])

    return (
        <>
            <Box sx={navStyles}>
                <Button onClick={() => setDrawerOpen(!drawerOpen)} sx={{ borderRadius: '100%' }}>
                    <Menu />
                </Button>
                <Box sx={titleStyle}>
                    <Link style={linkStyle} to="/">Epsilon</Link>
                </Box>
            </Box>
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box 
                    sx={{ 
                        width: "260px", 
                        height: '100%', 
                        backgroundColor: 'inherit', 
                        overflowY: 'scroll' 
                    }}
                >
                    <Box sx={{ width: '100%', backgroundColor: 'inherit'}}>
                        {
                            user.signed_in && (
                                <NavButton onClick={signOut} display={'Sign Out'} />
                            )
                        }
                        <NavButton onClick={() => navigate("/")} display={'Home'} />
                        {user.admin && (
                            <NavButton onClick={() => navigate("/admin")} display={'Admin Panel'} />
                        )}
                    </Box>
                    <Box sx={{ width: '100%', backgroundColor: 'inherit'}}>
                        <NavButton onClick={() => navigate("/catalog")} display={'Catalog'} />
                        <NavButton onClick={() => navigate("/create")} display={'Create Activity'} />
                        <NavButton onClick={() => navigate("/meetings")} display={'Meetings'} />
                    </Box>
                </Box>
            </Drawer>
        </>
        
    )
}

export default NavBar;