import { useNavigate } from "react-router-dom";

import { useContext, useState } from "react";

import OrgContext from "../../../context/OrgContext";

import { Box, Typography } from "@mui/material";

const OrgAdminNav = () => {
  const organization = useContext<OrgContextType>(OrgContext);
  const main = `/${organization.url}/admin`;
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  let navLinks = [
    {
      to: `${main}/members`,
      display: 'Members'
    },
    {
      to: `${main}/member-requests`,
      display: 'Member Requests'
    },
    {
      to: `${main}/meetings`,
      display: 'Meetings'
    },
    {
      to: `${main}/posts`,
      display: 'Posts'
    },
    {
      to: `${main}/strikes`,
      display: 'Strikes'
    },
    {
      to: `${main}/org-edits`,
      display: 'Org Edits'
    },
  ]

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "nowrap",
        height: '85px',
        width: '100%'
      }}
    >
      {
        navLinks.map(
          (linkData, i) => (
            <Box
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                navigate(linkData.to);
              }}
              sx={{
                width: `${100/navLinks.length}%`,
                height: '85px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'inherit',
                padding: '20px',
                cursor: 'pointer',
                transition: 'filter 0.1s ease-out',
                filter: currentIndex === i ? 'brightness(150%)' : 'brightness(100%)',
                "&:hover": { filter: 'brightness(150%)', transition: 'filter 0.1s ease-out' },
                backgroundColor: 'background.default',
                borderRadius: '3px'
              }}
            >
              <Typography>{linkData.display}</Typography>
            </Box>
          )
        )
      }
    </Box>
  );
};

export default OrgAdminNav;
