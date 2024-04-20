import { Box } from "@mui/material";
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

interface Props<T> {
    title: string;
    value: T;
    onChange: Dispatch<SetStateAction<T>>;
    onSubmit: (data : T) => void;
    children?: ReactNode
}

const MultiPageForm = <T extends unknown>(
    {
        title,
        value, 
        onChange, 
        onSubmit, 
        children 
    } : Props<T>
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
                { value, onChange, first, last, onSubmit, onNext, onBack }
            );
        }

        return child;
    });

    return (
        <Box color="white" bgcolor="background.default">
            <Box>
                <h1>{title}</h1>
            </Box>
            <Box>
                {childrenWithProps}
            </Box>
        </Box>
    )
}

export default MultiPageForm;