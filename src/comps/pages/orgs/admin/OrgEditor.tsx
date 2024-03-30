import { useState, ChangeEvent } from "react";
import { Box, Button, TextField } from "@mui/material";

const findDiff = (obj1 : any, obj2 : any) => {
    let diff : ({ key: string, value1: any, value2: any })[] = []

    for (let key of Object.keys(obj1)) {
        if (
            !(key in obj2) ||
            obj1[key] === undefined ||
            obj2[key] === undefined ||
            (!obj1[key] && !obj2[key]) ||
            obj1[key] == obj2[key]
        ) continue;

        diff.push({ key, value1: obj1[key], value2: obj2[key] })
    }

    return diff;
}
/* apply obj1 on obj2. */
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
const OrgEditor = (
    { organization, organizationEdit } : 
    { 
        organization: Partial<Organization>,
        organizationEdit: OrganizationEdit
    }
) => {
    let [orgEdit, setOrgEdit] = useState(organizationEdit)

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        
        setOrgEdit({
            ...orgEdit,
            [name]: value
        })
    }

    /* 
    STEPS 
    - compare all fields that are different between organization and intersection of organizationEdit and organization
    - upsert an organization edit with all different values
    */
    let createEdit = () => {
        let diff = findDiff(apply(organizationEdit, organization), orgEdit);
    }

    return (
        <div>
            <h1>Organization</h1>
            <Box>
                {
                    Object.keys(organizationEdit).map((field, i) => {
                        type orgKey = keyof OrganizationEdit & keyof Organization;
                        let key : orgKey = (field as orgKey);

                        let current : any = orgEdit[key]
                        if (current === undefined) {
                            current = organization[key]
                        }

                        let status = "Approved"
                        if (orgEdit[key] !== undefined) {
                            if (
                                organizationEdit[key] !== orgEdit[key] &&
                                orgEdit[key] != (organization[key] || "")
                            ) {
                                status = "Unsaved"
                            }
                        } else if (organizationEdit[key] !== undefined) {
                            status = "Pending"
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
                    findDiff(apply(organizationEdit, organization), orgEdit).length !== 0 && <Button>Save</Button>
                }
            </Box>

            <pre>{JSON.stringify(organization, undefined, 4)}</pre>
            <h1>Organization Edits</h1>
            <pre>{JSON.stringify(organizationEdit || "NONE", undefined, 4)}</pre>
        </div>
    )
}

export default OrgEditor;