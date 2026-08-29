import { forwardRef, InputHTMLAttributes } from "react";

type NumberStepperProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const NumberStepper = forwardRef<HTMLInputElement, NumberStepperProps>(
    ({ className, ...props }, ref) => (
        <input
            {...props}
            ref={ref}
            type="number"
            className={`h-10 w-24 rounded-xl bg-layer-2 px-3 shadow-inner outline-none focus:ring-2 focus:ring-accent important ${className || ""}`}
        />
    ),
);

NumberStepper.displayName = "NumberStepper";

export default NumberStepper;
