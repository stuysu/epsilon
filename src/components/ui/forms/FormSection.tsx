import { CSSProperties, HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    sx?: CSSProperties;
};

const FormSection = ({ children, sx, style, ...props }: Props) => {
    return (
        <div {...props} style={{ ...sx, ...style }}>
            {children}
        </div>
    );
};

export default FormSection;
