import { Component, ReactNode, Suspense, lazy } from "react";

const loadRenderer = () => import("./MarkupRenderer");
const MarkupRenderer = lazy(loadRenderer);
// Start fetching right away so posts rarely wait on it.
void loadRenderer();

// Pathological input (e.g. thousands of nested `*`) can overflow the
// renderer's stack; show the raw text instead of taking the page down.
class RenderGuard extends Component<
    { fallback: ReactNode; children: ReactNode },
    { failed: boolean }
> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}

const MarkupDisplayer = ({
    text,
    className = "",
}: {
    text: string;
    className?: string;
}) => {
    const raw = <p className="whitespace-pre-wrap">{text}</p>;
    return (
        <div className={`markup ${className}`}>
            <RenderGuard key={text} fallback={raw}>
                <Suspense fallback={<div className="invisible">{raw}</div>}>
                    <MarkupRenderer text={text} />
                </Suspense>
            </RenderGuard>
        </div>
    );
};

export default MarkupDisplayer;
