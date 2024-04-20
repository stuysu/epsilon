import { useState, ChangeEvent } from "react";

import { Box } from "@mui/material";

const FormUpload = ({ value, onChange } : { value?: File, onChange: (event : ChangeEvent<HTMLInputElement>) => void }) => {
    return (
        <Box>
            <Box>
                <img src={value ? URL.createObjectURL(value) : ""} width="500px" height="500px" />
            </Box>
            <input
                type="file"
                onChange={onChange}
            />
        </Box>
    )
}

export default FormUpload;