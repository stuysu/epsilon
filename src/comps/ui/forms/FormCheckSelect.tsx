import { useEffect } from "react";

import {
    CheckboxProps,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    FormHelperText,
} from "@mui/material";

type SelectType = {
    id: string;
    display: string;
};

type Props = {
    field: string; // field must be in props so FormPage associates values correctly
    value?: string[];
    label?: string;
    required?: boolean;
    description?: string;
    onChange?: (updatedSelections: string[]) => void;
    status?: {
        dirty: boolean;
        value: boolean;
    };
    changeStatus?: (field: string, newValue: boolean) => void;
    selections: SelectType[];
};

const FormCheckSelect = ({
    field,
    value,
    label,
    required,
    description,
    onChange,
    status,
    changeStatus,
    selections,
    ...checkboxProps
}: Props & CheckboxProps) => {
    useEffect(() => {
        const validate = (targetValue?: string[]) => {
            if (!targetValue) targetValue = [];
            if (!changeStatus) return;

            if (required) {
                changeStatus(field, targetValue.length > 0);
            }
        };

        validate(value);
    }, [required, field, value, changeStatus]);

    let checked: string[] = value || [];

    const checkboxUpdate = (newSelections: string[]) => {
        if (!onChange) return;

        newSelections = newSelections.filter((v) => v && v.length);

        onChange(newSelections);
    };

    let helperText = "";

    if (required) {
        helperText = "*Required";
    } else {
        helperText = "*Optional";
    }

    return (
        <FormControl>
            {label && <FormLabel>{label}</FormLabel>}
            <FormGroup row>
                {selections.map((select, i) => {
                    return (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    key={i}
                                    checked={checked.includes(select.id)}
                                    onChange={(event) => {
                                        if (
                                            event.target.checked &&
                                            !checked.includes(select.id)
                                        ) {
                                            checkboxUpdate([
                                                ...checked,
                                                select.id,
                                            ]);
                                        } else {
                                            checkboxUpdate(
                                                checked.filter(
                                                    (id) => id !== select.id,
                                                ),
                                            );
                                        }
                                    }}
                                    name={select.display}
                                    {...checkboxProps}
                                />
                            }
                            label={select.display}
                        />
                    );
                })}
            </FormGroup>
            <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
    );
};

export default FormCheckSelect;
