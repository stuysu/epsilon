import { useEffect } from "react";

import CheckboxField from "../input/CheckboxField";

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
}: Props) => {
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

    let helperText: string;

    if (required) {
        helperText = "*Required";
    } else {
        helperText = "*Optional";
    }

    return (
        <div className="inline-flex flex-col">
            {label && (
                <p className="text-black/60 scheme-dark:text-white/70">
                    {label}
                </p>
            )}
            <div className="flex flex-row flex-wrap">
                {selections.map((select) => (
                    <CheckboxField
                        key={select.id}
                        checked={checked.includes(select.id)}
                        label={select.display}
                        onChange={(isChecked) => {
                            if (isChecked && !checked.includes(select.id)) {
                                checkboxUpdate([...checked, select.id]);
                            } else {
                                checkboxUpdate(
                                    checked.filter((id) => id !== select.id),
                                );
                            }
                        }}
                    />
                ))}
            </div>
            <p className="mt-[3px] text-[0.75rem] leading-[1.66] text-black/60 scheme-dark:text-white/70">
                {helperText}
            </p>
        </div>
    );
};

export default FormCheckSelect;
