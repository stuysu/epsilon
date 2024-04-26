import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";

import { Box, Typography } from "@mui/material";
import OrgMember from "../../comps/pages/orgs/OrgMember";

const Overview = () => {
  const organization: OrgContextType = useContext(OrgContext);

  if (organization.id === -1) {
    return (
      <Box>
        <Typography>That organization doesn't exist!</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}>
      <Typography variant='h1' align='center' width='100%'>Overview</Typography>
      <Typography variant='h3' color='primary.main' width='100%'>Mission:</Typography>
      <Typography variant='body1' width='100%'>{organization.mission || "None"}</Typography>
      <Typography variant='h3' color='primary.main' width='100%'>Meeting Schedule:</Typography>
      <Typography variant='body1' width='100%'>{organization.meeting_schedule || "None"}</Typography>
      <Box sx={{ width: '100%' }}>
        <Typography variant='h3' color='primary.main' width='100%'>Leaders</Typography>
        {
          organization.memberships?.map(
            (member, i) => (
              (['FACULTY', 'ADMIN', 'CREATOR'].includes(member.role || "")) && (
                <OrgMember 
                  key={i}
                  role={member.role || "MEMBER"}
                  email={member.users?.email || "no email"}
                  picture={member.users?.picture || 'https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png'}
                  first_name={member.users?.first_name || "First"}
                  last_name={member.users?.last_name || "Last"}
                  is_faculty={member.users?.is_faculty || false}
                />
              )
            )
          )
        }
      </Box>
    </Box>
  );
};

export default Overview;
