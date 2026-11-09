import { Fragment, useEffect, useState } from "react";
import LinkSummary from "../../orgs/components/LinkSummary";

import Divider from "../../../../components/ui/Divider";

import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import OrgChat from "./OrgChat";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import orgFieldMap from "../../../../utils/OrgFieldMap";
import Avatar from "../../../../components/ui/Avatar";
import {
    functionErrorStatus,
    functionErrorText,
} from "../../../../utils/FunctionErrors";

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
    const [currentOrg, setCurrentOrg] = useState<Partial<Organization>>({});
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [fields, setChangedFields] = useState<string[]>([]);

    useEffect(() => {
        /* find not null fields */
        const changedFields: string[] = [];
        for (const key of Object.keys(edit)) {
            const field: EditKey = key as EditKey;
            if (!editFields.includes(field)) continue;

            if (edit[field] !== null) {
                changedFields.push(key);
            }
        }

        const qs = changedFields.join(",\n");

        const fetchCurrentOrg = async () => {
            const { data, error } = await supabase
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
        const updatedFields: any = {};

        for (const field of fields) {
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
            const message = await functionErrorText(error);
            enqueueSnackbar(
                message ||
                    "Error updating organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            /* already handled by someone else: refresh the list */
            if (functionErrorStatus(error) === 404) onApprove();
            return;
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
            enqueueSnackbar(
                (await functionErrorText(error)) ||
                    "Error deleting organization edit. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            /* already handled by someone else: refresh the list */
            if (functionErrorStatus(error) === 404) onReject();
            return;
        }

        setButtonsDisabled(false);
        enqueueSnackbar("Organization edit rejected.", { variant: "success" });
        onReject();
    };

    return (
        <div className="m-10">
            <div className="mb-10 flex flex-col sm:flex-row justify-between items-center">
                <h1 className={"font-['instrument-serif'] font-normal"}>
                    <span className={"text-accent"}>Charter Changes: </span>{" "}
                    {edit.organization_name}
                </h1>
                <div className={"flex flex-row w-min"}>
                    <AsyncButton onClick={onBack} sx={{ marginRight: "10px" }}>
                        Back
                    </AsyncButton>
                    <AsyncButton
                        onClick={approve}
                        color="success"
                        sx={{ marginRight: "10px" }}
                        disabled={buttonsDisabled}
                    >
                        Approve
                    </AsyncButton>
                    <AsyncButton
                        onClick={reject}
                        color="secondary"
                        sx={{ marginRight: "10px" }}
                        disabled={buttonsDisabled}
                    >
                        Reject
                    </AsyncButton>
                </div>
            </div>
            <div className={"flex flex-col sm:flex-row gap-10"}>
                <div className={"w-full flex flex-col gap-2"}>
                    {fields.map((field) => {
                        const f2: EditKey = field as EditKey;

                        if (f2 === "picture") {
                            return (
                                <Fragment key={field}>
                                    <h4 className={"capitalize"}>
                                        {field}{" "}
                                        <i className={"bx bx-refresh"}></i>
                                    </h4>
                                    <Avatar
                                        src={edit[f2] as string}
                                        alt={edit.organization_name}
                                        style={{
                                            borderRadius: "15px",
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
                                    <Divider />
                                </Fragment>
                            );
                        }

                        return (
                            <Fragment key={field}>
                                <h4>
                                    {orgFieldMap(field)}{" "}
                                    <i className={"bx bx-refresh"}></i>
                                </h4>
                                <p>
                                    {f2 === "socials" ? (
                                        <LinkSummary
                                            socials={edit[f2] as string}
                                        />
                                    ) : (
                                        `"${edit[f2]}"`
                                    )}
                                </p>
                                <Divider />
                            </Fragment>
                        );
                    })}
                </div>

                <div className="h-fit sticky top-12 w-full mb-12">
                    <OrgChat organization_id={edit.organization_id} />
                </div>
            </div>
        </div>
    );
};

export default OrgEditApproval;
