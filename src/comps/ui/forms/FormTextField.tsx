import { ChangeEvent, useEffect } from "react";
import { TextField, TextFieldProps } from "@mui/material"

type Requirements = {
    minChar?: number,
    maxChar?: number,
    minWords?: number,
    maxWords?: number,
    disableSpaces?: boolean,  /* replace spaces with dashes */
    onlyAlpha?: boolean
}

type Props = {
    field: string,
    description?: string,
    required?: boolean,
    requirements?: Requirements,
    value?: string,
    onChange?: (field: string, updatedValue: string) => void,
    status?: {
        dirty: boolean,
        value: boolean
    },
    changeStatus?: (newStatus : boolean) => void
}

const FormTextField = (
    { 
        field, 
        description,
        required,
        requirements,
        value,
        onChange,
        status,
        changeStatus,
        ...textFieldProps
    } :
    Props & TextFieldProps
) => {
    useEffect(() => {
        validate(value);
    }, [required, requirements, value]);

    const validate = (targetValue? : string) => {
        if (!targetValue) targetValue = "";
        if (!changeStatus) return;

        if (!required && targetValue.length === 0) {
            changeStatus(true);
        }

        if (requirements) {
            if (requirements.minChar && targetValue.length < requirements.minChar) {
                changeStatus(false);
                return;
            }

            // does not work with onlyAlpha
            if (requirements.minWords && targetValue.trim().split(" ").length < requirements.minWords) {
                changeStatus(false);
                return;
            }

            changeStatus(true);
        } else {
            if (required) {
                changeStatus(targetValue.length > 0);
            }
        }
    }

    const textChanged = (event: ChangeEvent<HTMLInputElement>) => {
        let targetValue = event.target.value;

        if (
            (requirements?.maxChar && targetValue.length > requirements.maxChar) ||
            (
                requirements?.maxWords && 
                targetValue.replace(/  +/g, ' ').split(" ").length > requirements.maxWords 
            )
        ) {
            return;
        }

        if (
            requirements?.disableSpaces && 
            targetValue.charAt(targetValue.length-1) === ' '
        ) {
            if (targetValue.length === 1) {
                targetValue = ""
            } else if (targetValue.charAt(targetValue.length-2) === '-') {
                return;
            } else {
                targetValue = targetValue.replace(/ +/g, '-');
            }
        } else if (requirements?.onlyAlpha) {
            targetValue = targetValue.replace(/[^a-z0-9\- ]/gi, '')
        }

        if (onChange) {
            onChange(field, targetValue);
        }
    }

    let helperText = "";
    if (!required) {
        helperText = "Optional"
    } else {
        helperText = "*Required"
    }

    if (requirements) {
        let countChars = false;
        if (requirements.minChar) {
            countChars = true;
            helperText += `: min ${requirements.minChar} Characters`;
        }

        if (requirements.maxChar) {
            if (countChars) {
                helperText += ' to'
            } else {
                helperText += ':'
            }
            countChars = true;

            helperText += ` max ${requirements.maxChar} Characters`;
        }

        if (countChars) helperText += `, at ${value?.length || 0}.`

        let countWords = false;

        if (requirements.minWords) {
            if (!countChars) {
                helperText += ":"
            }

            countWords = true;
            helperText += ` min ${requirements.minWords} Words`
        }

        if (requirements.maxWords) {
            if (!countChars && !countWords) {
                helperText += ":"
            }

            if (countWords) {
                helperText += ' to'
            }

            countWords = true;
            helperText += ` max ${requirements.maxWords} Words`
        }

        if (countWords) helperText += `, at ${value?.trim().split(" ").length || 0}.`
    }

    return (
        <TextField
            onChange={textChanged}
            value={value}
            helperText={helperText}
            {...textFieldProps}
        />
    )
}

export default FormTextField;