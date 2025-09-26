import { ReactNode, useCallback, useEffect, useState } from "react";
import { Avatar, Box, Paper, useMediaQuery } from "@mui/material";
import { useSnackbar } from "notistack";
import FormTextField from "../../../../../components/ui/forms/FormTextField";
import OrgRequirements from "../../../../../utils/OrgRequirements";
import orgFieldMap from "../../../../../utils/OrgFieldMap";
import { supabase } from "../../../../../lib/supabaseClient";
import { PUBLIC_URL } from "../../../../../config/constants";
import { useNavigate } from "react-router-dom";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import FormTagSelect from "../../../../../components/ui/forms/FormTagSelect";
import FormSection from "../../../../../components/ui/forms/FormSection";
import FormChipText from "../../../../../components/ui/forms/FormChipText";
import UnifiedChipSelector from "../../../../../components/ui/forms/UnifiedChipSelector";

type Props = {
    organization: Partial<Organization>; // Make organization a prop to allow component to become reusable
    existingEdit: OrganizationEdit;
    setPendingEdit: (orgEdit: OrganizationEdit) => void;
};

type EditState = {
    [field: string]: boolean;
};

type FormStatus = {
    [field: string]: {
        dirty: boolean;
        value: boolean;
    };
};

type orgKey = keyof OrganizationEdit & keyof Organization;

function formatStr(a: string | string[] | undefined) {
    let final_value = a;
    final_value = (typeof a == "object" ?
        Array.from(a).join('\n') : a)
    return final_value;
}
const EditField = ({
    field,
    pending,
    editing,
    onCancel,
    onEdit,
    defaultDisplay,
    editDisplay,
}: {
    field: string;
    pending: boolean;
    editing: boolean;
    onCancel: () => void;
    onEdit: () => void;
    defaultDisplay: ReactNode;
    editDisplay: ReactNode;
}) => {
    return (
        <>
            <h4>{orgFieldMap(field)}</h4>
            <p style={{ color: pending ? "gray" : "#2ecc71" }}>
                {pending ? "Pending" : "Approved"}
            </p>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "nowrap",
                    padding: "10px",
                    position: "relative",
                    minHeight: "100px",
                }}
            >
                {editing ? (
                    <>
                        {editDisplay}
                        <Box
                            sx={{
                                width: "15%",
                                position: "absolute",
                                right: "20px",
                            }}
                        >
                            <AsyncButton
                                onClick={onCancel}
                                variant="contained"
                                sx={{ width: "100%" }}
                            >
                                Cancel
                            </AsyncButton>
                        </Box>
                    </>
                ) : (
                    <>
                        {defaultDisplay}
                        <Box
                            sx={{
                                width: "60px",
                                position: "absolute",
                                right: "20px",
                            }}
                        >
                            <AsyncButton
                                onClick={onEdit}
                                variant="contained"
                                sx={{ width: "100%" }}
                            >
                                Edit
                            </AsyncButton>
                        </Box>
                    </>
                )}
            </Box>
        </>
    );
};

// too lazy to write them all out, use array.map to write it faster
const textFields = [
    "name",
    "url",
    "socials",
    "goals",
    "purpose",
    "appointment_procedures",
    "uniqueness",
    "meeting_description",
    "meeting_schedule",
    "faculty_email",
];

const hiddenFields: string[] = [
    "id",
    "organization_id",
    "created_at",
    "updated_at",
    "picture", // picture field has custom logic
];

function arraysEqual(a: string[], b: string[]) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/*
TextField Statuses:
- default is Approved
- once changed but not saved is Unsaved
- once changed and saved is Pending
*/

