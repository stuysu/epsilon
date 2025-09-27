import { ChangeEvent, useEffect } from "react";
import { TextField, TextFieldProps } from "@mui/material";

type Requirements = {
    minChar?: number;
    maxChar?: number;
    minWords?: number;
    maxWords?: number;
    disableSpaces?: boolean /* replace spaces with dashes */;
    onlyAlpha?: boolean;
    lowercase?: boolean;
};

type Props = {
    field: string; // field must be in props so FormPage associates values correctly
    description?: string;
    required?: boolean;
    requirements?: Requirements;
    value?: string;
    onChange?: (updatedValue: string) => void;
    status?: {
        dirty: boolean;
        value: boolean;
    };
    changeStatus?: (field: string, newStatus: boolean) => void;
    hideHelper?: boolean;
    textHelper?: string;
};

const FormTextField = ({
    field,
    description,
    required,
    requirements,
    value,
    onChange,
    status,
    changeStatus,
    hideHelper,
    textHelper,
    label,
    sx,
    error,
    ...textFieldProps
}: Props & TextFieldProps) => {
    useEffect(() => {
        const validate = (targetValue?: string) => {
            if (!targetValue) targetValue = "";
            if (!changeStatus) return;

            /* incase component gets "dirtied" and then goes back to undefined */
            if (!required && targetValue.length === 0) {
                changeStatus(field, true);
                return;
            }

            if (requirements) {
                if (
                    requirements.minChar &&
                    targetValue.length < requirements.minChar
                ) {
                    changeStatus(field, false);
                    return;
                }

                // does not work with onlyAlpha
                if (
                    requirements.minWords &&
                    targetValue.trim().split(" ").length < requirements.minWords
                ) {
                    changeStatus(field, false);
                    return;
                }

                changeStatus(field, true);
            } else {
                if (required) {
                    changeStatus(field, targetValue.length > 0);
                }
            }
        };

        validate(value);
    }, [required, requirements, field, value, changeStatus]);

    const textChanged = (event: ChangeEvent<HTMLInputElement>) => {
        let targetValue = event.target.value;
        if (
            requirements?.maxChar &&
            targetValue.length > requirements.maxChar
        ) {
            targetValue = targetValue.slice(0, requirements.maxChar);
        }
        if (
            requirements?.maxWords &&
            targetValue.replace(/  +/g, " ").split(" ").length >
            requirements.maxWords
        ) {
            targetValue = targetValue
                .replace(/  +/g, " ")
                .split(" ")
                .slice(0, requirements.maxWords)
                .join(" ");
        }

        if (requirements?.disableSpaces && targetValue.indexOf(" ") !== -1) {
            if (targetValue.length === 1) {
                targetValue = "";
            } else {
                targetValue = targetValue.replace(/ +/g, "-");
            }
        } else if (requirements?.onlyAlpha) {
            targetValue = targetValue.replace(/[^a-z0-9\- ]/gi, "");
        }

        if (requirements?.lowercase) {
            targetValue = targetValue.toLowerCase();
        }

        if (onChange) {
            onChange(targetValue);
        }
    };

    let helperText: string;
    if (!required) {
        helperText = "Optional";
    } else {
        helperText = "Required";
    }

    if (requirements) {
        let countChars = false;
        if (requirements.minChar) {
            countChars = true;
            helperText += `: Minimum ${requirements.minChar} Characters`;
        }

        if (requirements.maxChar && !description) {
            if (countChars) {
                helperText += " to ";
            } else {
                helperText += ":";
            }
            countChars = true;

            helperText += `Maximum ${requirements.maxChar} Characters`;
        }

        if (countChars) helperText += ` (${value?.length || 0}/${requirements.maxChar}).`;

        let countWords = false;

        if (requirements.minWords) {
            if (!countChars) {
                helperText += ":";
            }

            countWords = true;
            helperText += ` Minimum ${requirements.minWords} Words`;
        }

        if (requirements.maxWords) {
            if (!countChars && !countWords) {
                helperText += ":";
            }

            if (countWords) {
                helperText += " to ";
            }

            countWords = true;
            helperText += `Maximum ${requirements.maxWords} Words`;
        }

        if (countWords)
            helperText += ` (${value?.trim().split(" ").length || 0}/${requirements.maxWords})`;
    }
    return (
        <TextField
            required={required}
            error={(required && status && !!value && !status.value) || error!}
            onChange={textChanged}
            value={value}
            helperText={
                !hideHelper && (
                    <>
                        {/* description */}
                        {description?.split("\n").map((line, idx) => (
                            <span key={idx}>
                                {line}
                                <br />
                            </span>
                        ))}
                        
                        {/* internal helper text (requirements like min/max chars/words) */}
                       {textHelper?.split("\n").map((line, idx) => (
                            <span key={idx}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </>
                )
            }
            label={label}
            sx={sx}
            
            {...textFieldProps}
        />
    );
};

export default FormTextField;
