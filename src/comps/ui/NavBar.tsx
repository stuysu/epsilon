import { Box, Button, Drawer } from "@mui/material";
import { Menu } from "@mui/icons-material";
import { CSSProperties, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
    const [drawerOpen, setDrawerOpen] = useState(false)
    const location = useLocation(); // disable drawer when location changes

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
                </Box>
            </Drawer>
        </>
        
    )
}

export default NavBar;