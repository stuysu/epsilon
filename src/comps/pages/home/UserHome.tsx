import React, { useEffect, useState } from "react";
import UserContext from "../../context/UserContext";
import { Box, Grid, Stack, Typography, useMediaQuery } from "@mui/material";
import OrgBar from "./ui/OrgBar";
import { useSnackbar } from "notistack";
import { supabase } from "../../../supabaseClient";
import UpcomingMeeting from "./ui/UpcomingMeeting";
import Post from "../orgs/Post";
import DisplayLinks from "../../ui/DisplayLinks";
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();
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
                            marginRight: "20px",
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
                                            membership?.organizations?.name ||
                                            "No Name"
                                        }
                                        role={membership?.role || "MEMBER"}
                                        role_name={membership?.role_name}
                                        url={
                                            membership?.organizations?.url ||
                                            "/"
                                        }
                                        picture={
                                            membership?.organizations?.picture
                                        }
                                    />
                                );
                            return null;
                        })}
                        <div
                            onClick={() => navigate(`/catalog`)}
                            style={{
                                paddingLeft: "13px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                width: "200px",
                                height: "200px",
                            }}
                        >
                            <i
                                className="bx bx-plus-circle m-3 text-blue-500"
                                style={{
                                    fontSize: "50px",
                                }}
                            ></i>
                            Join an Activity!
                        </div>
                        {user.memberships?.length === 0 && (
                            <Typography variant="h3" align="center">
                                You are not a member of any organizations
                            </Typography>
                        )}
                    </div>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={5.6} xl={6}>
                    <Box position="relative" width={"100%"} marginBottom={8}>
                        <div className={"relative"}>
                            <Box
                                bgcolor="#1f1f1f80"
                                padding={0.5}
                                borderRadius={3}
                                position={"relative"}
                                zIndex={2}
                                boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15),
                            0px 4px 12px rgba(0, 0, 0, 0.25)"
                                sx={{
                                    backdropFilter: "blur(20px)",
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    width="100%"
                                    marginTop={2}
                                    marginBottom={3}
                                    marginLeft={3}
                                >
                                    <i className="bx bx-calendar-week mr-3 bx-sm top-1 relative"></i>
                                    My Meetings
                                </Typography>
                                <Stack
                                    borderRadius={2}
                                    overflow="hidden"
                                    spacing={0.5}
                                >
                                    {upcomingMeetings.length === 0 && (
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                paddingLeft: 3,
                                                paddingBottom: 3,
                                            }}
                                        >
                                            No upcoming meetings scheduled.
                                            Check back later!
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
                                            org_name={
                                                meeting.organizations.name
                                            }
                                            org_picture={
                                                meeting.organizations.picture
                                            }
                                            room_name={meeting.rooms?.name}
                                            is_public={meeting.is_public}
                                            sx={{
                                                flexDirection: isMobile
                                                    ? "column"
                                                    : "row",
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Box>

                            <Box
                                bgcolor="#1f1f1f80"
                                padding={0.5}
                                position={"absolute"}
                                borderRadius={3}
                                bottom={-40}
                                left={0}
                                right={0}
                                marginLeft={"4%"}
                                marginRight={"4%"}
                                display={"flex"}
                                justifyContent={"center"}
                                width={"92%"}
                                zIndex={1}
                                boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                            >
                                <Typography
                                    variant="body1"
                                    marginTop={3}
                                    marginBottom={0.5}
                                >
                                    <a href={"/meetings"}>View Calendar</a> ·{" "}
                                    {upcomingMeetings.length} Upcoming
                                </Typography>
                            </Box>
                        </div>
                        <Box
                            bgcolor="rgba(228, 174, 59, 0.1)"
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            bottom="0"
                            borderRadius={3}
                            zIndex={-1}
                            sx={{
                                filter: "blur(30px)",
                            }}
                        />
                    </Box>

                    <Box position="relative" width={"100%"} marginBottom={8}>
                        <div className={"relative"}>
                            <Box
                                bgcolor="#1f1f1f80"
                                padding={0.5}
                                borderRadius={3}
                                position={"relative"}
                                zIndex={2}
                                boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15),
                            0px 4px 12px rgba(0, 0, 0, 0.25)"
                                sx={{
                                    backdropFilter: "blur(20px)",
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    width="100%"
                                    marginTop={2}
                                    marginBottom={3}
                                    marginLeft={3}
                                >
                                    <i className="bx bxs-megaphone mr-3 bx-sm top-1 relative"></i>
                                    Epsilon Announcements
                                </Typography>
                                <Stack
                                    borderRadius={2}
                                    overflow="hidden"
                                    spacing={0.5}
                                >
                                    {announcements
                                        .slice(0, visibleAnnouncements)
                                        .map((announcement, i) => {
                                            return (
                                                <Stack
                                                    key={i}
                                                    sx={{
                                                        marginRight: "10px",
                                                        width: "100%",
                                                        padding: 3,
                                                        backgroundColor:
                                                            "#36363650",
                                                    }}
                                                >
                                                    <DisplayLinks
                                                        text={
                                                            announcement.content
                                                        }
                                                    />
                                                </Stack>
                                            );
                                        })}
                                </Stack>
                            </Box>

                            <Box
                                bgcolor="#1f1f1f80"
                                padding={0.5}
                                position={"absolute"}
                                borderRadius={3}
                                bottom={-40}
                                left={0}
                                right={0}
                                marginLeft={"4%"}
                                marginRight={"4%"}
                                display={"flex"}
                                justifyContent={"center"}
                                width={"92%"}
                                zIndex={1}
                                boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                            >
                                <Typography
                                    variant="body1"
                                    marginTop={3}
                                    marginBottom={0.5}
                                    onClick={() =>
                                        setVisibleAnnouncements(
                                            (prev) => prev + 3,
                                        )
                                    }
                                >
                                    <div className={"cursor-pointer"}>
                                        View All Announcements
                                    </div>
                                </Typography>
                            </Box>
                        </div>
                    </Box>
                </Grid>

                <div className={"w-full h-px fill-zinc-700"}></div>

                <div className={"m-10 w-full grid-cols-2 grid gap-4"}>
                    {posts.map((post) => (
                        <Post content={post} />
                    ))}
                </div>
            </Grid>
        </Box>
    );
};

export default UserHome;
