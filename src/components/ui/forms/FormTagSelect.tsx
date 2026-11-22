import { CSSProperties, useEffect } from "react";
import TagField from "../input/TagField";
import { useSnackbar } from "notistack";

type Requirements = {
    maxSelect?: number;
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
    changeStatus?: (field: string, newStatus: boolean) => void;
    label?: string;
    sx?: CSSProperties;
};

const FormTagSelect = ({
    field,
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
    }, [changeStatus, field, required, value]);

    const valueChanged = (newValue: string[]) => {
        if (
            requirements?.maxSelect &&
            newValue.length > requirements.maxSelect
        ) {
            enqueueSnackbar("You can select up to 3 tags only.", {
                variant: "error",
            });
            return;
        }

        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <TagField
            label={label}
            sx={sx}
            value={value}
            onChange={valueChanged}
            options={tags}
            helperText={description?.split("\n").map((line, i) => (
                <span key={i}>
                    {line}
                    <br />
                </span>
            ))}
        />
    );
};

export default FormTagSelect;
