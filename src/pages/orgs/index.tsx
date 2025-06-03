/* ORG ROUTING INFORMATION HERE */
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import OrgContext from "../../comps/context/OrgContext";
import Loading from "../../comps/ui/Loading";
import { supabase } from "../../supabaseClient";
import { Helmet } from "react-helmet";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "../../orgTransitions.css";
import OrgNav from "../../comps/pages/orgs/OrgNav";

import NotFound from "./NotFound";
import Overview from "./Overview";
import Charter from "./Charter";
import Meetings from "./Meetings";
import Audit from "./Audit";
import Members from "./Members";
import Stream from "./Stream";
import OrgAdminRouter from "./admin";
import { useSnackbar } from "notistack";
import { Box, useMediaQuery } from "@mui/material";
import OrgInspector from "../../comps/pages/orgs/OrgInspector";

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
            </Helmet>
            <OrgContext.Provider value={{ ...org, setOrg }}>
                {org.id === -1 ? (
                    <NotFound />
                ) : (
                    <>
                        <div
                            className={`sm:hidden block w-full h-14 bg-[#111111] bg-opacity-75 fixed top-0 backdrop-blur-lg z-40 border-b-gray-100 border-opacity-10 border-b`}
                        ></div>
                        <div className={`sm:hidden block mt-14`}></div>
                        <div
                            className={`sm:sticky fixed cursor-pointer transition-colors text-gray-300 hover:text-gray-400 ml-10 mt-4 sm:top-5 top-1 z-40`}
                            onClick={() => navigate("/catalog")}
                        >
                            <i className={"bx bx-chevron-left"}></i>
                            <span
                                style={{
                                    fontVariationSettings: "'wght' 700",
                                    marginLeft: 3,
                                    position: "relative",
                                    top: -1,
                                }}
                            >
                                Back to Catalog
                            </span>
                        </div>

                        <Box
                            sx={{
                                width: "100%",
                                marginTop: "10px",
                            }}
                        ></Box>
                        <div className={"ml-3 sm:ml-14 sm:mr-0 mr-3 flex"}>
                            <div className={"sticky top-10 h-fit z-[40] mb-48"}>
                                <OrgNav isMobile={isMobile} />
                            </div>
                            <div className={"w-full md:pr-14 lg:pr-0 pr-0"}>
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
                                        </Routes>
                                    </CSSTransition>
                                </TransitionGroup>
                            </div>
                            <OrgInspector />
                        </div>
                    </>
                )}
            </OrgContext.Provider>
        </div>
    );
};

export default OrgRouter;
