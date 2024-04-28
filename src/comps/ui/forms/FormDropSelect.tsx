import { useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  SelectProps,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";

type SelectType = {
  id: string;
  display: string;
};

type Props = {
  field: string;
  value?: string;
  description?: string;
  required?: boolean;
  onChange?: (updatedValue: string) => void;
  status?: {
    dirty: boolean;
    value: boolean;
  };
  changeStatus?: (newValue: boolean) => void;
  selections: SelectType[];
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
  ...selectProps
}: Props & SelectProps) => {
  useEffect(() => {
    validate(value);
  }, [required, value]);

  const validate = (targetValue?: string) => {
    if (!targetValue) targetValue = "";
    if (!changeStatus) return;

    if (!required && targetValue.length === 0) {
      changeStatus(true);
      return;
    }

    if (required) {
      changeStatus(targetValue.length > 0);
    }
  };

  const selectionChanged = (event: SelectChangeEvent<unknown>) => {
    if (!onChange) return;

    onChange(event.target.value as string);
  };

  let helperText = "";

  if (required) {
    helperText = "*Required";
  } else {
    helperText = "*Optional";
  }

  return (
    <FormControl fullWidth>
      <InputLabel>{selectProps.label}</InputLabel>
      <Select
        onChange={(e) => selectionChanged(e)}
        value={value || ""}
        {...selectProps}
      >
        {selections.map((select, i) => (
          <MenuItem key={i} value={select.id}>
            {select.display}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>
        {helperText}
        {description?.split("\n").map(line => (<><br />{line}</>))}
      </FormHelperText>
    </FormControl>
  );
};

export default FormDropSelect;
