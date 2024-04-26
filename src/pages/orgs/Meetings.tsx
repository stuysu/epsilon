import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";
import { Box, Typography, useMediaQuery } from "@mui/material";

import OrgMeeting from "../../comps/pages/orgs/OrgMeeting";

const Meetings = () => {
  const organization: OrgContextType = useContext(OrgContext);
  const isMobile = useMediaQuery("(max-width: 1450px)");

  return (
    <Box>
      <Typography variant='h1'>Meetings</Typography>

      <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap'}}>
        {
          organization.meetings.map(
            (meeting, i) => (
              <OrgMeeting 
                id={meeting.id || -1}
                title={meeting.title || "No Title"}
                description={meeting.description || "No Description"}
                start_time={meeting.start_time || ""}
                end_time={meeting.end_time || ""}
                is_public={meeting.is_public || false}
                room_name={meeting.rooms?.name || "Virtual"}
                org_name={organization.name || "No Org"}
                org_picture={organization.picture || "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"}
                isMobile={isMobile}
              />
            )
          )
        }
      </Box>
    </Box>
  );
};

export default Meetings;
