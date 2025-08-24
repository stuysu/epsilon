import React, { useContext, useEffect, useState } from "react";

import { supabase } from "../../../../../lib/supabaseClient";

import OrgContext from "../../../../../contexts/OrgContext";

import OrgEditor from "../components/OrgEditor";

import { useSnackbar } from "notistack";
import { Box } from "@mui/material";

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
            <div
                className={
                    "bg-layer-1 p-5 pl-7 pb-3 rounded-xl mb-10 mt-2 shadow-module"
                }
            >
                <h1>Amend Charter</h1>
                <p>
                    You may update your organization's charter here. Please note
                    that edits are requests to amend, which will be reviewed by
                    the Student Union.
                </p>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                        marginTop: "20px",
                    }}
                ></Box>
            </div>
            <OrgEditor
                organization={organization}
                existingEdit={pendingEdit}
                setPendingEdit={setPendingEdit}
            />
        </Box>
    );
};

export default Organization;
