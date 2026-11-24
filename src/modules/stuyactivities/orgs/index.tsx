/* ORG ROUTING INFORMATION HERE */
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
    Link,
    Navigate,
    Route,
    Routes,
    useLocation,
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
import usePageMeta from "../../../utils/usePageMeta";
import "../../../styles/transitions.css";
import OrgNav from "./components/OrgNav";
import InviteBanner from "../../../components/ui/InviteBanner";

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
import { SUPPORT_EMAIL } from "../../../config/constants";

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

type OrgAccess = "full" | "member" | "viewer";

/* leaders and site admins get everything; others only what their pages show */
const orgColumns = (access: OrgAccess, signedIn: boolean) => `
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
            ${signedIn ? "email," : ""}
            picture,
            is_faculty,
            active
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
    )${
        access === "full"
            ? ""
            : `,
    last_meeting:meetings (
        start_time
    )`
    }${
        access === "viewer"
            ? ""
            : `,
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
    )`
    }
`;

const OrgRouter = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { orgUrl } = useParams();
    const location = useLocation();
    const user = useContext(UserContext);

    const urlKey = (orgUrl || "").toLowerCase();

    useEffect(() => {
        prefetchOrgList();
    }, []);

    // the club last shown, kept on screen while a new access level refetches
    const [shown, setShown] = useState<{
        url: string;
        org: OrgContextType | null;
    }>();
    const kept = shown?.url === urlKey ? shown.org : undefined;
    // the club's roster is fresher than the profile loaded at sign-in
    const membership = kept
        ? kept.memberships?.find((m) => m.active && m.users?.id === user.id)
        : user.memberships?.find(
              (m) => m.active && m.organizations?.url?.toLowerCase() === urlKey,
          );
    const access: OrgAccess =
        user.permission === "ADMIN" ||
        ["CREATOR", "ADMIN", "ADVISOR"].includes(membership?.role ?? "")
            ? "full"
            : membership
              ? "member"
              : "viewer";

    const {
        data,
        loading,
        error,
        refetch,
        setData: setCachedOrg,
    } = useCachedQuery<OrgContextType | null>(
        ["org", urlKey, access],
        async () => {
            let query = supabase
                .from("organizations")
                .select(orgColumns(access, user.signed_in))
                .ilike("url", urlKey.replace(/[\\%_]/g, "\\$&"));
            if (access !== "full") {
                // upcoming meetings, plus the latest past one for the overview
                const now = new Date().toISOString();
                query = query
                    .gte("meetings.end_time", now)
                    .lt("last_meeting.start_time", now)
                    .order("start_time", {
                        referencedTable: "last_meeting",
                        ascending: false,
                    })
                    .limit(1, { referencedTable: "last_meeting" });
            }
            const { data, error } = await query;
            if (error) {
                enqueueSnackbar("Error fetching organization.", {
                    variant: "error",
                });
                throw error;
            }
            if (!data?.length) return null;
            const org = data[0] as unknown as OrgContextType;
            return { ...org, posts: org.posts ?? [] };
        },
    );
    if (data !== undefined && (shown?.url !== urlKey || shown.org !== data))
        setShown({ url: urlKey, org: data });
    const current = data !== undefined ? data : kept;
    const org = current ?? emptyOrg;
    usePageMeta(
        current
            ? current.name
                ? `${current.name} - Activity on Epsilon`
                : "Unnamed Activity on Epsilon"
            : undefined,
        current?.purpose || undefined,
    );

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
            const membershipChanged = mine(current) !== mine(next);
            setCachedOrg(plain as OrgContextType);
            invalidate(["home"]);
            invalidate(["calendar"]);
            invalidate(["catalog"]);
            invalidate(["joinDates", next.id]);
            // home and the nav list the user's clubs from their profile
            if (membershipChanged) user.refresh?.();
        },
        [setCachedOrg, current, user],
    );

    if (current === undefined && loading)
        return (
            <div id="activity-page" className="relative overflow-x-clip">
                <Loading />
            </div>
        );
    // a failed load isn't a missing club
    if (current === undefined && error)
        return (
            <div id="activity-page" className="relative overflow-x-clip">
                <ContentUnavailable
                    icon="bx-error-circle"
                    iconColor="text-red"
                    title="This activity could not load"
                    description={`Check your connection and try again. If this keeps happening, contact ${SUPPORT_EMAIL}.`}
                    action={
                        <AsyncButton onClick={refetch}>Try Again</AsyncButton>
                    }
                />
            </div>
        );
    return (
        <div id="activity-page" className="relative overflow-x-clip">
            <OrgContext.Provider value={{ ...org, setOrg }}>
                {org.id === -1 ? (
                    <NotFound />
                ) : (
                    <>
                        <div
                            // a sticky bar on phones, so it sits below any site alert; in the flow on tablets; sticky beside the side nav on desktops
                            className={`phone-sticky max-sm:top-0 max-sm:h-11 max-sm:border-b max-sm:border-b-divider max-sm:bg-blurDark max-sm:px-3 max-sm:backdrop-blur-3xl lg:sticky top-3 z-40 sm:ml-[41px] sm:mt-2 flex items-center justify-between sm:mr-12 lg:mr-0 lg:w-fit`}
                        >
                            <Link
                                to="/stuyactivities"
                                state={{ restoreScroll: true }}
                                className={
                                    "important touch-target relative -left-px block text-[0.9rem] leading-[1.2rem] text-typography-2 no-underline sm:hover:text-typography-1 rounded-sm focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                                }
                            >
                                <i
                                    className={
                                        "bx bx-chevron-left bx-sm relative top-[5.5px]"
                                    }
                                ></i>
                                Catalog
                            </Link>
                            <div className="lg:hidden">
                                <OrgNav isMobile />
                            </div>
                        </div>

                        <div className="w-full mt-2.5"></div>
                        <div className="mx-3 sm:mx-12 empty:hidden mb-3">
                            {/* members (or pending joiners) already have a LEAVE or CANCEL JOIN button */}
                            {!org.memberships?.some(
                                (membership) =>
                                    membership.users?.id === user.id,
                            ) && <InviteBanner key={org.id} orgId={org.id} />}
                            {/* for the leaders who can resubmit it */}
                            {org.state === "REJECTED" &&
                                ["CREATOR", "ADMIN"].includes(
                                    membership?.role ?? "",
                                ) &&
                                !location.pathname.endsWith(
                                    "/admin/org-edits",
                                ) && (
                                    <p
                                        role="status"
                                        className="rounded-xl bg-layer-1 p-4 shadow-prominent"
                                    >
                                        The Student Union sent this charter back
                                        for changes. Check{" "}
                                        <Link to={`/${org.url}/admin/messages`}>
                                            Messages
                                        </Link>{" "}
                                        for what to change, then{" "}
                                        <Link
                                            to={`/${org.url}/admin/org-edits`}
                                        >
                                            fix and resubmit it
                                        </Link>
                                        .
                                    </p>
                                )}
                        </div>
                        <div className={"ml-3 sm:ml-12 sm:mr-0 mr-3 flex"}>
                            <aside
                                className={
                                    "sticky top-14 h-60 z-40 mb-48 max-lg:hidden"
                                }
                            >
                                <OrgNav isMobile={false} />
                            </aside>
                            <section
                                className={
                                    "w-full min-w-0 lg:pr-0 pr-0 min-h-[80vh]"
                                }
                            >
                                {/* keyed, so each page fades in as it opens */}
                                <div
                                    key={location.pathname}
                                    className="page-fade-up"
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
                                </div>
                            </section>
                            <div className="max-xl:hidden mt-2 max-xl:bottom-6">
                                <OrgInspector />
                            </div>
                            <div className="max-sm:hidden xl:hidden w-12"></div>
                        </div>
                    </>
                )}
            </OrgContext.Provider>
        </div>
    );
};

export default OrgRouter;
