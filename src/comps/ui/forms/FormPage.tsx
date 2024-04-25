import { 
    ReactNode, 
    isValidElement,
    SetStateAction, 
    Dispatch,
    Children,
    ReactElement,
    cloneElement 
} from "react";

import { Box, BoxProps, Button, Typography } from "@mui/material";

import FormSection from "./FormSection";
import FormRender from "./FormRender";

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

    const parseChildren = (c : ReactNode) => {
        let childs : ReactNode[] = [];

        Children.map(c, (child, index) => {
            if (isValidElement(child)) {

                if (child.type === FormSection) {
                    let parsedChildren = parseChildren(child.props.children);
                    childs.push(
                        <FormSection {...child.props}>
                            {parsedChildren}
                        </FormSection>
                    );
                    return;
                }

                if (child.type === FormRender) {
                    childs.push(child);
                    return;
                }
    
                let childField = child.props.field as (keyof T);
                let childValue = value?.[childField];
    
                childs.push(cloneElement(
                    child as ReactElement<any>, 
                    { value: childValue, onChange: childOnChange }
                ));
                return;
            }

            childs.push(child);
        })

        return childs;
    }

    return (
        <Box sx={{ height: "100%", maxWidth: "800px", width: '100%', padding: '20px' }}>
            <Box sx={{ height: "10%", width: "100%"}}>
                <Typography variant='h3'>{title}</Typography>
            </Box>
            <Box  sx={{ width: "100%", display: 'flex', flexWrap: 'wrap' }}>
                {parseChildren(children)}
            </Box>
            <Box sx={{ height: "10%", width: "100%", marginTop: '20px', display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {
                        !first && <Button onClick={onBack} variant="contained">Back</Button>
                    }
                </Box>
                <Box sx={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
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