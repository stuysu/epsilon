import React, { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";
import { Box, Stack, Typography, useMediaQuery } from "@mui/material";

import OrgMeeting from "../../comps/pages/orgs/OrgMeeting";
import { sortByDate } from "../../utils/DataFormatters";
import LoginGate from "../../comps/ui/LoginGate";

const Audit = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const isMobile = useMediaQuery("(max-width: 1450px)");
    const now = new Date();

    return (
        <LoginGate page="audit this activity">
            {organization.meetings.length > 0 ? (
                <Box
                    height="100%"
                    bgcolor="#1f1f1f80"
                    padding={0.5}
                    borderRadius={3}
                    marginBottom={10}
                    marginTop={1}
                    boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                >
                    <Stack borderRadius={2} overflow="hidden" spacing={0.5}>
                        {organization.meetings
                            .sort(sortByDate)
                            .map((meeting) => (
                                <OrgMeeting
                                    id={meeting.id || -1}
                                    title={meeting.title || "No Title"}
                                    description={
                                        meeting.description || "No Description"
                                    }
                                    start_time={meeting.start_time || ""}
                                    end_time={meeting.end_time || ""}
                                    is_public={meeting.is_public || false}
                                    room_name={meeting.rooms?.name || "Virtual"}
                                    org_name={organization.name || "No Org"}
                                    org_picture={
                                        organization.picture ||
                                        "https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png"
                                    }
                                    isMobile={isMobile}
                                />
                            ))}
                    </Stack>
                </Box>
            ) : (
                <Box
                    sx={{
                        marginTop: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <i className="bx bx-calendar-x bx-lg text-yellow-500 mb-5"></i>
                    <Typography variant="h1" marginBottom={3} align={"center"}>
                        No Meeting Records
                    </Typography>
                    <Typography variant="body1" align={"center"}>
                        This activity has not yet held any meetings.
                    </Typography>
                </Box>
            )}
        </LoginGate>
    );
};

export default Audit;
