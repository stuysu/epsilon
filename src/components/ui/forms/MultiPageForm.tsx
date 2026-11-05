import { CSSProperties, HTMLAttributes } from "react";
import {
    Children,
    cloneElement,
    Dispatch,
    isValidElement,
    ReactElement,
    ReactNode,
    SetStateAction,
    useEffect,
    useState,
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

const MultiPageForm = <T,>({
    title,
    value,
    onFormChange,
    onSubmit,
    submitText,
    children,
    sx,
    style,
    ...boxProps
}: Props<T> &
    Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "title"> & {
        sx?: CSSProperties;
    }) => {
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
        <div {...boxProps} style={{ ...sx, ...style }}>
            <div className="h-[10%] w-full p-5">
                <h2>{title}</h2>
            </div>

            <div className="w-full flex justify-center pl-5 pr-5">
                <ol className="flex w-full max-w-[900px] items-center max-sm:justify-between max-sm:gap-2">
                    {steps.map((label, i) => (
                        <li
                            key={label}
                            aria-current={i === page ? "step" : undefined}
                            className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}
                        >
                            <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.75rem] ${
                                    i <= page
                                        ? "bg-[#1976d2] text-white scheme-dark:bg-[#90caf9] scheme-dark:text-black/90"
                                        : "bg-black/60 text-white scheme-dark:bg-white/50 scheme-dark:text-black/90"
                                }`}
                            >
                                {i < page ? (
                                    <i className="bx bx-check text-[18px]" />
                                ) : (
                                    i + 1
                                )}
                            </span>
                            <span
                                className={`ml-2 text-[0.875rem] leading-[1.43] ${i <= page ? "text-black/90 scheme-dark:text-white" : "text-typography-2"}`}
                            >
                                {label}
                            </span>
                            {i < steps.length - 1 && (
                                <span className="mx-2 h-px min-w-4 flex-1 bg-divider max-sm:hidden" />
                            )}
                        </li>
                    ))}
                </ol>
            </div>

            {formPage}
        </div>
    );
};

export default MultiPageForm;
