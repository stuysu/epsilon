import { ReactNode, useEffect, useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import FormTextField from "../../../ui/forms/FormTextField";
import OrgRequirements from "../../../../utils/OrgRequirements";
import { capitalizeWords } from "../../../../utils/DataFormatters";

type Props = {
    organization: Partial<Organization>, // Make organization a prop to allow component to become reusable
    existingEdit: OrganizationEdit
}

type EditState = {
    [field: string]: boolean;
}

const EditField = (
    {
        field,
        editing,
        onCancel,
        onEdit,
        defaultDisplay,
        editDisplay
    } :
    {
        field: string,
        editing: boolean,
        onCancel: () => void,
        onEdit: () => void,
        defaultDisplay: ReactNode,
        editDisplay: ReactNode
    }
) => {
    return (
        <>
            <Typography width='100%' variant='h4' sx={{ paddingLeft: '10px' }}>{capitalizeWords(field.split("_").join(" "))}</Typography>
            <Box sx={{ width: '100%', display: 'flex', flexWrap: 'nowrap', padding: '10px', marginTop: '10px', position: 'relative', minHeight: '100px' }}>
                
                {editing ?
                    (
                        <>
                            {editDisplay}
                            <Box sx={{ width: '15%', position: 'absolute', right: '20px' }}>
                                <Button onClick={onCancel} variant='contained' sx={{ width: '100%'}}>Cancel</Button>
                            </Box>
                        </>
                    ) : (
                        <>
                            {defaultDisplay}
                            <Box sx={{ width: '15%', position: 'absolute', right: '20px' }}>
                                <Button onClick={onEdit} variant='contained' sx={{ width: '100%'}}>Edit</Button>
                            </Box>
                        </>
                    )
                }
            </Box>
        </>
    )
}

// too lazy to write them all out, use array.map to write it faster
const textFields = ['name', 'url', 'commitment_level', 'socials', 'mission', 'purpose', 'benefit', 'appointment_procedures', 'uniqueness', 'meeting_schedule']

/* 
TextField Statuses:
- default is Approved
- once changed but not saved is Unsaved
- once changed and saved is Pending
*/

/* EDGE CASE: changing unapproved back to approved */
/* if organization is pending, just update the organization. if not, create/update an edit */
const OrgEditor = (
    {
        organization, // current approved organization
        existingEdit
    } : Props
) => {
    const { enqueueSnackbar } = useSnackbar();
    
    const [editData, setEditData] = useState<OrganizationEdit>({}); // proposed edits (should be different from current organization)
    const [editState, setEditState] = useState<EditState>({});

    /* update form data if existingEdit changes */
    useEffect(() => {
        // replace undefined fields with organization

        let baseData = existingEdit;

        for (let key of Object.keys(existingEdit)) {
            // typescript crying
            let editField = key as keyof OrganizationEdit
            if (baseData[editField] === undefined) {
                baseData[editField] = organization[editField as keyof Organization]
            }
        }

        setEditData(baseData);
    }, [existingEdit]);

    /* validation */

    const updateEdit = (field : keyof OrganizationEdit, value: any) => {
        setEditData(
            {
                ...editData,
                [field]: value
            }
        )
    }

    return (
        <Paper
            elevation={1}
            sx={{ padding: '10px'}}
        >
            {
                textFields.map(
                    field => (
                        <EditField 
                            key={field}
                            field={field}
                            editing={editState[field]}
                            onCancel={() => {
                                updateEdit(
                                    field as keyof OrganizationEdit, 
                                    existingEdit[field as keyof OrganizationEdit] ||
                                    organization[field as keyof Organization]
                                )
                                setEditState({ ...editState, [field]: false })
                            }}
                            onEdit={() => setEditState({ ...editState, [field]: true })}
                            defaultDisplay={<Typography width='80%'>{editData[field as keyof OrganizationEdit]}</Typography>}
                            editDisplay={
                                <FormTextField
                                    sx={{ width: '80%'}}
                                    label={capitalizeWords(field.split("_").join(" "))}
                                    field={field}
                                    onChange={val => updateEdit(field as keyof OrganizationEdit, val)}
                                    value={editData[field as keyof OrganizationEdit]}
                                    required={OrgRequirements[field].required}
                                    requirements={OrgRequirements[field].requirements}
                                    multiline
                                    rows={4}
                                />
                            }
                        />
                    )
                )
            }
        </Paper>
    );
};

export default OrgEditor;
