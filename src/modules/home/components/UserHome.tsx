/**
 * Display the logged-in user's dashboard, including:
 * memberships, upcoming meetings, global announcements and recent posts
 */

import React, { useState } from "react";
import UserContext from "../../../contexts/UserContext";
import OrgBlock from "../../../components/ui/OrgBlock";
import { useSnackbar } from "notistack";
import { supabase } from "../../../lib/supabaseClient";
import useCachedQuery from "../../../lib/useCachedQuery";
import UpcomingMeeting from "./UpcomingMeeting";
import OrgStreamPost from "../../stuyactivities/orgs/components/OrgStreamPost";
import DisplayLinks from "../../../components/DisplayLinks";
import { Link } from "react-router-dom";
import ItemList from "../../../components/ui/lists/ItemList";
import { Scrollbars } from "react-custom-scrollbars-2";

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
    advisor: string;
};

const UserHome = () => {
    const user = React.useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();

    const [visibleAnnouncements, setVisibleAnnouncements] = useState(3);
    // below the two-column layout, long tile lists fold to two rows so meetings stay near the top
    const activeCount = (user.memberships || []).filter((m) => m.active).length;
    const [showAllTiles, setShowAllTiles] = useState(false);
    const foldPhone = !showAllTiles && activeCount > 4;
    const foldSm = !showAllTiles && activeCount > 6;
    const foldMd = !showAllTiles && activeCount > 8;
    const toggleRef = React.useRef<HTMLButtonElement>(null);

    const userOrgIds = (user.memberships || [])
        .filter((membership) => membership.active)
        .map((membership) => membership.organizations?.id)
        .sort();

    const failed = (what: string) =>
        enqueueSnackbar(
            `Failed to load ${what}. Contact it@stuysu.org for support.`,
            { variant: "error" },
        );

    const upcomingMeetings =
        useCachedQuery(["home", "meetings", userOrgIds], async () => {
            const { data, error } = await supabase
                .from("meetings")
                .select(
                    `
                    id,
                    title,
                    description,
                    start_time,
                    end_time,
                    organizations!inner (
                        name,
                        picture,
                        url
                    ),
                    rooms (
                        name
                    ),
                    is_public,
                    advisor
                `,
                )
                .neq("organizations.url", "epsilon") // internal maintenance meetings
                .in("organization_id", userOrgIds)
                .gte("start_time", new Date().toISOString())
                .order("start_time")
                .returns<meetingType[]>();
            if (error || !data) {
                failed("meetings");
                throw error;
            }
            return data;
        }).data ?? [];

    const posts =
        useCachedQuery(["home", "posts", userOrgIds], async () => {
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
                .in("organization_id", userOrgIds)
                .order("created_at", { ascending: false })
                .returns<Post[]>();
            if (error || !data) {
                failed("posts");
                throw error;
            }
            return data;
        }).data ?? [];

    const announcements =
        useCachedQuery(["home", "announcements"], async () => {
            const { data, error } = await supabase
                .from("announcements")
                .select("*")
                .order("created_at", { ascending: false });
            if (error || !data) {
                failed("announcements");
                throw error;
            }
            return data as Announcement[];
        }).data ?? [];

    return (
        // one container, the Figma content width (wider on huge screens), so both columns stay together
        <main className="mx-auto min-h-[90vh] w-full max-w-[calc(var(--frame)+6rem)] px-3 pb-8 pt-4 sm:px-12 sm:pt-8">
            <header className="flex flex-col mb-10">
                <h1>
                    {timeGreeting}, {user.first_name}!
                </h1>
                <h2 className={"-mt-1.5"}>Here's what's happening.</h2>
            </header>

            {/* equal halves from lg; tiles stretch to a set count per row so no partial row of space is left over */}
            <section className="relative mb-10 grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
                {/* the negative margin and matching padding give the hover glow room inside the scroller */}
                <div className="-mx-3 -my-8 min-w-0 sm:-mx-8 lg:sticky lg:top-0 lg:self-start [--tiles-max:100000px] lg:[--tiles-max:calc(100dvh_-_1rem)]">
                    <Scrollbars
                        universal
                        autoHide
                        autoHideTimeout={1000}
                        autoHideDuration={200}
                        autoHeight
                        autoHeightMax="var(--tiles-max)"
                        onWheel={(e) => e.stopPropagation()}
                        renderView={(
                            props: React.HTMLProps<HTMLDivElement>,
                        ) => (
                            <div
                                {...props}
                                id="home-activity-tiles"
                                className={`scroll-hide grid w-full grid-cols-2 content-start gap-x-3 gap-y-2 px-3 py-8 sm:grid-cols-3 sm:gap-x-4 sm:px-8 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 min-[2300px]:grid-cols-4 ${
                                    foldPhone
                                        ? "max-sm:[&>*:nth-child(n+5)]:hidden"
                                        : ""
                                } ${
                                    foldSm
                                        ? "sm:max-md:[&>*:nth-child(n+7)]:hidden"
                                        : ""
                                } ${
                                    foldMd
                                        ? "md:max-lg:[&>*:nth-child(n+9)]:hidden"
                                        : ""
                                }`}
                                // longhands only; mixing them with the library's overflow makes React warn
                                style={{
                                    ...props.style,
                                    overflow: undefined,
                                    overflowX: "hidden",
                                    overflowY: props.style
                                        ?.overflow as React.CSSProperties["overflowY"],
                                }}
                            />
                        )}
                        renderTrackHorizontal={() => (
                            <div style={{ display: "none" }} />
                        )}
                        renderThumbVertical={({
                            style,
                            ...props
                        }: {
                            style: React.CSSProperties;
                        } & React.HTMLProps<HTMLDivElement>) => (
                            <div
                                {...props}
                                style={{
                                    ...style,
                                    backgroundColor: "grey",
                                    borderRadius: 4,
                                }}
                            />
                        )}
                    >
                        {user.memberships?.map((membership) => {
                            if (membership.active)
                                return (
                                    <OrgBlock
                                        fluid
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
                        {/* a link, so the keyboard reaches it; hover shades the
                            tile rather than fading its text */}
                        <Link
                            to="/stuyactivities"
                            // the outline is inset, since the scroller clips outside the tile
                            className="flex aspect-square w-full items-center justify-center flex-col rounded-xl px-2 text-center no-underline transition-colors sm:hover:bg-layer-1 border-accent border-dashed border focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-typography-1"
                        >
                            <i
                                className="bx bx-md bx-plus-circle mb-5 text-accent"
                                aria-hidden="true"
                            ></i>
                            <p className="text-accent">Join an Activity!</p>
                        </Link>
                    </Scrollbars>
                    <div
                        className={`relative z-10 -mt-6 mb-8 px-3 sm:px-8 lg:hidden ${
                            showAllTiles || activeCount > 8
                                ? ""
                                : activeCount > 6
                                  ? "md:hidden"
                                  : activeCount > 4
                                    ? "sm:hidden"
                                    : "hidden"
                        }`}
                    >
                        <button
                            ref={toggleRef}
                            type="button"
                            aria-expanded={showAllTiles}
                            aria-controls="home-activity-tiles"
                            onClick={() => {
                                setShowAllTiles(!showAllTiles);
                                if (showAllTiles)
                                    requestAnimationFrame(() =>
                                        toggleRef.current?.scrollIntoView({
                                            block: "nearest",
                                        }),
                                    );
                            }}
                            className="flex min-h-11 w-full items-center justify-center gap-1 rounded-xl bg-layer-1 px-4 text-sm font-semibold text-typography-1 shadow-control transition-colors sm:hover:bg-layer-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                        >
                            {showAllTiles
                                ? "Show fewer"
                                : `Show all ${activeCount} activities`}
                            <i
                                aria-hidden="true"
                                className={`bx bx-chevron-down text-lg transition-transform ${
                                    showAllTiles ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                    </div>
                </div>
                <div className="min-w-0 flex flex-col gap-14">
                    <div className={"relative w-full group"}>
                        <div className={"relative z-10"}>
                            <ItemList
                                title={"My Meetings"}
                                height={"auto"}
                                icon={"bx-calendar-week text-yellow"}
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
                                        advisor={meeting.advisor}
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
                            sm:group-focus-within:translate-y-7
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
                                        "touch-target sm:hover:opacity-75 transition-colors no-underline"
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
                                icon={"bx-message-square-dots text-blue"}
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
                            sm:group-focus-within:translate-y-7
                            transition-transform
                            w-[92%]
                            z-[1]
                            rounded-xl
                            bg-layer-1
                            shadow-control"
                        >
                            {/* a real button, so it works from a keyboard; once
                                there is nothing more it reports itself unavailable
                                but stays focusable, so focus isn't dropped */}
                            <button
                                type="button"
                                aria-disabled={
                                    announcements.length <= visibleAnnouncements
                                }
                                // only the label dims, so the focus outline keeps its
                                // contrast; the gap above is a margin, so the outline
                                // isn't drawn under the list
                                className="group/more touch-target text important mt-4 text-left cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1 aria-disabled:cursor-default"
                                onClick={() => {
                                    if (
                                        announcements.length <=
                                        visibleAnnouncements
                                    )
                                        return;
                                    setVisibleAnnouncements((prev) => prev + 3);
                                }}
                            >
                                <span className="transition-opacity sm:group-hover/more:underline group-aria-disabled/more:opacity-50 sm:group-aria-disabled/more:group-hover/more:no-underline">
                                    View More Announcements
                                </span>
                            </button>
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
