import { CheckboxProps, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox } from "@mui/material"
import { useEffect, useState } from "react"

type SelectType = {
    id: string,
    display: string
}

type Props = {
    field: string,
    value?: string,
    label?: string,
    required?: boolean,
    description?: string,
    formatter?: (choices : string[]) => any
    onChange?: (field: string, updatedValue: string) => void
    selections: SelectType[]
}

let order = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

const FormCheckSelect = (
    {
        field,
        value,
        label,
        required,
        description,
        formatter,
        onChange,
        selections,
        ...checkboxProps
    } : Props & CheckboxProps
) => {
    let checked = value?.split(",") || []

    const checkboxUpdate = (newSelections : string[]) => {
        if (!onChange) return;
        
        newSelections = newSelections
            .filter(v => v && v.length)
            .sort((a, b) => order.findIndex(v => v === a) - order.findIndex(v => v === b))
        onChange(field, formatter ? formatter(newSelections) : newSelections.join(","))
    }

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
                                key={i}
                                checked={checked.includes(select.id)}
                                onChange={(event) => {
                                    if (event.target.checked && !checked.includes(select.id)) {
                                        checkboxUpdate([...checked, select.id]);
                                    } else {
                                        checkboxUpdate(checked.filter(id => id !== select.id));
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