import { ChangeEvent } from "react";

import { Box } from "@mui/material";

type FileType = "image/png" | "image/jpeg" | "image/webp"

type Requirements = {
    maxSize: [number, "MB"],
    types: FileType[]
}

type Props = {
    value?: File,
    field: string,
    requirements?: Requirements,
    display?: boolean,
    onChange?: (field: string, updatedValue: File) => void
}

const FormUpload = (
    { 
        value, 
        field,
        requirements, 
        display,
        onChange 
    } : 
    Props
) => {
    const fileChanged = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        if (!onChange) return;

        onChange(field, event.target.files[0]);
    }

    return (
        <Box>
            { 
                (display && value) && (
                    <Box>
                        <img src={value ? URL.createObjectURL(value) : ""} width="100px" height="100px" />
                    </Box>
                )
            }
            <input
                type="file"
                onChange={fileChanged}
            />
        </Box>
    )
}

export default FormUpload;