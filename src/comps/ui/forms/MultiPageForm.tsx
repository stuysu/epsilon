import {
    Box,
    BoxProps,
    Typography,
    Stepper,
    Step,
    StepLabel,
} from "@mui/material";
import {
    Dispatch,
    SetStateAction,
    ReactNode,
    useState,
    Children,
    isValidElement,
    cloneElement,
    ReactElement,
    useEffect,
} from "react";
import FormPage from "./FormPage";

type Props<T> = {
    title: string;
    value: T;
    onFormChange: Dispatch<SetStateAction<T>>;
    onSubmit: (data: T) => void;
    submitText?: string;
    children?: ReactNode;
};

const MultiPageForm = <T extends unknown>({
    title,
    value,
    onFormChange,
    onSubmit,
    submitText,
    children,
    ...boxProps
}: Props<T> & BoxProps) => {
    const [page, setPage] = useState(0);
    const [steps, setSteps] = useState<string[]>([]);

    useEffect(() => {
        let s = Children.map(children, (child, index) => {
            if (isValidElement(child) && child.type === FormPage) {
                return child.props.title || "No Title";
            }
        });
        setSteps(s as string[]);
    }, [children]);

    const onNext = () => {
        if (page < Children.count(children) - 1) setPage(page + 1);
    };

    const onBack = () => {
        if (page > 0) setPage(page - 1);
    };

    const formPage = Children.map(children, (child, index) => {
        if (isValidElement(child) && index === page) {
            let first = index === 0;
            let last = index === Children.count(children) - 1;

            return cloneElement(child as ReactElement<any>, {
                value,
                onChange: onFormChange,
                first,
                last,
                onSubmit,
                onNext,
                onBack,
                submitText,
            });
        }
    });

    return (
        <Box {...boxProps}>
            <Box sx={{ height: "10%", width: "100%", padding: "20px" }}>
                <Typography variant="h2" align="center">
                    {title}
                </Typography>
            </Box>

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                }}
            >
                <Stepper
                    activeStep={page}
                    sx={{ width: "100%", maxWidth: "900px" }}
                >
                    {steps.map((label) => {
                        return (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
            </Box>

            {formPage}
        </Box>
    );
};

export default MultiPageForm;
