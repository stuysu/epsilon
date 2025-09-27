import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

type Props = {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  size?: "small" | "medium";
};

export default function FormRadioCheck({
  checked,
  onChange,
  label,
}: Props) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={onChange}
        />
      }
      label={label}
    />
  );
}
