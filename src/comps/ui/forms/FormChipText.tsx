import { Autocomplete, TextField, Chip } from "@mui/material";
import { useEffect, SyntheticEvent } from "react";

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
  changeStatus?: (newStatus: boolean) => void;
  label?: string;
};

const FormChipText = ({
  description,
  required,
  requirements,
  value,
  onChange,
  changeStatus,
  label,
}: Props) => {
  useEffect(() => {
    const validate = (newValue?: string[]) => {
      if (!changeStatus) return;
      if (!newValue) newValue = [];

      if (!required && newValue.length === 0) {
        changeStatus(true);
      }

      if (required) {
        changeStatus(newValue.length > 0);
      }
    };

    validate(value);
  }, [required, requirements, value, changeStatus]);

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

  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={value}
      onChange={valueChanged}
      renderTags={(value, props) => {
        return value.map((option, index) => (
          <Chip label={option} {...props({ index })} />
        ));
      }}
      renderInput={(params) => (
        <TextField
          label={label}
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

export default FormChipText;
