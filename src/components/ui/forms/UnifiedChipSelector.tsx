import React from 'react'
import FormChipText from './FormChipText'
import OrgRequirements from '../../../utils/OrgRequirements';
import FormTagSelect from './FormTagSelect';
import { SxProps } from '@mui/material';

type Requirements = {
    [field: string]: any;
};

type Props = {
    field: string;
    description?: string;
    required?: boolean;
    requirements?: Requirements;
    value?: string | string[];
    value_delim?: string;
    onChange?: (updatedValue: string[]) => void;
    status?: {
        dirty: boolean;
        value: boolean;
    };
    changeStatus?: (field: string, newStatus: boolean) => void;
    label?: string;
    options?: string[];
    sx?: SxProps;
};
const UnifiedChipSelector = ({
    field,
    label,
    onChange,
    value,
    changeStatus,
    value_delim,
    options,
    description,
    sx,
}: Props) => {
    if (typeof value === 'string') value = value.split(value_delim!);
    else {
        let newValue = value as string[];
        newValue.map((element, index) => {
            if (element == "") newValue.splice(index, 1);
        });
        value = newValue;
    }
    const thereAreOptions = !!options;
    if (!thereAreOptions) {
    return (
        <FormChipText
            field={field}
            label={label}
            onChange={onChange}
            required={OrgRequirements[field].required}
            requirements={OrgRequirements[field].requirements}
            value={value}
            changeStatus={changeStatus}
        />

    )
    } else {
        return (
            <FormTagSelect
                field={field}
                label={label}
                onChange={onChange}
                required={OrgRequirements[field].required}
                requirements={OrgRequirements[field].requirements}
                value={value}
                changeStatus={changeStatus}
                tags={options}
            />
        )
    }
}

export default UnifiedChipSelector;
