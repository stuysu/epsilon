import { Box, Select, MenuItem, SelectProps, SelectChangeEvent, FormControl, InputLabel } from "@mui/material"

type SelectType = {
    id: string,
    display: string
}

type Props = {
    field: string,
    description?: string,
    onChange?: (field: string, updatedValue: string) => void
    selections: SelectType[]
}

const FormDropSelect = (
    {
        field,
        description,
        onChange,
        selections,
        ...selectProps
    } :
    Props & SelectProps
) => {
    const selectionChanged = (event: SelectChangeEvent<unknown>) => {
        if (!onChange) return;
        onChange(field, event.target.value as string);
    }

    return (
        <Box sx={{ maxWidth: 700 }}>
            <FormControl fullWidth>
                <InputLabel>{selectProps.label}</InputLabel>
                <Select
                    onChange={(e) => selectionChanged(e)}
                    {...selectProps}
                >
                    {
                        selections.map(
                            select => (
                                <MenuItem value={select.id}>{select.display}</MenuItem>
                            )
                        )
                    }
                </Select>
            </FormControl>
        </Box>
    )
}

export default FormDropSelect;