/* EDGE CASE: changing unapproved back to approved */
/* if organization is pending, just update the organization. if not, create/update an edit */
const OrgEditor = ({
    organization, // current approved organization
    existingEdit,
    setPendingEdit,
}: Props) => {
    const { enqueueSnackbar } = useSnackbar();
    const isMobile = useMediaQuery("(max-width: 640px)");
    /* everything that is displayed on the page (could include values similar to original)*/
    const [editData, setEditData] = useState<OrganizationEdit>({});

    /* only includes keys who are currently being edited */
    // idk why i split this up, this could both be in one but i was just copy and pasting code from FormPage
    const [editState, setEditState] = useState<EditState>({}); // whether or not a field is being edited
    const [status, setStatus] = useState<FormStatus>({}); // validation status for that field

    /* picture */
    const [editPicture, setEditPicture] = useState<
        File | null | undefined | string
    >();

    const [editTags, setEditTags] = useState<string[] | null>(null);

    const oldPicture =
        existingEdit["picture"] === undefined ||
            existingEdit["picture"] === null
            ? organization["picture"]
            : existingEdit["picture"];

    /* validation */
    const [savable, setSavable] = useState(false);

    /* redirection */
    const navigate = useNavigate();

    useEffect(() => {
        /* check if picture is saved before terminating if no other fields are saved */

        if (editPicture !== undefined && editPicture !== oldPicture) {
            setSavable(true);
            return;
        }

        if (editTags !== null && !arraysEqual(editTags, organization.tags!)) {
            setSavable(true);
            return;
        }

        /* check if there is anything to save, if not, terminate */
        let editedFields: string[] = Object.keys(editState);
        if (!editedFields.length) {
            setSavable(false);
            return;
        }

        /* check if the edited fields are different from the original */
        let atleastOneDiff = false;
        for (let field of editedFields) {
            if (hiddenFields.includes(field)) continue;

            let editedValue = editData[field as keyof OrganizationEdit];
            let originalValue =
                existingEdit[field as keyof OrganizationEdit] ||
                organization[field as keyof Organization];

            if (editedValue !== originalValue) {
                atleastOneDiff = true;
                break;
            }
        }

        setSavable(atleastOneDiff);
    }, [
        status,
        existingEdit,
        editState,
        editData,
        editPicture,
        oldPicture,
        organization,
    ]);

    /* update form data if existingEdit changes */
    useEffect(() => {
        // replace undefined fields with organization

        let baseData: OrganizationEdit = {};

        for (let key of Object.keys(existingEdit)) {
            // typescript crying
            let editField = key as keyof OrganizationEdit;
            if (hiddenFields.includes(editField)) continue;

            if (
                existingEdit[editField] === undefined ||
                existingEdit[editField] === null
            ) {
                baseData[editField] =
                    organization[editField as keyof Organization];
            } else {
                baseData[editField] = existingEdit[editField];
            }
        }

        setEditData(baseData);
        console.log(organization);
    }, [existingEdit, organization]);

    useEffect(() => {
        console.log("change:", editData);
    }, [editData]);

    const saveChanges = async () => {
        if (!savable) {
            enqueueSnackbar(
                "Stop tinkering with the website. We know what you're doing.",
                { variant: "warning" },
            );
            return;
        }

        let payload: any = {};

        let allNull = true;
        for (let key of Object.keys(existingEdit)) {
            let field = key as orgKey;
            if (hiddenFields.includes(field)) continue;

            payload[field] = editData[field] || existingEdit[field] || null;

            // if it is equal to the original, approved value, don't put it in the request.
            if (
                typeof payload[field] === "string" ||
                typeof payload[field] === "boolean" ||
                typeof payload[field] === "number"
            ) {
                if (payload[field] === organization[field]) {
                    payload[field] = null;
                }
            } else if (Array.isArray(payload[field])) {
                let diff = false;
                let oldValue = organization[field] as any[];

                if (payload[field].length !== oldValue.length) {
                    diff = true;
                } else {
                    for (const [i, v] of payload[field].entries()) {
                        if (v !== oldValue[i]) {
                            diff = true;
                            break;
                        }
                    }
                }

                if (!diff) payload[field] = null;
            }

            if (payload[field] !== null) {
                allNull = false;
            }
        }

        /* custom logic for adding picture to the payload */
        /* picture is not in the original payload so nothing will manage it in the original loop. it is only edited here  */
        if (
            editPicture === "" &&
            (existingEdit === undefined
                ? organization["picture"]
                : existingEdit["picture"]) !== ""
        ) {
            // picture is null but it wasn't null before
            // picture has to be empty quotes to differentiate it from a null field in OrgEditApproval
            payload.picture = "";
            allNull = false; // even though all the fields could be null, this edit is worth keeping because the picture is different
        } else if (
            editPicture !==
            (existingEdit === undefined
                ? organization["picture"]
                : existingEdit["picture"]) &&
            editPicture
        ) {
            // picture is different, but needs to be uploaded first
            /* Note: any indication of the picture failing to upload will kill the entire org edit process */

            let filePath = `org-pictures/${organization.id}/${Date.now()}-${organization.url}-profile${(editPicture as File)!.name.split(".").pop()}`;

            let { data: storageData, error: storageError } =
                await supabase.storage
                    .from("public-files")
                    .upload(filePath, editPicture!);

            if (storageError || !storageData) {
                return enqueueSnackbar(
                    "Error uploading image to storage. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            let { data: urlData } = await supabase.storage
                .from("public-files")
                .getPublicUrl(filePath);

            if (!urlData) {
                return enqueueSnackbar(
                    "Failed to retrieve image url after upload. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            payload.picture = urlData.publicUrl;
            allNull = false;
        }

        if (allNull) {
            // delete the existing organization edit if it exists
            if (existingEdit.id) {
                let { error: deleteError } = await supabase
                    .from("organizationedits")
                    .delete()
                    .eq("organization_id", organization.id);
                if (deleteError) {
                    enqueueSnackbar(
                        "Error removing redundant organization edit.",
                        { variant: "error" },
                    );
                }

                enqueueSnackbar("Removed redundant organization edit!", {
                    variant: "success",
                });
            } else {
                enqueueSnackbar(
                    "Unexpected behavior: all edit fields were null.",
                    { variant: "warning" },
                );
            }

            // update frontend to removed org edit
            setPendingEdit({
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

            // reset edit state
            setEditState({});
            setEditPicture(undefined);
            setStatus({});

            return;
        }

        let data, error;
        console.log(payload);
        if (organization.state !== "PENDING") {
            if (existingEdit.id === undefined) {
                // insert new

                ({ data, error } = await supabase
                    .from("organizationedits")
                    .insert({ organization_id: organization.id, ...payload })
                    .select());
            } else {
                // update old
                ({ data, error } = await supabase
                    .from("organizationedits")
                    .update({ organization_id: organization.id, ...payload })
                    .eq("id", existingEdit.id)
                    .select());
            }
        } else {
            /* PENDING ORGANIZATION SHOULD JUST BE ALLOWED TO UPDATE */

            // filter out null fields
            for (let key of Object.keys(payload)) {
                if (payload[key] === null) {
                    delete payload[key];
                }
            }
            ({ data, error } = await supabase
                .from("organizations")
                .update(payload)
                .eq("id", organization.id)
                .select());
        }

        if (error || !data) {
            console.error(error);
            return enqueueSnackbar(
                "Error editing organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        if (!data[0]) {
            return enqueueSnackbar(
                "Could not retrieve new data from server. Refresh to see changes.",
                { variant: "warning" },
            );
        }

        if (organization.state === "PENDING") {
            if (payload.url) {
                window.location.href = `${PUBLIC_URL}/${payload.url}/admin/org-edits`;
            } else {
                navigate(0);
            }
        } else {
            // update frontend to reflect changes
            setPendingEdit(data[0] as OrganizationEdit);

            enqueueSnackbar("Organization edit request sent!", {
                variant: "success",
            });

            // reset edit state
            setEditState({});
            setEditPicture(undefined);
            setStatus({});
        }
    };

    const deleteEdit = async () => {
        if (existingEdit.id) {
            let { error: deleteError } = await supabase
                .from("organizationedits")
                .delete()
                .eq("organization_id", organization.id);
            if (deleteError) {
                enqueueSnackbar("Error removing redundant organization edit.", {
                    variant: "error",
                });
            }

            enqueueSnackbar("Removed redundant organization edit!", {
                variant: "success",
            });

            // reset
            navigate(0);
        }
    };

    const changeStatus = useCallback(
        (field: string, newStatus: boolean) => {
            if (status[field] && newStatus === status[field].value) return;

            setStatus((prevState) => ({
                ...prevState,
                [field]: {
                    dirty: true,
                    value: newStatus,
                },
            }));
        },
        [status],
    );

    const updateEdit = (field: keyof OrganizationEdit, value: any) => {
        if (field == "tags") {
            setEditTags(value);
        }
        setEditData({
            ...editData,
            [field]: value,
        });
    };

    const pendingPicture =
        organization.state === "PENDING" ||
        (existingEdit.picture !== undefined &&
            existingEdit.picture !== null &&
            existingEdit.picture !== organization.picture);

    const putPicture =
        editPicture !== undefined
            ? editPicture
                ? URL.createObjectURL(editPicture as File)
                : ""
            : oldPicture || "";

    const allNull = Object.keys(existingEdit).every(
        (key) => existingEdit[key as keyof OrganizationEdit] === undefined,
    );

    return (
        <Paper elevation={1} sx={{ padding: "10px" }}>
            <h4>Picture</h4>
            <p style={{ color: pendingPicture ? "gray" : "#2ecc71" }}>
                {pendingPicture ? " Pending" : "Approved"}
            </p>
            <Box
                sx={{
                    width: "200px",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginBottom: "20px",
                }}
            >
                <Box>
                    <Avatar
                        src={putPicture}
                        sx={{
                            width: "170px",
                            height: "170px",
                            borderRadius: "100%",
                            fontSize: "70px",
                            objectFit: "cover",
                        }}
                    >
                        {(organization.name || "O").slice(0, 1).toUpperCase()}
                    </Avatar>
                </Box>
                <AsyncButton
                    variant="contained"
                    component="label"
                    sx={{ marginTop: "10px" }}
                >
                    Upload Avatar
                    <input
                        type="file"
                        accept="images/*"
                        id="input-file-upload"
                        onChange={(e) => {
                            if (!e.target.files) return;
                            if (
                                e.target.files[0].size >
                                1024 *
                                1024 *
                                OrgRequirements.picture?.requirements
                                    ?.maxSize[0]
                            ) {
                                return enqueueSnackbar(
                                    `File is too large. Max size is ${OrgRequirements.picture?.requirements?.maxSize[0]}MB.`,
                                    {
                                        variant: "error",
                                    },
                                );
                            }

                            setEditPicture(e.target.files[0] || null);
                        }}
                        value={
                            editPicture
                                ? (editPicture as File).webkitRelativePath
                                : ""
                        }
                        hidden
                    />
                </AsyncButton>
                <AsyncButton
                    variant="contained"
                    sx={{ marginTop: "10px" }}
                    onClick={() => {
                        if (!oldPicture) {
                            // if there was no old picture to begin with, then removing the picture is like making no edit
                            setEditPicture(undefined);
                        } else {
                            setEditPicture("");
                        }
                    }}
                >
                    Remove Image
                </AsyncButton>
                {editPicture !== undefined && organization.picture && (
                    <AsyncButton
                        variant="contained"
                        sx={{ marginTop: "10px" }}
                        onClick={async () => {
                            setEditPicture(undefined);
                        }}
                    >
                        Reset Image
                    </AsyncButton>
                )}
            </Box>
            {textFields.map((field) => {
                return (
                    <EditField
                        key={field}
                        field={field}
                        pending={
                            (existingEdit[field as keyof OrganizationEdit] !==
                                null &&
                                existingEdit[
                                field as keyof OrganizationEdit
                                ] !== undefined) ||
                            organization.state === "PENDING"
                        }
                        editing={editState[field]}
                        onCancel={() => {
                            // replace editData with original value
                            updateEdit(
                                field as keyof OrganizationEdit,
                                existingEdit[field as keyof OrganizationEdit] ||
                                organization[field as keyof Organization],
                            );

                            // remove self from list of fields being edited
                            setEditState((prevState) => {
                                const state = { ...prevState };
                                delete state[field];
                                return state;
                            });

                            // remove self from validation checker
                            setStatus((prevState) => {
                                const state = { ...prevState };
                                delete state[field];
                                return state;
                            });
                        }}
                        onEdit={() =>
                            setEditState({ ...editState, [field]: true })
                        }
                        defaultDisplay={
                            <p className={"w-5/6 my-1"}>
                                {formatStr(editData[field as keyof OrganizationEdit]) || (
                                    <em>&lt;empty&gt;</em>
                                )}
                            </p>
                        }
                        editDisplay={
                            <FormTextField
                                sx={{ width: "80%" }}
                                label={orgFieldMap(field)}
                                field={field}
                                onChange={(val) =>
                                    updateEdit(
                                        field as keyof OrganizationEdit,
                                        val,
                                    )
                                }
                                value={
                                    formatStr(editData[field as keyof OrganizationEdit])
                                }
                                required={OrgRequirements[field].required}
                                requirements={
                                    OrgRequirements[field].requirements
                                }
                                changeStatus={changeStatus}
                                multiline
                                rows={4}
                            />
                        }
                    />
                );
            })}
            <FormSection sx={{
                width: "100%",
                display: "flex",
                flexWrap: isMobile ? "wrap" : "nowrap",
                flexDirection: "column",
                gap: "10px"
            }}>
                <UnifiedChipSelector
                    field="keywords"
                    label="Keywords"
                    onChange={(val) => {
                        updateEdit(
                            "keywords" as keyof OrganizationEdit,
                            val.join(","),
                        )
                    }}
                    value={editData.keywords?.split(",") ?? []}
                    required={OrgRequirements.keywords.required}
                    requirements={OrgRequirements.keywords.requirements}
                    description={`You are allowed up to 3 keywords that describe your Activity. These will not be publicly visible but will help your Activity show up in search results. Examples of keywords include alternate names or acronyms, such as 'SU' for the Student Union. Create a keyword using <ENTER> or <,>. PLEASE NOTE: You cannot paste a list of keywords, you must type them manually.`}
                />

                <UnifiedChipSelector
                    field="tags"
                    label="Choose Tags"
                    options={[
                        "Arts & Crafts",
                        "Academic & Professional",
                        "Club Sports & Recreational Games",
                        "Community Service & Volunteering",
                        "Cultural & Religious",
                        "Music",
                        "Public Speaking",
                        "STEM",
                        "Student Support & Government",
                        "Hobby & Special Interest",
                        "Publication",
                    ]}
                    description="Select up to 3 tags that best represent your Activity"
                    required={OrgRequirements.tags.required}
                    requirements={OrgRequirements.tags.requirements}
                    sx={{
                        width: "100%",
                        marginLeft: isMobile ? "" : "0px",
                        marginTop: isMobile ? "20px" : "",
                    }}
                    value={editData.tags ?? []}
                    onChange={(val) =>
                        updateEdit(
                            "tags" as keyof OrganizationEdit,
                            val,
                        )
                    }
                />
            </FormSection>
            <Box
                sx={{
                    width: "100%",
                    marginTop: "20px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "row-reverse",
                    flexWrap: "nowrap",
                }}
            >

                <AsyncButton
                    color="error"
                    variant="contained"
                    disabled={!savable}
                    onClick={saveChanges}
                    sx={{ marginLeft: "10px" }}
                >
                    Submit Changes for Review
                </AsyncButton>
                <AsyncButton
                    color="error"
                    variant="contained"
                    disabled={allNull}
                    onClick={deleteEdit}
                >
                    Delete Edit
                </AsyncButton>
            </Box>
        </Paper>
    );
};

export default OrgEditor;
