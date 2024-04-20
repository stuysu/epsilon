import { Box, BoxProps } from "@mui/material";
import { 
    Dispatch, 
    SetStateAction, 
    ReactNode, 
    useState,
    Children, 
    isValidElement, 
    cloneElement,
    ReactElement 
} from "react";

type Props<T> = {
    title: string;
    value: T;
    onFormChange: Dispatch<SetStateAction<T>>;
    onSubmit: (data : T) => void;
    submitText?: string;
    children?: ReactNode
}

const MultiPageForm = <T extends unknown>(
    {
        title,
        value, 
        onFormChange, 
        onSubmit,
        submitText, 
        children,
        ...boxProps 
    } : Props<T> & BoxProps
) => {

    const [page, setPage] = useState(0);

    const onNext = () => {
        if (page < Children.count(children) - 1) setPage(page + 1);
    }

    const onBack = () => {
        if (page > 0) setPage(page - 1);
    }

    const childrenWithProps = Children.map(children, (child, index) => {
        if (isValidElement(child)) {
            let first = index === 0;
            let last = index === (Children.count(children) - 1)

            return cloneElement(
                child as ReactElement<any>, 
                { value, onChange: onFormChange, first, last, onSubmit, onNext, onBack, submitText }
            );
        }

        return child;
    });

    return (
        <Box {...boxProps}>
            <Box sx={{ height: "10%"}}>
                <h1>{title}</h1>
            </Box>
            <Box sx={{ height: "90%"}}>
                {childrenWithProps}
            </Box>
        </Box>
    )
}

export default MultiPageForm;