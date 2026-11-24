import { useState } from "react";

// calls onChange while rendering when value changes, so state reset from it
// shows at once instead of one render late from an effect
export default function useOnChange<T>(value: T, onChange: (value: T) => void) {
    const [previous, setPrevious] = useState(value);
    if (!Object.is(previous, value)) {
        setPrevious(value);
        onChange(value);
    }
}
