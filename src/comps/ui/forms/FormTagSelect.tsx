import { Autocomplete, TextField, Chip, SxProps } from "@mui/material";
import { SyntheticEvent, useEffect } from "react";

type Requirements = {
    maxSelect: number;
};

type Props = {
    field: string;
    tags: string[];
    description?: string;
    required?: boolean;
    requirements?: Requirements;
    value?: string[];
    onChange?: (newTags: string[]) => void;
    status?: {
        dirty: boolean;
        value: boolean;
    };
    changeStatus?: (newStatus: boolean) => void;
    label?: string;
    sx?: SxProps;
};

const FormTagSelect = ({
    tags,
    description,
    required,
    requirements,
    value,
    onChange,
    changeStatus,
    label,
    sx,
}: Props) => {
    useEffect(() => {
        const validate = (newValue?: string[]) => {
            if (!changeStatus) return;
            if (!newValue) newValue = [];

            if (!required && newValue.length === 0) {
                changeStatus(true);
                return;
            }

            if (required) {
                changeStatus(newValue.length > 0);
            }
        };

        validate(value);
    }, [changeStatus]);

    const valueChanged = (event: SyntheticEvent, newValue: string[]) => {
        if (
            requirements?.maxSelect &&
            newValue.length > requirements.maxSelect
        ) {
            return;
        }

        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <Autocomplete
            multiple
            sx={sx}
            onChange={valueChanged}
            value={value}
            options={tags}
            renderTags={(value, props) => {
                return value.map((option, index) => (
                    <Chip label={option} {...props({ index })} />
                ));
            }}
            renderInput={(params) => (
                <TextField
                    label={label}
                    value={undefined}
                    {...params}
                    helperText={description?.split("\n").map((line) => (
                        <>
                            {line}
                            <br />
                        </>
                    ))}
                />
            )}
        />
    );
};

export default FormTagSelect;
