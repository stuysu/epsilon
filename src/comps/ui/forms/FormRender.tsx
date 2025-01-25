import { ReactNode } from "react";

/* Anything inside a FormRender component will be simply rendered with no props passed to it */
const FormRender = ({ children }: { children: ReactNode }) => {
    return <>{children}</>;
};

export default FormRender;
