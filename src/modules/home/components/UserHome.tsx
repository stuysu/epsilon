/**
 * Display the logged-in user's dashboard, including:
 * memberships, upcoming meetings, global announcements and recent posts
 */

import React, { useEffect, useState } from "react";
import UserContext from "../../../contexts/UserContext";
import OrgBlock from "../../../components/ui/OrgBlock";
import { useSnackbar } from "notistack";
import { supabase } from "../../../lib/supabaseClient";
import UpcomingMeeting from "./UpcomingMeeting";
import OrgStreamPost from "../../stuyactivities/orgs/components/OrgStreamPost";
import DisplayLinks from "../../../components/DisplayLinks";
import { useNavigate } from "react-router-dom";
import ItemList from "../../../components/ui/lists/ItemList";

const currentHour = new Date().getHours();
const timeGreeting =
    currentHour < 12
        ? "Good morning"
        : currentHour < 17
          ? "Good afternoon"
          : "Good evening";
type meetingType = {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    organizations: {
        name: string;
        picture: string;
        url: string;
    };
    rooms: {
        name: string;
    };
    is_public: boolean;
};

const UserHome = () => {
    const navigate = useNavigate();
    const user = React.useContext(UserContext);
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
                        picture,
                        url
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
        <main className="m-3 sm:my-8 sm:mx-12 max-sm:mt-4 min-h-[90vh]">
            <header className="flex flex-col mb-10 max-sm:items-center max-sm:text-center">
                <h1>
                    {timeGreeting}, {user.first_name}!
                </h1>
                <h2 className={"-mt-1.5"}>Here's what's happening.</h2>
            </header>

            <section className="relative flex sm:flex-row flex-col gap-12 w-full mb-10">
                <div className="sm:sticky top-10 flex flex-wrap content-start gap-x-5 gap-y-2 sm:max-w-[50vw] max-h-[calc(100dvh-2.5rem)] overflow-y-auto pb-6">
                    {user.memberships?.map((membership) => {
                        if (membership.active)
                            return (
                                <OrgBlock
                                    key={membership.id}
                                    name={
                                        membership?.organizations?.name ||
                                        "No Name"
                                    }
                                    role={membership?.role || "MEMBER"}
                                    role_name={membership?.role_name}
                                    url={membership?.organizations?.url || "/"}
                                    picture={membership?.organizations?.picture}
                                />
                            );
                        return null;
                    })}
                    <div
                        className={
                            "cursor-pointer flex items-center justify-center flex-col w-44 h-44 rounded-xl sm:hover:opacity-75 transition-opacity border-accent border-dashed border"
                        }
                        onClick={() => navigate(`/stuyactivities`)}
                    >
                        <i className="bx bx-md bx-plus-circle mb-5 text-accent"></i>
                        <p className="text-accent">Join an Activity!</p>
                    </div>
                </div>
                <div className="w-full max-w-3xl flex flex-col gap-14 max-sm:mt-6">
                    <div className={"relative w-full group"}>
                        <div className={"relative z-10"}>
                            <ItemList
                                title={"My Meetings"}
                                height={"auto"}
                                icon={"bx-calendar-week"}
                            >
                                {upcomingMeetings.length === 0 && (
                                    <p className={"bg-layer-2 p-4"}>
                                        No upcoming meetings. Check back later!
                                    </p>
                                )}
                                {upcomingMeetings.map((meeting) => (
                                    <UpcomingMeeting
                                        url={meeting.organizations.url}
                                        key={meeting.id}
                                        id={meeting.id}
                                        title={meeting.title}
                                        description={meeting.description}
                                        start_time={meeting.start_time}
                                        end_time={meeting.end_time}
                                        org_name={meeting.organizations.name}
                                        org_picture={
                                            meeting.organizations.picture
                                        }
                                        room_name={meeting.rooms?.name}
                                        is_public={meeting.is_public}
                                    />
                                ))}
                            </ItemList>
                        </div>
                        <div
                            className="
                            absolute
                            bottom-0
                            left-0
                            right-0
                            p-2.5
                            ml-[4%]
                            mr-[4%]
                            flex
                            justify-center
                            max-sm:translate-y-7
                            sm:group-hover:translate-y-7
                            transition-transform
                            w-[92%]
                            z-[1]
                            rounded-xl
                            bg-layer-1
                            shadow-control"
                        >
                            <p className={"pt-4 important"}>
                                <a
                                    href={"/meetings"}
                                    className={
                                        "sm:hover:opacity-75 transition-colors no-underline"
                                    }
                                >
                                    View Calendar
                                </a>{" "}
                                · {upcomingMeetings.length} Upcoming
                            </p>
                        </div>
                    </div>

                    <div className={"relative w-full group"}>
                        <div className={"relative z-10"}>
                            <ItemList
                                title={"StuyActivities Announcements"}
                                height={"auto"}
                                icon={"bxs-megaphone"}
                            >
                                {announcements
                                    .slice(0, visibleAnnouncements)
                                    .map((announcement, i) => {
                                        return (
                                            <div
                                                key={i}
                                                className={"p-4 bg-layer-2"}
                                            >
                                                <DisplayLinks
                                                    text={announcement.content}
                                                />
                                            </div>
                                        );
                                    })}
                                {announcements.length === 0 && (
                                    <p className={"bg-layer-2 p-4"}>
                                        No announcements. Check back later!
                                    </p>
                                )}
                            </ItemList>
                        </div>
                        <div
                            className="
                            absolute
                            bottom-0
                            left-0
                            right-0
                            p-2.5
                            ml-[4%]
                            mr-[4%]
                            flex
                            justify-center
                            max-sm:translate-y-7
                            sm:group-hover:translate-y-7
                            transition-transform
                            w-[92%]
                            z-[1]
                            rounded-xl
                            bg-layer-1
                            shadow-control"
                        >
                            <p
                                className={
                                    announcements.length <= visibleAnnouncements
                                        ? "opacity-50 pt-4 important"
                                        : "pt-4 cursor-pointer sm:hover:opacity-75 transition-colors important"
                                }
                                onClick={() =>
                                    setVisibleAnnouncements((prev) => prev + 3)
                                }
                            >
                                View More Announcements
                            </p>
                        </div>
                    </div>

                    <div className={"flex flex-col gap-8"}>
                        {posts.map((post, i) => (
                            <OrgStreamPost content={post} key={i} />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default UserHome;
