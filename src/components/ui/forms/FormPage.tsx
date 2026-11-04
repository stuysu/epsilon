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
    checkRequired?: boolean;
    checkCompleted?: boolean;
};

type FormStatus = {
    [field: string]: {
        dirty: boolean;
        value: boolean;
    };
};

const FormPage = <T,>({
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
    checkRequired,
    checkCompleted,
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
                        <FormSection key={index} {...child.props}>
                            {parsedChildren}
                        </FormSection>,
                    );
                    return;
                }

                // plain HTML elements and FormRender take no form props
                if (
                    child.type === FormRender ||
                    typeof child.type === "string"
                ) {
                    childs.push(cloneElement(child, { key: index }));
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
        <div className="h-full max-w-[1000px] w-full p-[50px]">
            <h3>{title}</h3>
            <div className={`mt-5`}>{parseChildren(children)}</div>
            <div className="h-[10%] w-full mt-5 flex flex-wrap">
                <div className={`w-full flex justify-end gap-5 mt-5`}>
                    {!first && (
                        <AsyncButton
                            onClick={onBack}
                            sx={{ width: "150px", height: "40px" }}
                        >
                            Back
                        </AsyncButton>
                    )}
                    {last ? (
                        <AsyncButton
                            onClick={onSubmit}
                            disabled={!valid}
                            sx={{ width: "150px", height: "40px" }}
                        >
                            {submitText ? submitText : "Submit"}
                        </AsyncButton>
                    ) : (
                        <AsyncButton
                            onClick={onNext}
                            disabled={
                                !valid || (checkRequired && !checkCompleted)
                            }
                            sx={{ width: "150px", height: "40px" }}
                        >
                            Next
                        </AsyncButton>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormPage;
