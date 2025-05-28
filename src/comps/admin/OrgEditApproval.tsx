import { useEffect, useState } from "react";

import { Avatar, Card, Divider, Stack, Typography } from "@mui/material";

import { supabase } from "../../supabaseClient";
import { useSnackbar } from "notistack";
import OrgChat from "./OrgChat";
import AsyncButton from "../ui/AsyncButton";
import orgFieldMap from "../../utils/OrgFieldMap";

type EditKey = keyof EditType;

const editFields: EditKey[] = [
    "name",
    "url",
    "socials",
    "picture",
    "mission",
    "goals",
    "purpose",
    "appointment_procedures",
    "uniqueness",
    "meeting_description",
    "meeting_schedule",
    "meeting_days",
    "keywords",
    "tags",
    "commitment_level",
    "fair",
    "faculty_email",
];

const OrgEditApproval = ({
    onBack,
    onApprove,
    onReject,
    ...edit
}: {
    onBack: () => void;
    onReject: () => void;
    onApprove: () => void;
} & EditType) => {
    const { enqueueSnackbar } = useSnackbar();

    /* fetch current org data to compare to */
    let [currentOrg, setCurrentOrg] = useState<Partial<Organization>>({});
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    let [fields, setChangedFields] = useState<string[]>([]);

    useEffect(() => {
        /* find not null fields */
        let changedFields: string[] = [];
        for (let key of Object.keys(edit)) {
            let field: EditKey = key as EditKey;
            if (!editFields.includes(field)) continue;

            if (edit[field] !== null) {
                changedFields.push(key);
            }
        }

        let qs = changedFields.join(",\n");

        const fetchCurrentOrg = async () => {
            let { data, error } = await supabase
                .from("organizations")
                .select(qs)
                .eq("id", edit.organization_id);

            if (error || !data) {
                return enqueueSnackbar(
                    "Could not fetch current organization data. Please contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            setCurrentOrg(data[0] as Partial<Organization>);
            setChangedFields(changedFields);
        };

        fetchCurrentOrg();
    }, [edit, enqueueSnackbar]);

    const approve = async () => {
        setButtonsDisabled(true);
        let error;
        let updatedFields: any = {};

        for (let field of fields) {
            updatedFields[field] = edit[field as EditKey];
        }

        /* apply changes to organization */
        ({ error } = await supabase.functions.invoke(
            "approve-organization-edit",
            {
                body: {
                    organization_id: edit.organization_id,
                    updated_fields: updatedFields,
                    edit_id: edit.id,
                },
            },
        ));

        if (error) {
            setButtonsDisabled(false);
            return enqueueSnackbar(
                "Error updating organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        setButtonsDisabled(false);
        enqueueSnackbar("Organization edit approved!", { variant: "success" });
        onApprove();
    };

    const reject = async () => {
        setButtonsDisabled(true);
        let error;
        ({ error } = await supabase.functions.invoke(
            "reject-organization-edit",
            {
                body: {
                    organization_id: edit.organization_id,
                    edit_id: edit.id,
                },
            },
        ));

        if (error) {
            setButtonsDisabled(false);
            return enqueueSnackbar(
                "Error deleting organization edit. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        setButtonsDisabled(false);
        enqueueSnackbar("Organization edit rejected.", { variant: "success" });
        onReject();
    };

    return (
        <div className="m-10">
            <div className="mb-10 flex flex-row justify-between items-center">
                <Typography variant="h1" width="100%">
                    <span className={"text-green-600"}>Changes to</span>{" "}
                    {edit.organization_name}
                </Typography>
                <div className={"flex flex-row w-min"}>
                    <AsyncButton
                        variant="contained"
                        onClick={onBack}
                        sx={{ marginRight: "10px" }}
                    >
                        Back
                    </AsyncButton>
                    <AsyncButton
                        variant="contained"
                        onClick={approve}
                        color="success"
                        sx={{ marginRight: "10px" }}
                        disabled={buttonsDisabled}
                    >
                        Approve
                    </AsyncButton>
                    <AsyncButton
                        variant="contained"
                        onClick={reject}
                        color="secondary"
                        sx={{ marginRight: "10px" }}
                        disabled={buttonsDisabled}
                    >
                        Reject
                    </AsyncButton>
                </div>
            </div>
            <Stack direction="row" gap={3}>
                <Card sx={{ width: "70%", padding: "10px" }}>
                    {fields.map((field, i) => {
                        let f2: EditKey = field as EditKey;

                        if (f2 === "picture") {
                            return (
                                <>
                                    <Typography variant="h5" fontWeight={600}>
                                        {field}
                                    </Typography>
                                    <Avatar
                                        src={edit[f2] as string}
                                        alt={edit.organization_name}
                                        style={{
                                            width: "150px",
                                            height: "150px",
                                            fontSize: "60px",
                                            objectFit: "cover",
                                        }}
                                    >
                                        {edit.organization_name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </Avatar>
                                    <Divider sx={{ margin: "10px" }} />
                                </>
                            );
                        }

                        return (
                            <>
                                <Typography variant="h5" fontWeight={600}>
                                    {orgFieldMap(field)}
                                </Typography>
                                <Typography variant="body2">
                                    {`"${edit[f2]}"`}
                                </Typography>
                                <Divider sx={{ margin: "10px" }} />
                            </>
                        );
                    })}
                </Card>
                <div className="max-h-[70vh] sticky top-32">
                    <OrgChat organization_id={edit.organization_id} />
                </div>
            </Stack>
        </div>
    );
};

export default OrgEditApproval;
