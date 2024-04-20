import { 
    ReactNode, 
    isValidElement,
    SetStateAction, 
    Dispatch,
    Children,
    ReactElement,
    cloneElement 
} from "react";

import { Box, BoxProps, Button } from "@mui/material";

type Props<T> = {
    title: string;
    value?: T;
    children?: ReactNode;
    onChange?: Dispatch<SetStateAction<T>>;
    onSubmit?: () => void;
    onNext?: () => void;
    onBack?: () => void;
    submitText?: string;
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
        submitText,
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
        <Box sx={{ height: "100%", width: "800px" }}>
            <Box sx={{ height: "10%", width: "100%"}}>
                <h3>{title}</h3>
            </Box>
            <Box  sx={{ width: "100%" }}>
                {childrenWithProps}
            </Box>
            <Box sx={{ height: "10%", width: "100%" }}>
                <Box sx={{ maxWidth: "500px", display: 'flex', justifyContent: 'space-around'}}>
                    {
                        !first && <Button onClick={onBack} variant="contained">Back</Button>
                    }
                    {
                        last ?
                        (
                            <Button onClick={onSubmit} variant="contained">{submitText ? submitText : "Submit"}</Button>
                        ) :
                        (
                            <Button onClick={onNext} variant="contained">Next</Button>
                        )
                    }
                </Box>
            </Box>
        </Box>
    )
}

export default FormPage;