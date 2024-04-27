import { useEffect } from "react"
import { Box, Select, MenuItem, SelectProps, SelectChangeEvent, FormControl, InputLabel } from "@mui/material"

type SelectType = {
    id: string,
    display: string
}

type Props = {
    field: string,
    value?: string,
    description?: string,
    required?: boolean,
    onChange?: (field: string, updatedValue: string) => void,
    status?: {
        dirty: boolean,
        value: boolean
    },
    changeStatus?: (newValue : boolean) => void,
    selections: SelectType[]
}

const FormDropSelect = (
    {
        field,
        value,
        description,
        required,
        onChange,
        status,
        changeStatus,
        selections,
        ...selectProps
    } :
    Props & SelectProps
) => {
    useEffect(() => {
        validate(value || undefined);
    }, [required]);

    const validate = (targetValue : any) => {
        if (changeStatus && required) {
            changeStatus(targetValue !== undefined);
        }
    }

    const selectionChanged = (event: SelectChangeEvent<unknown>) => {
        if (!onChange) return;

        onChange(field, event.target.value as string);
        validate(event.target.value);
    }

    return (
        <Box sx={{ maxWidth: 700 }}>
            <FormControl fullWidth>
                <InputLabel>{selectProps.label}</InputLabel>
                <Select
                    onChange={(e) => selectionChanged(e)}
                    value={value}
                    {...selectProps}
                >
                    {
                        selections.map(
                            (select, i) => (
                                <MenuItem key={i} value={select.id}>{select.display}</MenuItem>
                            )
                        )
                    }
                </Select>
            </FormControl>
        </Box>
    )
}

export default FormDropSelect;