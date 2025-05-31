import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import OrgEditApproval from "../../comps/admin/OrgEditApproval";

import { supabase } from "../../supabaseClient";
import { useSnackbar } from "notistack";

import PendingOrgCard from "../../comps/admin/PendingOrgCard";

const ApproveEdit = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [pendingEdits, setPendingEdits] = useState<EditType[]>([]);
    const [view, setView] = useState<EditType>();

    useEffect(() => {
        const fetchPendingEdits = async () => {
            let pEdits: EditType[] = [];

            let { data, error } = await supabase
                .from("organizationedits")
                .select();

            if (error || !data) {
                return enqueueSnackbar(
                    "Failed to fetch pending edits. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            let orgIds = [];
            for (let edit of data as OrganizationEdit[]) {
                orgIds.push(edit.organization_id);
            }

            /* get name and picture from corresponding organization */
            let { data: odata, error: oerror } = await supabase
                .from("organizations")
                .select(
                    `
                    id,
                    name,
                    picture
                `,
                )
                .in("id", orgIds);

            if (oerror || !odata) {
                return enqueueSnackbar(
                    "Failed to fetch corresponding org data. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            for (let edit of data as OrganizationEdit[]) {
                let meta = odata.find((o) => o.id === edit.organization_id);
                if (!meta) {
                    meta = {
                        id: edit.organization_id,
                        name: `Invalid Organization ID: ${edit.organization_id}`,
                        picture: "",
                    };
                }

                pEdits.push({
                    ...edit,
                    organization_name: meta.name,
                    organization_picture: meta.picture,
                });
            }

            setPendingEdits(pEdits);
        };

        fetchPendingEdits();
    });

    if (view) {
        return (
            <OrgEditApproval
                {...view}
                onBack={() => setView(undefined)}
                onApprove={() => {
                    // remove self from pending edits
                    setPendingEdits(
                        pendingEdits.filter((e) => e.id !== view.id),
                    );
                    setView(undefined);
                }}
                onReject={() => {
                    // remove self from pending edits
                    setPendingEdits(
                        pendingEdits.filter((e) => e.id !== view.id),
                    );
                    setView(undefined);
                }}
            />
        );
    }

    return (
        <Box>
            <Typography variant="h1" align="center">
                Approve Edits
            </Typography>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    padding: "10px",
                    gap: "20px",
                }}
            >
                {pendingEdits.map((edit, i) => {
                    return (
                        <Box
                            key={i}
                            sx={{
                                width: "350px",
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <PendingOrgCard
                                name={edit.organization_name}
                                picture={edit.organization_picture || ""}
                                onView={() => setView(edit)}
                            />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default ApproveEdit;
