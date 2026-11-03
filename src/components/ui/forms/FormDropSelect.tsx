import { useEffect } from "react";
import { CSSProperties, ReactNode } from "react";
import SelectField from "../input/SelectField";

type SelectType = {
    id: string;
    display: string;
};

type Props = {
    field: string; // field must be in props so FormPage associates values correctly
    value?: string;
    description?: string;
    required?: boolean;
    onChange?: (updatedValue: string) => void;
    status?: {
        dirty: boolean;
        value: boolean;
    };
    changeStatus?: (field: string, newValue: boolean) => void;
    selections: SelectType[];
    label?: ReactNode;
    sx?: CSSProperties;
};

const FormDropSelect = ({
    field,
    value,
    description,
    required,
    onChange,
    status,
    changeStatus,
    selections,
    label,
    sx,
}: Props) => {
    useEffect(() => {
        const validate = (targetValue?: string) => {
            if (!targetValue) targetValue = "";
            if (!changeStatus) return;

            if (!required && targetValue.length === 0) {
                changeStatus(field, true);
                return;
            }

            if (required) {
                changeStatus(field, targetValue.length > 0);
            }
        };

        validate(value);
    }, [required, field, value, changeStatus]);

    return (
        <SelectField
            fullWidth
            label={label}
            required={required}
            sx={sx}
            value={value || ""}
            onChange={onChange}
            options={selections.map((select) => ({
                value: select.id,
                label: select.display,
            }))}
            helperText={description
                ?.split("\n")
                .map((line, i) => <div key={i}>{line}</div>)}
        />
    );
};

export default FormDropSelect;
