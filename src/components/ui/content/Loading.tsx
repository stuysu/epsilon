import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Loading = () => {
    return (
        <div
            className={
                "w-full h-[85vh] flex items-center justify-center z-[1000] pointer-events-none scale-50"
            }
        >
            <DotLottieReact
                src="https://lottie.host/94199763-e11d-43d4-9c10-e5168529d524/kV89Eoo3Vm.lottie"
                loop
                autoplay
            />
        </div>
    );
};

export default Loading;
