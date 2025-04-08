/* ORG ROUTING INFORMATION HERE */
import { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import OrgContext from "../../comps/context/OrgContext";
import Loading from "../../comps/ui/Loading";
import { supabase } from "../../supabaseClient";

import OrgNav from "../../comps/pages/orgs/OrgNav";

import NotFound from "./NotFound";
import Overview from "./Overview";
import Charter from "./Charter";
import Meetings from "./Meetings";
import Members from "./Members";
import OrgAdminRouter from "./admin";
import { useSnackbar } from "notistack";
import { Box, useMediaQuery } from "@mui/material";
import OrgInspector from "../../comps/pages/orgs/OrgInspector";

const OrgRouter = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { orgUrl } = useParams();

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

    if (loading) return <Loading />;
    return (
        <OrgContext.Provider value={{ ...org, setOrg }}>
            {org.id === -1 ? (
                <NotFound />
            ) : (
                <>
                    <Box
                        sx={{
                            width: "100%",
                            marginTop: "20px",
                        }}
                    >
                    </Box>
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexWrap: isMobile ? "wrap" : "nowrap",
                        }}
                    >
                        <OrgNav isMobile={isMobile} />
                        <Box sx={{ width: "100%", padding: "10px" }}>
                            <Routes>
                                <Route path={`/`} Component={Overview} />
                                <Route path={`/charter`} Component={Charter} />
                                <Route
                                    path={`/meetings`}
                                    Component={Meetings}
                                />
                                <Route path={`/members`} Component={Members} />
                                <Route
                                    path={`/admin/*`}
                                    Component={OrgAdminRouter}
                                />
                            </Routes>
                        </Box>
                        <OrgInspector/>
                        <Box width={25}></Box>
                    </Box>
                </>
            )}
        </OrgContext.Provider>
    );
};

export default OrgRouter;
