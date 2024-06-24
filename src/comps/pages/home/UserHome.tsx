import React, { useEffect, useState } from "react";
import UserContext from "../../context/UserContext";
import { Paper, Box, Typography, useMediaQuery, Grid } from "@mui/material";
import OrgBar from "./ui/OrgBar";

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useSnackbar } from "notistack";
import { supabase } from "../../../supabaseClient";
import UpcomingMeeting from "./ui/UpcomingMeeting";
import Post from "../orgs/Post";
const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 3
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 2
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

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

    const [upcomingMeetings, setUpcomingMeetings] = useState<meetingType[]>([]);
    const [posts, setPosts] = useState<Post[]>([])

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {

        const fetchMeetings = async () => {
            let userOrgIds = user.memberships?.map((membership) => membership.organizations?.id);

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
                return enqueueSnackbar(
                    "Failed to load meetings. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            setUpcomingMeetings(data);
        }

        const fetchPosts = async () => {
            let userOrgIds = user.memberships?.map((membership) => membership.organizations?.id);

            const { data, error } = await supabase
                .from("posts")
                .select(
                    `
                    id,
                    title,
                    description,
                    created_at,
                    updated_at,
                    organization_id
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

            setPosts(data);
        }

        fetchMeetings();
        fetchPosts();
    }, [user])

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h1" width="100%" align="center">
                Welcome back {user.first_name}!
            </Typography>
                
                <Grid container>
                    <Grid item xs={12} sm={6} md={4} lg={4} xl={4} justifyContent={"center"}>
                        <Box sx={{ width: "100%", display: "flex", justifyContent: "center", flexWrap: "wrap", paddingLeft: "10px" }}>
                            <Typography variant="h2" width="100%" align="center">
                                My Memberships
                            </Typography>
                            <Paper
                                elevation={2}
                                sx={{
                                    width: "400px",
                                    height: "300px",
                                    overflowY: "auto",
                                }}
                            >
                                {user.memberships?.map(membership => (
                                    <OrgBar
                                        key={membership.id}
                                        name={
                                            membership?.organizations?.name || "No Name"
                                        }
                                        role={membership?.role || "MEMBER"}
                                        role_name={membership?.role_name}
                                        url={membership?.organizations?.url || "/"}
                                        picture={membership?.organizations?.picture}
                                    />
                                ))}
                                {
                                    user.memberships?.length === 0 && (
                                        <Typography variant="h3" align="center">
                                            You are not a member of any organizations
                                        </Typography>
                                    )
                                }
                            </Paper>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={8} lg={8} xl={8}>
                        <Typography variant="h2" width="100%" align="center">
                            Upcoming Meetings
                        </Typography>
                        <Carousel responsive={responsive}>
                            {
                                upcomingMeetings.map(meeting => (
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
                                    />
                                ))
                            }
                        </Carousel>
                        {
                            upcomingMeetings.length === 0 && (
                                <Typography variant="h3" align="center">
                                    No upcoming meetings
                                </Typography>
                            )
                        }
                    </Grid>
                    <Grid item xs={12}>
                        {
                            posts.map(post => (
                                <Post
                                    key={post.id}
                                    content={post}
                                />
                            ))
                        }
                    </Grid>
                </Grid>
            </Box>
    );
};

export default UserHome;
