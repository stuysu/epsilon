import { Autocomplete, Chip, SxProps, TextField } from "@mui/material";
import {
    KeyboardEvent,
    SyntheticEvent,
    useEffect,
    useRef,
    useState,
} from "react";
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
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);
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

    const valueChanged = (event: SyntheticEvent, newValue: string[]) => {
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

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if ((event.key === "Enter" || event.key === ",") && inputValue.trim()) {
            event.preventDefault();
            if (inputValue && !value.includes(inputValue.trim())) {
                const newValue = [...value, inputValue.trim()];
                valueChanged(event as SyntheticEvent, newValue);
            }

            setInputValue(""); // Clear the input value
        }
    };

    const handleInputChange = (
        event: SyntheticEvent,
        newInputValue: string,
    ) => {
        setInputValue(newInputValue);
    };

    return (
        <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={value}
            onChange={valueChanged}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            renderTags={(value, getTagProps) => {
                return value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return <Chip key={index} label={option} {...tagProps} />;
                });
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    helperText={description?.split("\n").map((line, i) => (
                        <span key={i}>
                            {line}
                            <br />
                        </span>
                    ))}
                    onKeyDown={handleKeyDown}
                    inputRef={inputRef}
                />
            )}
        />
    );
};

export default FormChipText;
