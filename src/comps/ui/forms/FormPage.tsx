import { 
    ReactNode, 
    isValidElement,
    SetStateAction, 
    Dispatch,
    Children,
    ReactElement,
    cloneElement 
} from "react";

import { Box, Button } from "@mui/material";

type Props<T> = {
    title: string;
    value?: T;
    children?: ReactNode;
    onChange?: Dispatch<SetStateAction<T>>;
    onSubmit?: () => void;
    onNext?: () => void;
    onBack?: () => void;
    last?: boolean; // if its the last page, have a submit button instead of a next button 
    first?: boolean
}

const FormPage = <T extends unknown>(
    { 
        title,
        value, 
        children, 
        onChange, 
        onSubmit, 
        onNext, 
        onBack, 
        last, 
        first 
    } : Props<T>
) => {
    const childOnChange = (field: string, updatedValue: any) => {
        if (onChange && value) {
            onChange({
                ...value,
                [field]: updatedValue
            })
        }
    }

    const childrenWithProps = Children.map(children, (child, index) => {
        if (isValidElement(child)) {

            let childField = child.props.field as (keyof T);
            let childValue = value?.[childField];

            return cloneElement(
                child as ReactElement<any>, 
                { value: childValue, onChange: childOnChange }
            );
        }

        return child;
    });

    return (
        <Box>
            <h3>{title}</h3>
            <Box>
                {childrenWithProps}
            </Box>
            <Box>
                {
                    !first && <Button onClick={onBack}>Back</Button>
                }
                {
                    last ?
                    (
                        <Button onClick={onSubmit}>Submit</Button>
                    ) :
                    (
                        <Button onClick={onNext}>Next</Button>
                    )
                }
            </Box>
        </Box>
    )
}

export default FormPage;