import React from "react";
import UserContext from "../../context/UserContext";
import { Box, Typography } from "@mui/material";

const UserHome = () => {
  const user = React.useContext(UserContext);

  return (
    <Box sx={{ width: '100%', paddingTop: '30px'}}>
      <Typography variant='h1' width='100%' align='center'>Welcome back {user.first_name}!</Typography>

      <pre>{JSON.stringify(user, undefined, 4)}</pre>
    </Box>
  );
};

export default UserHome;
