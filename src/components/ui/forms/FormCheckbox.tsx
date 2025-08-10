import {
    Checkbox,
    FormControlLabel,
    FormGroup,
    FormHelperText,
} from "@mui/material";

type Props = {
    field: string;
    label?: string;
    value?: boolean;
    description?: string;
    onChange?: (newValue: boolean) => void;
};

/* no requirements or validation, default value in form should be false. */
const FormCheckbox = ({ label, value, description, onChange }: Props) => {
    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={value}
                        onChange={(e) => {
                            if (onChange) onChange(e.target.checked);
                        }}
                    />
                }
                label={label}
            />
            <FormHelperText>
                {description?.split("\n").map((line) => (
                    <>
                        {line}
                        <br />
                    </>
                ))}
            </FormHelperText>
        </FormGroup>
    );
};

export default FormCheckbox;
