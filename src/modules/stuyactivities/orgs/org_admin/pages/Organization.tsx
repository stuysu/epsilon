import React, { useContext, useEffect, useState } from "react";

import { supabase } from "../../../../../lib/supabaseClient";

import OrgContext from "../../../../../contexts/OrgContext";

import OrgEditor from "../components/OrgEditor";

import { useSnackbar } from "notistack";
import { Box, Typography } from "@mui/material";

const Organization = () => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext(OrgContext);

    /* You may notice that some of these fields are undefined when in the database the undefined value is stored as null */
    /* undefined = frontend user has not set it yet */
    /* null = frontend user has set it to the null value */
    const [pendingEdit, setPendingEdit] = useState<OrganizationEdit>({
        id: undefined,
        organization_id: undefined,
        name: undefined,
        socials: undefined,
        url: undefined,
        picture: undefined,
        mission: undefined,
        purpose: undefined,
        goals: undefined,
        appointment_procedures: undefined,
        uniqueness: undefined,
        meeting_description: undefined,
        meeting_schedule: undefined,
        meeting_days: undefined,
        keywords: undefined,
        tags: undefined,
        commitment_level: undefined,
        fair: undefined,
        faculty_email: undefined,
    });

    // eslint-disable-next-line
    useEffect(() => {
        const fetchEdits = async () => {
            const { data, error } = await supabase
                .from("organizationedits")
                .select()
                .eq("organization_id", organization.id);

            if (error || !data) {
                return enqueueSnackbar(
                    "Error fetching organization edits. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            if (data[0]) {
                setPendingEdit(data[0]);
            }
        };

        fetchEdits();
    }, [organization, enqueueSnackbar]);

    return (
        <Box sx={{ width: "100%" }}>
            <Box
                height="100%"
                bgcolor="#1f1f1f80"
                padding={5}
                borderRadius={3}
                marginBottom={3}
                marginTop={1}
                boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
            >
                <Typography variant="h1" align="center" width="100%">
                    Amend Charter
                </Typography>
                <Typography
                    variant="body1"
                    align="center"
                    width="100%"
                    paddingX={"2vw"}
                >
                    You may update your organization's charter here. Please note
                    that edits are requests to amend, which will be reviewed by
                    the Student Union.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                        marginTop: "20px",
                    }}
                ></Box>
            </Box>
            <OrgEditor
                organization={organization}
                existingEdit={pendingEdit}
                setPendingEdit={setPendingEdit}
            />
        </Box>
    );
};

export default Organization;
