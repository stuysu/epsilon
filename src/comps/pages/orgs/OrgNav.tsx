import { useContext } from "react";

import { Box, Button, Typography } from "@mui/material";

import OrgContext from "../../context/OrgContext";
import UserContext from "../../context/UserContext";

import { supabase } from "../../../supabaseClient";
import { useSnackbar } from "notistack";

import { useNavigate } from "react-router-dom";

const OrgNav = ({ isMobile } : { isMobile: boolean }) => {
  const organization = useContext<OrgContextType>(OrgContext);
  const user = useContext<UserContextType>(UserContext);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const main = `/${organization.url}`;

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
          { variant: "error" }
        );
      }

      enqueueSnackbar("Sent organization a join request!", { variant: "success" });
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
          { variant: "error" }
        );
      }

      enqueueSnackbar("Left organization!", { variant: "success" });
    }
  };

  let disabled = false;
  if (isCreator) disabled = true;
  if (!isInOrg && !organization.joinable) disabled = true;

  let navLinks = [
    main,
    `${main}/charter`,
    `${main}/meetings`,
    `${main}/members`
  ]

  let navNames = [
    'Overview',
    'Charter',
    'Meetings',
    'Members',
    'Admin'
  ]

  if (isAdmin) {
    navLinks.push(`${main}/admin`)
  }

  return (
    <Box sx={{ minWidth: '350px', width: isMobile ? '100%' : '', padding: '20px'}}>
      <Box>
        <Button
          variant="contained"
          onClick={handleInteract}
          disabled={disabled}
        >
          {interactString}
        </Button>
      </Box>

      <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap'}}>
        {
          navLinks.map(
            (to, i) => (
              <Box 
                onClick={() => {
                  navigate(to);
                }} 
                sx={{
                  width: '100%',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'inherit',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'filter 0.1s ease-out',
                  "&:hover": { filter: 'brightness(150%)', transition: 'filter 0.1s ease-out' },
                  backgroundColor: 'background.default',
                  borderRadius: '3px'
                }}
                key={i}
              >
                <Typography>
                  {navNames[i]}
                </Typography>
              </Box>
            )
          )
        }
      </Box>
    </Box>
  );
};

export default OrgNav;
