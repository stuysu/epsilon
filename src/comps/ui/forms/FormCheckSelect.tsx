import { CheckboxProps, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox } from "@mui/material"
import { useEffect, useState } from "react"

type SelectType = {
    id: string,
    display: string
}

type Props = {
    field: string,
    label?: string,
    description?: string,
    formatter?: (choices : string[]) => any
    onChange?: (field: string, updatedValue: string) => void
    selections: SelectType[]
}

const FormCheckSelect = (
    {
        field,
        label,
        description,
        formatter,
        onChange,
        selections,
        ...checkboxProps
    } : Props & CheckboxProps
) => {
    const [checked, setChecked] = useState<string[]>([]);

    useEffect(() => {
        if (!onChange) return;
        onChange(field, formatter ? formatter(checked) : checked.join(","));
    }, checked);

    return (
        <FormControl>
            {label && (<FormLabel>{label}</FormLabel>)}
            <FormGroup row>
                {
                    selections.map((select, i) => {

                    return (
                        <FormControlLabel 
                        control={
                            <Checkbox
                                checked={checked.includes(select.id)}
                                onChange={(event) => {
                                    if (event.target.checked && !checked.includes(select.id)) {
                                        setChecked([...checked, select.id]);
                                    } else {
                                        setChecked(checked.filter(id => id !== select.id));
                                    }
                                }}
                                name={select.display}
                                {...checkboxProps}
                            />
                        }
                        label={select.display}
                        />
                    )
                    })
                }
            </FormGroup>
        </FormControl>
    )
}

export default FormCheckSelect;