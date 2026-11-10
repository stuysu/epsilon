/* ORG ROUTING INFORMATION HERE */
import React, { useCallback, useContext, useEffect } from "react";
import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";
import OrgContext from "../../../contexts/OrgContext";
import UserContext from "../../../contexts/UserContext";
import { prefetchOrgList } from "../../../contexts/OrgListContext";
import Loading from "../../../components/ui/content/Loading";
import ContentUnavailable from "../../../components/ui/content/ContentUnavailable";
import AsyncButton from "../../../components/ui/buttons/AsyncButton";
import { supabase } from "../../../lib/supabaseClient";
import useCachedQuery, { invalidate } from "../../../lib/useCachedQuery";
import { Helmet } from "react-helmet";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../../../styles/transitions.css";
import OrgNav from "./components/OrgNav";

import NotFound from "./pages/NotFound";
import Overview from "./pages/Overview";
import Charter from "./pages/Charter";
import Meetings from "./pages/Meetings";
import Audit from "./pages/Audit";
import MyAttendance from "./pages/MyAttendance";
import Members from "./pages/Members";
import Stream from "./pages/Stream";
import OrgAdminRouter from "./org_admin";
import { useSnackbar } from "notistack";

import OrgInspector from "./components/OrgInspector";
import MyMeetingAttendance from "./pages/MyMeetingAttendance";
import pressable from "../../../utils/pressable";

const emptyOrg: OrgContextType = {
    id: -1,
    name: "",
    url: "",
    picture: "",
    mission: "",
    purpose: "",
    goals: "",
    appointment_procedures: "",
    uniqueness: "",
    meeting_description: "",
    meeting_schedule: "",
    meeting_days: [],
    commitment_level: "NONE",
    state: "PENDING",
    joinable: false,
    join_instructions: "",
    memberships: [],
    meetings: [],
    posts: [],
};

const ORG_COLUMNS = `
    id,
    name,
    socials,
    url,
    picture,
    purpose,
    goals,
    appointment_procedures,
    uniqueness,
    meeting_description,
    meeting_schedule,
    meeting_days,
    commitment_level,
    keywords,
    tags,
    faculty_email,
    fair,
    state,
    joinable,
    join_instructions,
    memberships (
        id,
        role,
        role_name,
        ordering_id,
        active,
        users (
            id,
            first_name,
            last_name,
            email,
            picture,
            is_faculty
        )
    ),
    meetings (
        id,
        is_public,
        title,
        description,
        start_time,
        end_time,
        rooms (
            id,
            name,
            floor
        ),
        advisor
    ),
    posts (
        id,
        title,
        description,
        created_at,
        updated_at,
        organizations (
            name,
            picture,
            id
        )
    )
`;

