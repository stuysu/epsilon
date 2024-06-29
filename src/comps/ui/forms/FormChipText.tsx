import { Autocomplete, TextField, Chip } from "@mui/material";
import { useEffect, SyntheticEvent, KeyboardEvent } from "react";

type Requirements = {
    maxChips?: number;
    onlyAlpha?: boolean;
    lowercase?: boolean;
};

type Props = {
    field: string;
    description?: string;
    required?: boolean;
    requirements?: Requirements;
    value?: string[];
    onChange?: (updatedValue: string[]) => void;
    status?: {
        dirty: boolean;
        value: boolean;
    };
    changeStatus?: (field: string, newStatus: boolean) => void;
    label?: string;
};

const FormChipText = ({
    field,
    description,
    required,
    requirements,
    value = [],
    onChange,
    changeStatus,
    label,
}: Props) => {
    useEffect(() => {
        const validate = (newValue?: string[]) => {
            if (!changeStatus) return;
            if (!newValue) newValue = [];

            if (!required && newValue.length === 0) {
                changeStatus(field, true);
                return;
            }

            if (required) {
                changeStatus(field, newValue.length > 0);
            }
        };

        validate(value);
    }, [required, requirements, value, changeStatus, field]);

    const valueChanged = (event: SyntheticEvent, newValue: string[]) => {
        if (requirements?.maxChips && newValue.length > requirements.maxChips) {
            return;
        }

        if (requirements?.lowercase) {
            newValue = newValue.map((s) => s.toLowerCase());
        }

        if (requirements?.onlyAlpha) {
            newValue = newValue.map((s) => s.replace(/[^a-z0-9 ]/gi, ""));
        }

        if (onChange) {
            onChange(newValue);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const inputElement = event.currentTarget.querySelector('input');
        const inputValue = inputElement?.value.trim();

        if ((event.key === 'Enter' || event.key === ',') && inputValue) {
            event.preventDefault();
            if (inputValue && !value.includes(inputValue)) {
                const newValue = [...value, inputValue];
                valueChanged(event as SyntheticEvent, newValue);
            }

            if (inputElement) {
                inputElement.value = '';
            }
        }
    };

    return (
        <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={value}
            onChange={valueChanged}
            renderTags={(value, getTagProps) => {
                return value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                        <Chip 
                            key={index} 
                            label={option} 
                            {...tagProps}
                        />
                    );
                });
            }}
            renderInput={(params) => (
                <TextField
                    label={label}
                    {...params}
                    helperText={description?.split("\n").map((line, i) => (
                        <span key={i}>
                            {line}
                            <br />
                        </span>
                    ))}
                    onKeyDown={handleKeyDown}
                />
            )}
        />
    );
};

export default FormChipText;