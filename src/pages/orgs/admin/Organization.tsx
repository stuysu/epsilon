import { useState, useEffect, useContext } from "react";

import { supabase } from "../../../supabaseClient";

import OrgContext from "../../../comps/context/OrgContext";

import OrgEditor from "../../../comps/pages/orgs/admin/OrgEditor";

import { useSnackbar } from "notistack";
import { Box, Typography } from "@mui/material";

const Organization = () => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext(OrgContext);
    const [pendingEdit, setPendingEdit] = useState<OrganizationEdit>({
        id: undefined,
        organization_id: undefined,
        name: undefined,
        socials: undefined,
        url: undefined,
        picture: undefined,
        mission: undefined,
        purpose: undefined,
        benefit: undefined,
        appointment_procedures: undefined,
        uniqueness: undefined,
        meeting_schedule: undefined,
        meeting_days: undefined,
        keywords: undefined,
        tags: undefined,
        commitment_level: undefined,
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
    }, [organization]);

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h1" align="center" width="100%">
                Edit Charter
            </Typography>
            <OrgEditor
                organization={organization}
                existingEdit={pendingEdit}
            />
        </Box>
    );
};

export default Organization;
