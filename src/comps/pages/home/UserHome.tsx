import React, { useEffect, useState } from "react";
import UserContext from "../../context/UserContext";
import { Box, Typography, useMediaQuery, Grid, Stack, Card } from "@mui/material";
import OrgBar from "./ui/OrgBar";
import { useSnackbar } from "notistack";
import { supabase } from "../../../supabaseClient";
import UpcomingMeeting from "./ui/UpcomingMeeting";
import Post from "../orgs/Post";
import DisplayLinks from "../../ui/DisplayLinks";
import AsyncButton from "../../ui/AsyncButton";

const currentHour = new Date().getHours();
const timeGreeting = currentHour < 12 ? "Good morning" : "Good evening";

type meetingType = {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    organizations: {
        name: string;
        picture: string;
    };
    rooms: {
        name: string;
    };
    is_public: boolean;
};

const UserHome = () => {
    const user = React.useContext(UserContext);
    const isMobile = useMediaQuery("(max-width: 1024px)");
    const { enqueueSnackbar } = useSnackbar();

    const [upcomingMeetings, setUpcomingMeetings] = useState<meetingType[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [visibleAnnouncements, setVisibleAnnouncements] = useState(3);

    useEffect(() => {
        const fetchMeetings = async () => {
            const userOrgIds = user.memberships?.map(
                (membership) => membership.organizations?.id,
            );

            const { data, error } = await supabase
                .from("meetings")
                .select(
                    `
                    id,
                    title,
                    description,
                    start_time,
                    end_time,
                    organizations (
                        name,
                        picture
                    ),
                    rooms (
                        name
                    ),
                    is_public
                `,
                )
                .in("organization_id", [userOrgIds])
                .gte("start_time", new Date().toISOString())
                .order("start_time")
                .returns<meetingType[]>();

            if (error || !data) {
                enqueueSnackbar(
                    "Failed to load meetings. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }

            setUpcomingMeetings(data);
        };

        const fetchPosts = async () => {
            const userOrgIds = user.memberships?.map(
                (membership) => membership.organizations?.id,
            );

            const { data, error } = await supabase
                .from("posts")
                .select(
                    `
                    id,
                    title,
                    description,
                    created_at,
                    updated_at,
                    organizations!inner (
                        name,
                        picture,
                        id
                    )
                `,
                )
                .in("organization_id", [userOrgIds])
                .order("created_at")
                .returns<Post[]>();

            if (error || !data) {
                return enqueueSnackbar(
                    "Failed to load posts. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            setPosts(data.reverse());
        };

        fetchMeetings();
        fetchPosts();
    }, [user, enqueueSnackbar]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data, error } = await supabase
                .from("announcements")
                .select("*")
                .order("created_at", { ascending: false });

            if (error || !data) {
                enqueueSnackbar(
                    "Failed to load announcements. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }
            setAnnouncements(data as Announcement[]);
        };
        fetchAnnouncements();
    }, [enqueueSnackbar]);

    return (
        <Box>
            <Box margin="50px">
            <Typography variant="h1">
                {timeGreeting}, {user.first_name}!
            </Typography>
            <Typography variant="h2" color="gray">
                You have some scheduled events.
            </Typography>
            </Box>

            <Grid container>
                <Grid item xs={12} sm={6} md={5.5} lg={6} xl={5.5}>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            paddingLeft: "50px",
                            gap: "10px",
                        }}
                    >
                            {user.memberships?.map((membership) => {
                                if (membership.active)
                                    return (
                                        <OrgBar
                                            key={membership.id}
                                            name={
                                                membership?.organizations
                                                    ?.name || "No Name"
                                            }
                                            role={membership?.role || "MEMBER"}
                                            role_name={membership?.role_name}
                                            url={
                                                membership?.organizations
                                                    ?.url || "/"
                                            }
                                            picture={
                                                membership?.organizations
                                                    ?.picture
                                            }
                                        />
                                    );
                                return null;
                            })}
                            {user.memberships?.length === 0 && (
                                <Typography variant="h3" align="center">
                                    You are not a member of any organizations
                                </Typography>
                            )}
                    </div>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={5.5} xl={6}>
                    <Box position="relative" width={"100%"} marginBottom={3}>
                        <Box
                            bgcolor="#1f1f1f80"
                            padding={0.5}
                            borderRadius={3}
                            boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                        >
                            <Typography variant="h3" width="100%" margin={3}>
                                Upcoming Meetings
                            </Typography>
                            <Stack borderRadius={2} overflow="hidden" spacing={0.5}>
                                {upcomingMeetings.length === 0 && (
                                    <Typography variant="body1" sx={{padding: 3}}>
                                        No upcoming meetings scheduled. Check back later!
                                    </Typography>
                                )}
                                {upcomingMeetings.map((meeting) => (
                                    <UpcomingMeeting
                                        key={meeting.id}
                                        id={meeting.id}
                                        title={meeting.title}
                                        description={meeting.description}
                                        start_time={meeting.start_time}
                                        end_time={meeting.end_time}
                                        org_name={meeting.organizations.name}
                                        org_picture={meeting.organizations.picture}
                                        room_name={meeting.rooms?.name}
                                        is_public={meeting.is_public}
                                        sx={{
                                            flexDirection: isMobile ? "column" : "row",
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Box>

                        <Box
                            bgcolor="rgba(228, 174, 59, 0.05)"
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            borderRadius={3}
                            zIndex={-1}
                            sx={{
                                filter: "blur(40px)",
                            }}
                        />
                    </Box>

                        {announcements
                            .slice(0, visibleAnnouncements)
                            .map((announcement, i) => {
                                return (
                                    <Card
                                        key={i}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            padding: "20px",
                                        }}
                                    >
                                        <DisplayLinks text={announcement.content} />
                                    </Card>
                                );
                            })}
                        {visibleAnnouncements < announcements.length && (
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    marginTop: "10px",
                                }}
                            >
                                <AsyncButton
                                    variant="contained"
                                    onClick={() =>
                                        setVisibleAnnouncements((prev) => prev + 3)
                                    }
                                >
                                    Show More
                                </AsyncButton>
                            </Box>
                        )}
                </Grid>
                <Box sx={{ width: "100%", marginTop: "50px" }}>
                    <Typography variant="h1" align="center">
                        Posts
                    </Typography>
                </Box>
                {posts.map((post) => (
                    <Grid item xs={12} sm={12} md={6} lg={4} key={post.id}>
                        <Box
                            width="100%"
                            display="flex"
                            justifyContent="center"
                            padding="10px"
                        >
                            <Post content={post} />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default UserHome;
