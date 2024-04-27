import { useContext, useState } from "react";

import { Box, Button, Typography, Divider } from "@mui/material";

import OrgContext from "../../context/OrgContext";
import UserContext from "../../context/UserContext";

import { supabase } from "../../../supabaseClient";
import { useSnackbar } from "notistack";

import { useNavigate } from "react-router-dom";

const OrgNav = ({ isMobile }: { isMobile: boolean }) => {
  const organization = useContext<OrgContextType>(OrgContext);
  const user = useContext<UserContextType>(UserContext);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const main = `/${organization.url}`;

  const [currentIndex, setCurrentIndex] = useState(0);

  const isInOrg: boolean = organization.memberships?.find(
    (m) => m.users?.id === user.id,
  )
    ? true
    : false;
  let isCreator = false;
  let isAdmin = false;
  let isActive = false;

  /* CHECK IF CREATOR */
  if (
    isInOrg &&
    organization.memberships?.find((m) => m.users?.id === user.id)?.role ===
      "CREATOR"
  ) {
    isCreator = true;
    isAdmin = true;
  }

  /* CHECK IF ADMIN */
  if (
    isInOrg &&
    organization.memberships?.find((m) => m.users?.id === user.id)?.role ===
      "ADMIN"
  ) {
    isAdmin = true;
  }

  /* CHECK IF MEMBERSHIP IS ACTIVE */
  if (
    isInOrg &&
    organization.memberships?.find((m) => m.users?.id === user.id)?.active
  ) {
    isActive = true;
  }

  /* Button on OrgNav that changes depending on the user */
  let interactString = isInOrg ? (isActive ? "LEAVE" : "CANCEL JOIN") : "JOIN";
  const handleInteract = async () => {
    if (interactString === "JOIN") {
      /* JOIN ORGANIZATION */
      const { error } = await supabase
        .from("memberships")
        .insert({ organization_id: organization.id, user_id: user.id });
      if (error) {
        return enqueueSnackbar(
          "Unable to join organization. Contact it@stuysu.org for support.",
          { variant: "error" },
        );
      }

      enqueueSnackbar("Sent organization a join request!", {
        variant: "success",
      });
    } else if (interactString === "LEAVE" || interactString === "CANCEL JOIN") {
      /* LEAVE ORGANIZATION */
      let membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
      );

      const { error } = await supabase
        .from("memberships")
        .delete()
        .eq("id", membership?.id);
      if (error) {
        return enqueueSnackbar(
          "Unable to leave organization. Contact it@stuysu.org for support.",
          { variant: "error" },
        );
      }

      enqueueSnackbar("Left organization!", { variant: "success" });
    }
  };

  let disabled = false;
  if (isCreator) disabled = true;
  if (!isInOrg && !organization.joinable) disabled = true;

  if (!user.signed_in) {
    interactString = "sign in to join";
    disabled = true;
  }

  let navLinks = [
    { to: main, display: "Overview" },
    { to: `${main}/charter`, display: "Charter" },
    { to: `${main}/meetings`, display: "Meetings" },
    { to: `${main}/members`, display: "Members" },
  ];

  if (isAdmin) {
    navLinks.push({ to: `${main}/admin`, display: "Admin" });
  }

  return (
    <Box
      sx={{
        minWidth: "350px",
        width: isMobile ? "100%" : "",
        padding: isMobile ? "0px" : "20px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "300px",
            height: "300px",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <img
            src={
              organization.picture ||
              "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
            }
            width="100%"
            height="100%"
            style={{
              borderRadius: "5px",
              boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
            }}
            alt={`organization ${organization.name}`}
          />
        </Box>
        <Typography variant="h3" align="center" width="100%">
          {organization.name}
        </Typography>
        <Typography variant="body1" align="center" width="100%">
          {organization.mission}
        </Typography>
        <Button
          variant="contained"
          onClick={handleInteract}
          disabled={disabled}
          sx={{
            marginTop: "20px",
            width: isMobile ? "80%" : "100%",
          }}
        >
          {interactString}
        </Button>
      </Box>

      <Divider sx={{ marginTop: "20px", height: "2px" }} />

      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          marginTop: "10px",
        }}
      >
        {navLinks.map((linkData, i) => (
          <Box
            onClick={() => {
              navigate(linkData.to);
              setCurrentIndex(i);
            }}
            sx={{
              width: "100%",
              height: "60px",
              display: "flex",
              alignItems: "center",
              color: "inherit",
              padding: "20px",
              cursor: "pointer",
              transition: "filter 0.1s ease-out",
              filter:
                i === currentIndex ? "brightness(150%)" : "brightness(100%)",
              "&:hover": {
                filter: "brightness(150%)",
                transition: "filter 0.1s ease-out",
              },
              backgroundColor: "background.default",
              borderRadius: "3px",
            }}
            key={i}
          >
            <Typography>{linkData.display}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default OrgNav;