const OrgRouter = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { orgUrl } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useContext(UserContext);

    const urlKey = (orgUrl || "").toLowerCase();

    useEffect(() => {
        prefetchOrgList();
    }, []);

    const {
        data,
        loading,
        error,
        refetch,
        setData: setCachedOrg,
    } = useCachedQuery<OrgContextType | null>(["org", urlKey], async () => {
        const { data, error } = await supabase
            .from("organizations")
            .select(ORG_COLUMNS)
            .ilike("url", urlKey.replace(/[\\%_]/g, "\\$&"));
        if (error) {
            enqueueSnackbar("Error fetching organization.", {
                variant: "error",
            });
            throw error;
        }
        return data?.length ? (data[0] as unknown as OrgContextType) : null;
    });
    const org = data ?? emptyOrg;

    // requests to join arrive from other people, so these pages read them fresh
    const managingMembers = /\/admin\/(roster|join-requests)/.test(
        location.pathname,
    );
    useEffect(() => {
        if (managingMembers) refetch();
    }, [managingMembers, location.pathname, refetch]);

    // every org write goes through here, so pages showing this org's data refresh too
    const setOrg = useCallback(
        (next: OrgContextType) => {
            const { setOrg: _, ...plain } = next;
            const mine = (o?: OrgContextType | null) => {
                const m = o?.memberships?.find((m) => m.users?.id === user.id);
                return m ? `${m.active}:${m.role}` : "";
            };
            const membershipChanged = mine(data) !== mine(next);
            setCachedOrg(plain as OrgContextType);
            invalidate(["home"]);
            invalidate(["calendar"]);
            invalidate(["catalog"]);
            invalidate(["joinDates", next.id]);
            // home and the nav list the user's clubs from their profile
            if (membershipChanged) user.refresh?.();
        },
        [setCachedOrg, data, user],
    );

    if (loading)
        return (
            <main id="activity-page">
                <Loading />
            </main>
        );
    // a failed load isn't a missing club
    if (data === undefined && error)
        return (
            <main id="activity-page">
                <ContentUnavailable
                    icon="bx-error-circle"
                    iconColor="text-red"
                    title="This activity could not load"
                    description="Check your connection and try again. If this keeps happening, contact it@stuysu.org."
                    action={
                        <AsyncButton onClick={refetch}>Try Again</AsyncButton>
                    }
                />
            </main>
        );
    return (
        <main id="activity-page">
            <Helmet>
                <meta
                    property="og:image"
                    content={org.picture || "https://placehold.co/400"}
                />
                <meta
                    property="og:title"
                    content={org.name || "Unnamed Organization"}
                />
                <meta
                    property="og:description"
                    content={org.purpose || "No Description"}
                />
                <title>
                    {org.name
                        ? `${org.name} - Activity on Epsilon`
                        : "Unnamed Activity on Epsilon"}
                </title>
                <meta
                    name="description"
                    content={
                        org.purpose ||
                        "Epsilon is the everything app for Stuyvesant High School. Find and join Activities, browse the calendar, discover new opportunities, and more."
                    }
                />
            </Helmet>
            <OrgContext.Provider value={{ ...org, setOrg }}>
                {org.id === -1 ? (
                    <NotFound />
                ) : (
                    <>
                        <div
                            // a sticky bar on phones, so it sits below any site alert; in the flow on tablets; sticky beside the side nav on desktops
                            className={`phone-sticky max-sm:top-0 max-sm:h-11 max-sm:border-b max-sm:border-b-divider max-sm:bg-blurDark max-sm:px-3 max-sm:backdrop-blur-3xl lg:sticky top-3 z-40 sm:ml-[41px] sm:mt-2 flex items-center justify-between sm:mr-12 lg:mr-0 lg:w-fit`}
                        >
                            <p
                                className={
                                    "important touch-target relative -left-px sm:hover:text-typography-1 cursor-pointer rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                                }
                                {...pressable(
                                    () =>
                                        navigate("/stuyactivities", {
                                            state: { restoreScroll: true },
                                        }),
                                    {
                                        role: "link",
                                    },
                                )}
                            >
                                <i
                                    className={
                                        "bx bx-chevron-left bx-sm relative top-[5.5px]"
                                    }
                                ></i>
                                Catalog
                            </p>
                            <div className="lg:hidden">
                                <OrgNav isMobile />
                            </div>
                        </div>

                        <div className="w-full mt-2.5"></div>
                        <div className={"ml-3 sm:ml-12 sm:mr-0 mr-3 flex"}>
                            <aside
                                className={
                                    "sticky top-14 h-60 z-[40] mb-48 max-lg:hidden"
                                }
                            >
                                <OrgNav isMobile={false} />
                            </aside>
                            <section
                                className={
                                    "w-full min-w-0 lg:pr-0 pr-0 min-h-[80vh]"
                                }
                            >
                                <TransitionGroup component={null}>
                                    <CSSTransition
                                        key={location.pathname}
                                        classNames="fadeup"
                                        timeout={300}
                                    >
                                        <Routes location={location}>
                                            <Route
                                                path={`/`}
                                                Component={Overview}
                                            />
                                            <Route
                                                path={`/my-attendance/:meetingId`}
                                                Component={MyMeetingAttendance}
                                            />
                                            <Route
                                                path={`/charter`}
                                                Component={Charter}
                                            />
                                            <Route
                                                path={`/meetings`}
                                                Component={Meetings}
                                            />
                                            <Route
                                                path={`/members`}
                                                Component={Members}
                                            />
                                            <Route
                                                path={`/audit`}
                                                Component={Audit}
                                            />
                                            <Route
                                                path={`/attendance`}
                                                Component={MyAttendance}
                                            />
                                            <Route
                                                path={`/stream`}
                                                Component={Stream}
                                            />
                                            <Route
                                                path={`/admin/*`}
                                                Component={OrgAdminRouter}
                                            />
                                            <Route
                                                path="*"
                                                element={
                                                    <Navigate to=".." replace />
                                                }
                                            />
                                        </Routes>
                                    </CSSTransition>
                                </TransitionGroup>
                            </section>
                            <div className="max-xl:hidden mt-2 max-xl:bottom-6">
                                <OrgInspector />
                            </div>
                            <div className="max-sm:hidden xl:hidden w-12"></div>
                        </div>
                    </>
                )}
            </OrgContext.Provider>
        </main>
    );
};

export default OrgRouter;
