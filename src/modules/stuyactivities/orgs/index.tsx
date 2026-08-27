/* ORG ROUTING INFORMATION HERE */
import React, { useEffect, useState } from "react";
import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";
import OrgContext from "../../../contexts/OrgContext";
import Loading from "../../../components/ui/content/Loading";
import { supabase } from "../../../lib/supabaseClient";
import { Helmet } from "react-helmet";
import { AnimatePresence, motion, Variants } from "framer-motion";
import OrgNav from "./components/OrgNav";

import NotFound from "./pages/NotFound";
import Overview from "./pages/Overview";
import Charter from "./pages/Charter";
import Meetings from "./pages/Meetings";
import Audit from "./pages/Audit";
import Members from "./pages/Members";
import Stream from "./pages/Stream";
import OrgAdminRouter from "./org_admin";
import { useSnackbar } from "notistack";
import { Box, useMediaQuery } from "@mui/material";
import OrgInspector from "./components/OrgInspector";
import MyMeetingAttendance from "./pages/MyMeetingAttendance";

const routeVariants: Variants = {
    initial: {
        opacity: 0,
        y: 16,
        filter: "blur(12px)",
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        },
    },
    exit: {
        opacity: 0,
        y: -16,
        filter: "blur(12px)",
        transition: {
            duration: 0.25,
            ease: [0.4, 0, 1, 1],
        },
    },
};

const OrgRouter = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { orgUrl } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const isMobile = useMediaQuery("(max-width: 1000px)");

    const [org, setOrg] = useState<OrgContextType>({
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
        pinned_notice: "",
        memberships: [],
        meetings: [],
        posts: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getOrgData = async () => {
            const { data, error } = await supabase
                .from("organizations")
                .select(
                    `
                    id,
                    name,
                    socials,
                    url,
                    picture,
                    mission,
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
                `,
                )
                .ilike("url", orgUrl || "");

            if (error) {
                enqueueSnackbar("Error fetching organization.", {
                    variant: "error",
                });
                return;
            }

            if (data?.length === 0) {
                return;
            }

            const organization = data[0] as OrgContextType;
            const { data: noticeData } = await supabase
                .from("organizations")
                .select("pinned_notice")
                .eq("id", organization.id)
                .maybeSingle();

            setOrg({
                ...organization,
                pinned_notice: noticeData?.pinned_notice || "",
            });
        };

        getOrgData().then(() => setLoading(false));
    }, [orgUrl, enqueueSnackbar]);

    if (loading)
        return (
            <main id="activity-page">
                <Loading />
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
                            className={`sm:hidden block w-full h-11 bg-blurDark fixed top-0 backdrop-blur-3xl z-40 border-b-divider border-b`}
                        ></div>
                        <div className={`sm:hidden block mt-10`}></div>
                        <div
                            className={`sm:sticky max-sm:top-0.5 fixed ml-3 sm:ml-6 mt-0.5 sm:mt-2 top-3 z-40 flex`}
                        >
                            <p
                                className={
                                    "important relative -left-px sm:hover:text-typography-1 cursor-pointer"
                                }
                                onClick={() => navigate("/stuyactivities")}
                            >
                                <i
                                    className={
                                        "bx bx-chevron-left bx-sm relative top-[5.5px]"
                                    }
                                ></i>
                                Catalog
                            </p>
                        </div>

                        <Box
                            sx={{
                                width: "100%",
                                marginTop: "10px",
                            }}
                        ></Box>
                        <div className={"ml-3 sm:ml-12 sm:mr-0 mr-3 flex"}>
                            <aside
                                className={"sticky top-14 h-60 z-[40] mb-48"}
                            >
                                <OrgNav isMobile={isMobile} />
                            </aside>
                            <section
                                className={"w-full lg:pr-0 pr-0 min-h-[80vh]"}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={location.pathname}
                                        variants={routeVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
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
                                    </motion.div>
                                </AnimatePresence>
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
