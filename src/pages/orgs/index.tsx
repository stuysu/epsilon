/* ORG ROUTING INFORMATION HERE */
import React, { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import OrgContext from "../../comps/context/OrgContext";
import { supabase } from "../../supabaseClient";

import OrgNav from "../../comps/pages/orgs/OrgNav";

import Overview from "./Overview";
import Charter from "./Charter";
import Meetings from "./Meetings";
import Members from "./Members";
import OrgAdminRouter from "./admin";
import { useSnackbar } from "notistack";
import { Box, useMediaQuery } from "@mui/material";

const OrgRouter = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { orgUrl } = useParams();

  const isMobile = useMediaQuery("(max-width: 700px)");

  const [org, setOrg] = useState<OrgContextType>({
    id: -1,
    name: "",
    url: "",
    picture: "",
    mission: "",
    purpose: "",
    benefit: "",
    appointment_procedures: "",
    uniqueness: "",
    meeting_schedule: "",
    meeting_days: [],
    commitment_level: "NONE",
    state: "PENDING",
    joinable: false,
    join_instructions: "",
    memberships: [],
    meetings: [],
  });

  useEffect(() => {
    const getOrgData = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select(
          `
                    id,
                    name,
                    url,
                    picture,
                    mission,
                    purpose,
                    benefit,
                    appointment_procedures,
                    uniqueness,
                    meeting_schedule,
                    meeting_days,
                    commitment_level,
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
                    )
                `,
        )
        .eq("url", orgUrl);

      if (error) {
        enqueueSnackbar("Error fetching organization.", { variant: "error" });
        return;
      }

      if (data?.length === 0) {
        enqueueSnackbar("Invalid organization URL.", { variant: "error" });
        return;
      }

      setOrg(data[0] as OrgContextType);
    };

    getOrgData();
  }, [orgUrl]);

  return (
    <OrgContext.Provider value={{...org, setOrg}}>
      {org.id === -1 ? (
        <div></div> /* ORG DOESN'T EXIST HERE */
      ) : (
        <Box sx={{ width: '100%', display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <OrgNav isMobile={isMobile} />
          <Box sx={{ width: '100%'}}>
            <Routes>
              <Route path={`/`} Component={Overview} />
              <Route path={`/charter`} Component={Charter} />
              <Route path={`/meetings`} Component={Meetings} />
              <Route path={`/members`} Component={Members} />
              <Route path={`/admin/*`} Component={OrgAdminRouter} />
            </Routes>
          </Box>
        </Box>
      )}
    </OrgContext.Provider>
  );
};

export default OrgRouter;
