import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import useMediaQuery from "../../../utils/useMediaQuery";

const Loading = () => {
    const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

    return (
        <div
            role="status"
            className={
                "w-full h-[85vh] flex items-center justify-center z-[1000] pointer-events-none scale-50"
            }
        >
            <span className="sr-only">Loading…</span>
            <DotLottieReact
                src="https://lottie.host/94199763-e11d-43d4-9c10-e5168529d524/kV89Eoo3Vm.lottie"
                // with reduced motion the first frame stays as a still image
                loop={!reduceMotion}
                autoplay={!reduceMotion}
                aria-hidden="true"
            />
        </div>
    );
};

export default Loading;
