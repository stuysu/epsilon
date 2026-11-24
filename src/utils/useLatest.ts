import { useLayoutEffect, useRef } from "react";

// a ref to the newest value, for callbacks and effects that shouldn't rerun when it changes
export default function useLatest<T>(value: T) {
    const ref = useRef(value);
    useLayoutEffect(() => {
        ref.current = value;
    });
    return ref;
}
