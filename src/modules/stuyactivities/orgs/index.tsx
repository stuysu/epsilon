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
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../../../styles/transitions.css";
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
                        )
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

            setOrg(data[0] as OrgContextType);
        };

        getOrgData().then(() => setLoading(false));
    }, [orgUrl, enqueueSnackbar]);

    if (loading)
        return (
            <div id="activity-page">
                <Loading />
            </div>
        );
    return (
        <div id="activity-page">
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
                        ? `${org.name} - Epsilon`
                        : "Unnamed Organization - Epsilon"}
                </title>
                <meta
                    name="description"
                    content={
                        org.purpose ||
                        "Epsilon is the Everything App for Stuyvesant High School."
                    }
                />
            </Helmet>
            <OrgContext.Provider value={{ ...org, setOrg }}>
                {org.id === -1 ? (
                    <NotFound />
                ) : (
                    <>
                        <div
                            className={`sm:hidden block w-full h-14 bg-[#111111] bg-opacity-75 fixed top-0 backdrop-blur-lg z-40 border-b-gray-100 border-opacity-10 border-b`}
                        ></div>
                        <div className={`sm:hidden block mt-10`}></div>
                        <div
                            className={`sm:sticky max-sm:top-0.5 fixed cursor-pointer ml-6 mt-2 top-3 z-40 flex`}
                            onClick={() => navigate("/stuyactivities")}
                        >
                            <p
                                className={
                                    "important relative -left-px hover:text-typography-1"
                                }
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
                            <div
                                className={"sticky top-14 max-h-1 z-[40] mb-48"}
                            >
                                {/*1 max height to not break sticky layout*/}
                                <OrgNav isMobile={isMobile} />
                            </div>
                            <div className={"w-full lg:pr-0 pr-0 min-h-[80vh]"}>
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
                            </div>
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
