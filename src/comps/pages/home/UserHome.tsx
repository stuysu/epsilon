import React from "react";
import UserContext from "../../context/UserContext";
import { Paper, Box, Typography, useMediaQuery } from "@mui/material";
import OrgBar from "./ui/OrgBar";

const UserHome = () => {
  const user = React.useContext(UserContext);
  const isMobile = useMediaQuery("(max-width: 900px)");

  return (
    <Box sx={{ width: '100%', paddingTop: '30px'}}>
      <Typography variant='h1' width='100%' align='center'>Welcome back {user.first_name}!</Typography>

      <Box sx={{ width: '100%', display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', justifyContent: 'space-around' }}>
        <Paper elevation={1} sx={{ width: '500px', marginTop: '20px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '20px' }}>
          <Typography variant='h2' width='100%' align='center'>My Memberships</Typography>
          <Paper elevation={2} sx={{ width: '400px', height: '200px', overflowY: 'scroll'}}>
            {
              user.memberships?.map((membership, i) => 
                (
                  <OrgBar 
                    name={membership?.organizations?.name || "No Name"}
                    role={membership?.role || 'No Role'}
                    url={membership?.organizations?.url || "/"}
                    picture={membership?.organizations?.picture || 'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png'}
                  />
                )
              )
            }
          </Paper>
        </Paper>
      </Box>
    </Box>
  );
};

export default UserHome;
