import { Box, Button, Drawer } from "@mui/material";
import { Menu } from "@mui/icons-material";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import UserContext from "../context/UserContext";

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

const drawerLinkStyle : CSSProperties = {
    color: 'inherit',
    textDecoration: 'none',
    width: '100%',
    height: '50px',
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: "20px"
}

const NavBar = () => {
    const user = useContext(UserContext);
    const [drawerOpen, setDrawerOpen] = useState(false)
    const location = useLocation(); // disable drawer when location changes
    const navigate = useNavigate();

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        
        setDrawerOpen(false);
        navigate("/");
    }

    useEffect(() => {
        setDrawerOpen(false);
    }, [location])

    return (
        <>
            <Box sx={navStyles}>
                <Button onClick={() => setDrawerOpen(!drawerOpen)}>
                    <Menu />
                </Button>
                <Box sx={titleStyle}>
                    <Link style={linkStyle} to="/">Epsilon</Link>
                </Box>
            </Box>
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: "200px"}}>
                    <Link to="/catalog" style={drawerLinkStyle}>Catalog</Link>
                    <br />
                    <Link to="/create" style={drawerLinkStyle}>Create</Link>
                    <br />
                    <Link to="/admin" style={drawerLinkStyle}>Admin</Link>
                    <br />
                    <Link to="/meetings" style={drawerLinkStyle}>Meetings</Link>
                    <br />
                    {
                        user.signed_in && (
                            <Button style={drawerLinkStyle} onClick={signOut}>Sign Out</Button>
                        )
                    }
                </Box>
            </Drawer>
        </>
        
    )
}

export default NavBar;