import { Typography, Box, Button, Drawer } from "@mui/material";
import { Menu } from "@mui/icons-material";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import UserContext from "../../context/UserContext";
import { useSnackbar } from "notistack";
import NavButton from "./NavButton";
import OrgBar from "../../pages/home/ui/OrgBar";

const navStyles: CSSProperties = {
  width: "100%",
  height: "50px",
  display: "flex",
  flexWrap: "wrap",
};

const titleStyle: CSSProperties = {
  color: "inherit",
  fontSize: "40px",
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
          sx={{ borderRadius: "100%" }}
        >
          <Menu />
        </Button>
        <Box sx={titleStyle}>
          <Link style={linkStyle} to="/">
            Epsilon
          </Link>
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
            overflowY: "scroll",
          }}
        >
          <Box sx={{ width: "100%", height: "250px" }}>
            <Box sx={{ width: "100%", height: "110px", padding: "20px" }}>
              <img
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "100%",
                  boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                }}
                src={
                  user.picture ||
                  "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
                }
              />
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
                  <Typography width="100%">ID: {user.id || "No ID"}</Typography>
                  <Typography width="100%">
                    Grade: {user.grade || "No Grade"}
                  </Typography>
                </>
              ) : (
                <Typography width="100%">Signed Out</Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ width: "100%", backgroundColor: "inherit" }}>
            {user.signed_in && (
              <NavButton onClick={signOut} display={"Sign Out"} />
            )}
            <NavButton onClick={() => navigate("/")} display={"Home"} />
            {user.admin && (
              <NavButton
                onClick={() => navigate("/admin")}
                display={"Admin Panel"}
              />
            )}
          </Box>
          <Box sx={{ width: "100%", backgroundColor: "inherit" }}>
            <Typography
              color="#aaa"
              width="100%"
              height="60px"
              paddingLeft="20px"
              display="flex"
              alignItems="center"
            >
              Discover
            </Typography>
            <NavButton
              onClick={() => navigate("/catalog")}
              display={"Catalog"}
            />
            <NavButton
              onClick={() => navigate("/meetings")}
              display={"Meetings"}
            />
          </Box>

          <Box sx={{ width: "100%", backgroundColor: "inherit" }}>
            <Typography
              color="#aaa"
              width="100%"
              height="60px"
              paddingLeft="20px"
              display="flex"
              alignItems="center"
            >
              My Activities
            </Typography>
            {user.memberships?.map((membership, i) => (
              <OrgBar
                name={membership?.organizations?.name || "No Name"}
                role={membership?.role || "MEMBER"}
                role_name={membership?.role_name}
                url={membership?.organizations?.url || "/"}
                picture={
                  membership?.organizations?.picture ||
                  "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
                }
              />
            ))}
            {user.signed_in && (
              <NavButton
                onClick={() => navigate("/create")}
                display={"Create Activity"}
              />
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default NavBar;
