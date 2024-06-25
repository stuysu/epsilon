import { ReactNode, useCallback, useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import FormTextField from "../../../ui/forms/FormTextField";
import OrgRequirements from "../../../../utils/OrgRequirements";
import { capitalizeWords } from "../../../../utils/DataFormatters";
import { supabase } from "../../../../supabaseClient";
import { PUBLIC_URL } from "../../../../constants";
import { useNavigate } from "react-router-dom";

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
            <Typography width="100%" variant="h4" sx={{ paddingLeft: "10px" }}>
                {capitalizeWords(field.split("_").join(" "))}
                {pending ? " - Pending" : " - Approved"}
            </Typography>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "nowrap",
                    padding: "10px",
                    marginTop: "10px",
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
                            <Button
                                onClick={onCancel}
                                variant="contained"
                                sx={{ width: "100%" }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        {defaultDisplay}
                        <Box
                            sx={{
                                width: "15%",
                                position: "absolute",
                                right: "20px",
                            }}
                        >
                            <Button
                                onClick={onEdit}
                                variant="contained"
                                sx={{ width: "100%" }}
                            >
                                Edit
                            </Button>
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
    "mission",
    "purpose",
    "benefit",
    "appointment_procedures",
    "uniqueness",
    "meeting_schedule",
];

const hiddenFields: string[] = [
    "id",
    "organization_id",
    "created_at",
    "updated_at",
    "picture", // picture field has custom logic
];

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

    /* everything that is displayed on the page (could include values similar to original)*/
    const [editData, setEditData] = useState<OrganizationEdit>({});

    /* only includes keys who are currently being edited */
    // idk why i split this up, this could both be in one but i was just copy and pasting code from FormPage
    const [editState, setEditState] = useState<EditState>({}); // whether or not a field is being edited
    const [status, setStatus] = useState<FormStatus>({}); // validation status for that field

    /* picture */
    const [editPicture, setEditPicture] = useState<File | null | undefined>();
    const oldPicture =
        existingEdit["picture"] === undefined
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
    }, [status, editState, editData, editPicture]);

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
    }, [existingEdit]);

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
                    payload[field].map((v: any, i: number) => {
                        if (v !== oldValue[i]) {
                            diff = true;
                        }
                    });
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
            editPicture === null &&
            (existingEdit === undefined
                ? organization["picture"]
                : existingEdit["picture"]) !== null
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

            let filePath = `org-pictures/${organization.id}/${Date.now()}-${organization.url}-profile${editPicture!.name.split(".").pop()}`;

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
                benefit: undefined,
                appointment_procedures: undefined,
                uniqueness: undefined,
                meeting_schedule: undefined,
                meeting_days: undefined,
                keywords: undefined,
                tags: undefined,
                commitment_level: undefined,
            });

            // reset edit state
            setEditState({});
            setEditPicture(undefined);
            setStatus({});

            return;
        }

        let data, error;

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
        setEditData({
            ...editData,
            [field]: value,
        });
    };

    const pendingPicture =
        existingEdit.picture !== undefined &&
        existingEdit.picture !== organization.picture;

    return (
        <Paper elevation={1} sx={{ padding: "10px" }}>
            <Typography variant="h3">
                Picture{pendingPicture ? " - Pending" : ""}
            </Typography>
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
                        src={
                            editPicture !== undefined
                                ? editPicture
                                    ? URL.createObjectURL(editPicture)
                                    : ""
                                : oldPicture || ""
                        }
                        sx={{
                            width: "170px",
                            height: "170px",
                            borderRadius: "100%",
                            fontSize: "70px",
                        }}
                    >
                        {(organization.name || "O").slice(0, 1).toUpperCase()}
                    </Avatar>
                </Box>
                <Button
                    variant="contained"
                    component="label"
                    sx={{ marginTop: "10px" }}
                >
                    Upload Image
                    <input
                        type="file"
                        accept="images/*"
                        id="input-file-upload"
                        onChange={(e) => {
                            if (!e.target.files) return;
                            if (e.target.files[0].size > 1024 * 1024 * OrgRequirements.picture?.requirements?.maxSize[0]) {
                                return enqueueSnackbar(
                                    `File is too large. Max size is ${OrgRequirements.picture?.requirements?.maxSize[0]}MB.`, 
                                    {
                                        variant: "error",
                                    }
                                );
                            }

                            setEditPicture(e.target.files[0] || null);
                        }}
                        value={editPicture?.webkitRelativePath}
                        hidden
                    />
                </Button>
                <Button
                    variant="contained"
                    sx={{ marginTop: "10px" }}
                    onClick={() => {
                        if (!oldPicture) {
                            // if there was no old picture to begin with, then removing the picture is like making no edit
                            setEditPicture(undefined);
                        } else {
                            setEditPicture(null);
                        }
                    }}
                >
                    Remove Image
                </Button>
            </Box>
            {textFields.map((field) => {
                return (
                    <EditField
                        key={field}
                        field={field}
                        pending={
                            (existingEdit[field as keyof OrganizationEdit] !==
                                null &&
                            existingEdit[field as keyof OrganizationEdit] !==
                                undefined) ||
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
                            <Typography 
                                sx={{ 
                                    wordWrap: "break-word",
                                    wordBreak: 'break-all',
                                    width: "80%", 
                                    display: "block"
                                }}
                            >
                                {editData[field as keyof OrganizationEdit]}
                            </Typography>
                        }
                        editDisplay={
                            <FormTextField
                                sx={{ width: "80%" }}
                                label={capitalizeWords(
                                    field.split("_").join(" "),
                                )}
                                field={field}
                                onChange={(val) =>
                                    updateEdit(
                                        field as keyof OrganizationEdit,
                                        val,
                                    )
                                }
                                value={
                                    editData[field as keyof OrganizationEdit]
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
                <Button
                    color="error"
                    variant="contained"
                    disabled={!savable}
                    onClick={saveChanges}
                >
                    Save Changes
                </Button>
            </Box>
        </Paper>
    );
};

export default OrgEditor;
