import {
    Children,
    cloneElement,
    Dispatch,
    isValidElement,
    ReactElement,
    ReactNode,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from "react";

import { Box } from "@mui/material";

import FormSection from "./FormSection";
import FormRender from "./FormRender";
import AsyncButton from "../buttons/AsyncButton";

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
    first?: boolean;
};

type FormStatus = {
    [field: string]: {
        dirty: boolean;
        value: boolean;
    };
};

const FormPage = <T extends unknown>({
    title,
    value,
    children,
    onChange,
    onSubmit,
    onNext,
    onBack,
    submitText,
    last,
    first,
}: Props<T>) => {
    const [status, setStatus] = useState<FormStatus>({});
    const [valid, setValid] = useState(false);

    useEffect(() => {
        const isValid = (): boolean => {
            for (let stat of Object.values(status)) {
                if (!stat.value) return false;
            }

            return true;
        };

        setValid(isValid());
    }, [status]);

    const childOnChange = (field: string, updatedValue: any) => {
        if (onChange && value) {
            onChange({
                ...value,
                [field]: updatedValue,
            });
        }
    };

    const changeStatus = useCallback(
        (field: string, newStatus: boolean) => {
            if (status[field] && newStatus === status[field].value) return;

            setStatus((prevState) => ({
                ...prevState,
                [field]: {
                    dirty: true,
                    value: newStatus,
                },
            }));
        },
        [status],
    );

    const parseChildren = (c: ReactNode) => {
        let childs: ReactNode[] = [];

        Children.map(c, (child, index) => {
            if (isValidElement(child)) {
                if (child.type === FormSection) {
                    let parsedChildren = parseChildren(child.props.children);
                    childs.push(
                        <FormSection {...child.props}>
                            {parsedChildren}
                        </FormSection>,
                    );
                    return;
                }

                if (child.type === FormRender) {
                    childs.push(child);
                    return;
                }

                let childField = child.props.field as keyof T;
                let childValue = value?.[childField];

                let childProps: { [field: string]: any } = {
                    key: index,
                    value: childValue,
                    onChange: (newValue: any) =>
                        childOnChange(child.props.field, newValue),
                    status: status[child.props.field],
                    changeStatus,
                };

                childs.push(
                    cloneElement(child as ReactElement<any>, childProps),
                );
            } else {
                childs.push(child);
            }
        });

        return childs;
    };

    return (
        <Box
            sx={{
                height: "100%",
                maxWidth: "1000px",
                width: "100%",
                padding: "50px",
            }}
        >
            <h3>{title}</h3>
            <div className={`mt-5`}>
                {parseChildren(children)}
            </div>
            <Box
                sx={{
                    height: "10%",
                    width: "100%",
                    marginTop: "20px",
                    display: "flex",
                    flexWrap: "wrap",
                }}
            >
                <div className={`w-full flex justify-end gap-5 mt-5`}>
                    {!first && (
                        <AsyncButton
                            onClick={onBack}
                            variant="contained"
                            sx={{ width: "150px", height: "40px" }}
                        >
                            Back
                        </AsyncButton>
                    )}
                    {last ? (
                        <AsyncButton
                            onClick={onSubmit}
                            variant="contained"
                            disabled={!valid}
                            sx={{ width: "150px", height: "40px" }}
                        >
                            {submitText ? submitText : "Submit"}
                        </AsyncButton>
                    ) : (
                        <AsyncButton
                            onClick={onNext}
                            variant="contained"
                            disabled={!valid}
                            sx={{ width: "150px", height: "40px" }}
                        >
                            Next
                        </AsyncButton>
                    )}
                </div>
            </Box>
        </Box>
    );
};

export default FormPage;
