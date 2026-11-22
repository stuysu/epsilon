import { useEffect } from "react";
import TagField from "../input/TagField";
import { useSnackbar } from "notistack";

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
    const { enqueueSnackbar } = useSnackbar();

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

    const valueChanged = (newValue: string[]) => {
        if (requirements?.maxChips && newValue.length > requirements.maxChips) {
            enqueueSnackbar("You can enter up to 3 keywords only.", {
                variant: "error",
            });
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

    return (
        <TagField
            label={label}
            value={value}
            onChange={valueChanged}
            helperText={description?.split("\n").map((line, i) => (
                <span key={i}>
                    {line}
                    <br />
                </span>
            ))}
        />
    );
};

export default FormChipText;
