import React, { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";
import { Box, Stack, Typography, useMediaQuery } from "@mui/material";

import OrgMeeting from "../../comps/pages/orgs/OrgMeeting";
import { sortByDate } from "../../utils/DataFormatters";
import LoginGate from "../../comps/ui/LoginGate";

const Meetings = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const isMobile = useMediaQuery("(max-width: 1450px)");
    const now = new Date();
    const upcomingMeetings = (organization.meetings || []).filter(
        (meeting) => meeting.end_time && new Date(meeting.end_time) > now,
    );
    const hasUpcomingMeetings = upcomingMeetings.length > 0;

    return (
        <LoginGate page="view meetings">
            {hasUpcomingMeetings ? (
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
                        {upcomingMeetings.sort(sortByDate).map((meeting) => (
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
                                onlyUpcoming
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
                    <i className="bx bx-calendar-x bx-lg text-blue-500 mb-5"></i>
                    <Typography variant="h1" marginBottom={3}>
                        No Meetings Scheduled
                    </Typography>
                    <Typography variant="body1" align={"center"}>
                        This activity has not yet scheduled any meetings for the
                        future.
                        <br />
                        To view past meetings, visit the audit page.
                    </Typography>
                </Box>
            )}
        </LoginGate>
    );
};

export default Meetings;
