import { useState, ChangeEvent } from "react";

import { Box } from "@mui/material";

type Props = {
    value: File,
    field: string,
    onChange?: (field: string, updatedValue: File) => void
}

const FormUpload = (
    { 
        value, 
        field, 
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
            <Box>
                <img src={value ? URL.createObjectURL(value) : ""} width="500px" height="500px" />
            </Box>
            <input
                type="file"
                onChange={fileChanged}
            />
        </Box>
    )
}

export default FormUpload;