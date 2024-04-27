import { Paper, Box, Typography } from "@mui/material";

import { useNavigate } from "react-router-dom";

const OrgCard = ({ organization }: { organization: Partial<Organization> }) => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: "7px",
        cursor: "pointer",
        transition: "filter 0.3s ease-out",
        "&:hover": {
          filter: "brightness(150%)",
          transition: "filter 0.2s ease-out",
        },
      }}
      onClick={() => navigate(`/${organization.url}`)}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "20px",
        }}
      >
        <img
          src={
            organization.picture ||
            "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
          }
          width="170px"
          height="170px"
          style={{
            borderRadius: "100%",
            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          }}
          alt={`Organization Card for ${organization.name || "organization without a name"}`}
        />
      </Box>
      <Box sx={{ width: "100%", padding: "20px" }}>
        <Typography variant="h3" align="center">
          {organization.name}
        </Typography>
        <Typography variant="body1" align="center">
          {organization.mission}
        </Typography>
      </Box>
    </Paper>
  );
};

export default OrgCard;
