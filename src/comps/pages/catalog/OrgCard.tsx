import { Box, Typography, Card } from "@mui/material";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { ThemeContext } from "../../context/ThemeProvider";

const OrgCard = ({ organization }: { organization: Partial<Organization> }) => {
  const navigate = useNavigate();
  const theme = useContext(ThemeContext);

  return (
    <Card
      sx={{
        borderRadius: "7px",
        cursor: "pointer",
        transition: "0.2s background ease-out",
        "&:hover": {
          background: theme.colorMode
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(100, 100, 100, 0.2)",
          transition: "0.2s background ease-out",
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
    </Card>
  );
};

export default OrgCard;
