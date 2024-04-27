import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

type Props = {
  name: string;
  role: Membership['role'];
  role_name: Membership['role_name'];
  url: string;
  picture: string;
};

const formatCapitals = (txt : string) => {
  return txt.slice(0, 1).toUpperCase() + txt.slice(1).toLowerCase();
}

const OrgBar = ({ name, url, role, role_name, picture }: Props) => {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/${url}`)}
      sx={{
        width: "100%",
        display: "flex",
        flexWrap: "nowrap",
        height: "80px",
        alignItems: "center",
        cursor: "pointer",
        backgroundColor: "inherit",
        transition: "filter 0.2s ease-out",
        "&:hover": {
          filter: "brightness(125%)",
          transition: "filter 0.2s ease-out",
        },
      }}
    >
      <Box
        sx={{
          width: "80px",
          height: "80px",
          padding: "15px",
          borderRadius: "100%",
        }}
      >
        <img
          src={picture}
          alt={`${name}`}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "100%",
            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          }}
        />
      </Box>
      <Box>
        <Typography width="100%">{name}</Typography>
        <Typography width="100%">{role_name || formatCapitals(role)}</Typography>
      </Box>
    </Box>
  );
};

export default OrgBar;
