import { Box, Typography, Button } from "@mui/material";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { supabase } from "../../../supabaseClient";

import { useNavigate } from "react-router-dom";

import { PUBLIC_URL } from "../../../constants";

const UnauthenticatedLanding = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          width: "100%",
          height: "700px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "500px",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              width: "100%",
            }}
          >
            <Typography align="center" variant="h1">
              Epsilon
            </Typography>
            <Typography align="center" variant="body1">
              The all in one platform for Stuyvesant High School's needs.
            </Typography>
          </Box>
          <Box
            sx={{
              width: "50%",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Auth
                redirectTo={PUBLIC_URL}
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={["google"]}
                onlyThirdPartyProviders
              />
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <Button
                sx={{ height: "40px", width: "50%" }}
                variant="contained"
                onClick={() => navigate("/catalog")}
              >
                View Catalog
              </Button>
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                sx={{ height: "40px", width: "50%" }}
                variant="contained"
                onClick={() => navigate("/meetings")}
              >
                View Meetings
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UnauthenticatedLanding;
