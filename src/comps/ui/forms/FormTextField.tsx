import { ChangeEvent } from "react";
import { TextField, TextFieldProps } from "@mui/material"

type Requirements = {
    minChar?: number,
    maxChar?: number,
    minWords?: number,
    maxWords?: number,
    required?: boolean
}

type Props = {
    field: string,
    description?: string,
    requirements?: Requirements,
    onChange?: (field: string, updatedValue: string) => void
}

const FormTextField = (
    { 
        field, 
        description,
        requirements,
        onChange,
        ...textFieldProps
    } :
    Props & TextFieldProps
) => {
    const textChanged = (event: ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(field, event.target.value);
        }
    }

    return (
        <TextField
            onChange={textChanged}
            {...textFieldProps}
        />
    )
}

export default FormTextField;