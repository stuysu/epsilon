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
    onChange?: (field: string, updatedValue: string) => void,
    changeStatus?: (newStatus : boolean) => void
}

const FormTextField = (
    { 
        field, 
        description,
        required,
        requirements,
        onChange,
        changeStatus,
        ...textFieldProps
    } :
    Props & TextFieldProps
) => {
    useEffect(() => {
        /* set initial validation status */
        if (changeStatus) {
            changeStatus(required ? false : true);
        }
    }, [required]);

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

        if (changeStatus) {
            if (requirements) {
                if (requirements.minChar && targetValue.length < requirements.minChar) {
                    changeStatus(false);
                    return;
                }

                // use event.target.value here in case disableSpaces = true.
                if (requirements.minWords && event.target.value.trim().split(" ").length < requirements.minWords) {
                    changeStatus(false);
                    return;
                }

                changeStatus(true);
            } else {
                if (required) {
                    changeStatus(event.target.value.length > 0);
                }
            }
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