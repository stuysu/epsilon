import { useContext, useEffect, useState, ChangeEvent } from "react";
import { Box, Button, TextField } from "@mui/material";

import UserContext from "../../../context/UserContext";

import { supabase } from "../../../../supabaseClient";

type orgKey = keyof OrganizationEdit & keyof Organization;
type diffType = { key: string, value1: any, value2: any }

const hiddenFields : string[] = ["id", "organization_id", "created_at", "updated_at"]

/* NOTES ON SHALLOW COMPARISON
- in this component, there are uses of null, undefined, and empty quotes which all mean similar things.
using shallow comparison is the most convenient solution [for now]
*/

/* find differences in properties of obj1 and obj2 and return those properties */
const findDiff = (obj1 : any, obj2 : any) : diffType[] => {
    let diff : diffType[] = []

    for (let key of Object.keys(obj1)) {
        if (
            !(key in obj2) ||
            obj1[key] === undefined ||
            obj2[key] === undefined ||
            (!obj1[key] && !obj2[key]) ||
            // eslint-disable-next-line
            obj1[key] == obj2[key]
        ) continue;

        diff.push({ key, value1: obj1[key], value2: obj2[key] })
    }

    return diff;
}
/* replace properties on obj2 that obj1 has as well. */
const apply = (obj1 : any, obj2: any) => {
    let obj3 : any = {}

    for (let key of Object.keys(obj1)) {
        if (obj1[key]) {
            obj3[key] = obj1[key]
        } else {
            obj3[key] = obj2[key]
        }
    }

    return obj3;
}

/* 
TextField Statuses:
- default is Approved
- once changed but not saved is Unsaved
- once changed and saved is Pending
*/

/* EDGE CASE: changing unapproved back to approved */
const OrgEditor = (
    { organization, organizationEdit, setPendingEdit } : 
    { 
        organization: Partial<Organization>,
        organizationEdit: OrganizationEdit,
        setPendingEdit: (orgEdit: OrganizationEdit) => void
    }
) => {
    let user = useContext(UserContext)
    let [orgEdit, setOrgEdit] = useState(organizationEdit)

    useEffect(() => {
        setOrgEdit(organizationEdit)
    }, [organizationEdit])

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        
        setOrgEdit({
            ...orgEdit,
            [name]: value
        })
    }

    /* 
    STEPS 
    - compare all fields that are different between orgEdit and organization
    - upsert an organization edit with all different values
    */
    let createEdit = async () => {
        let diffs = findDiff(organization, orgEdit)
        let payload : any = {}

        for (let key of Object.keys(organizationEdit)) {
            if (hiddenFields.includes(key)) continue;

            let field : orgKey = key as orgKey

            payload[field] = null;
        }

        for (let diff of diffs) {
            payload[diff.key] = diff.value2
        }

        let data, error;

        if (organizationEdit.id === undefined) {
            /* INSERT */
            ({ data, error } = await supabase
                .from('organizationedits')
                .insert({ organization_id: organization.id, ...payload })
                .select())

        } else {
            /* UPDATE */
            ({ data, error } = await supabase
                .from('organizationedits')
                .update({ organization_id: organization.id, ...payload })
                .eq('id', organizationEdit.id)
                .select())
        }
        
        if (error) {
            return user.setMessage("Error editing organization. Contact it@stuysu.org for support.")
        }

        if (data !== null) {
            /* update client without sending another call */
            user.setMessage("Organization edit request sent!");
            setPendingEdit(data[0] as OrganizationEdit)
        } else {
            user.setMessage("Server failed to send back data. Refresh page to see potential changes.")
        }
    }

    const canSave = () : boolean => {
        let saveable = false;

        Object.keys(organizationEdit).map(field => {
            if (hiddenFields.includes(field)) return;
            
            let key : orgKey = (field as orgKey);

            if (
                orgEdit[key] !== undefined &&
                orgEdit[key] !== null && 
                organizationEdit[key] !== orgEdit[key] &&
                (
                    (orgEdit[key] != (organization[key] || "")) ||
                    organizationEdit[key] !== null
                )
            ) {
                
                saveable = true;
            }
        })

        return saveable;
    }

    return (
        <div>
            <h1>Organization</h1>
            <Box>
                {
                    Object.keys(organizationEdit).map((field, i) => {
                        if (hiddenFields.includes(field)) return (<></>);
                        
                        let key : orgKey = (field as orgKey);

                        let current : any = orgEdit[key]
                        if (current === undefined || current === null) {
                            current = organization[key]
                        }

                        /* FIGURE OUT STATUS MESSAGE FOR TEXTFIELD */
                        let status = "Approved"

                        if (orgEdit[key] !== undefined && orgEdit[key] !== null) {
                            if (
                                organizationEdit[key] !== orgEdit[key]
                            ) {
                                if (orgEdit[key] != (organization[key] || "")) {
                                    status = "Unsaved"
                                } else if (organizationEdit[key] !== null) {
                                    status = "Approved [Unsaved]"
                                }
                            } else if (orgEdit[key] != (organization[key] || "")) {
                                status = "Pending"
                            }
                        }

                        return (
                            <Box key={i} bgcolor="background.default" color="primary.contrastText">
                                <TextField
                                variant="filled"
                                name={field}
                                label={field}
                                value={current || ""}
                                onChange={onChange}
                                />
                                {status}
                            </Box>
                        )
                    })
                }

                {
                    canSave() && <Button onClick={createEdit}>Save</Button>
                }
            </Box>

            <pre>{JSON.stringify(organization, undefined, 4)}</pre>
            <h1>Organization Edits</h1>
            <pre>{JSON.stringify(organizationEdit || "NONE", undefined, 4)}</pre>
        </div>
    )
}

export default OrgEditor;