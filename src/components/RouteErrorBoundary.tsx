import { Component, ReactNode } from "react";
import ContentUnavailable from "./ui/content/ContentUnavailable";
import AsyncButton from "./ui/buttons/AsyncButton";
import { SUPPORT_EMAIL } from "../config/constants";

const RELOADED_AT = "epsilon:chunk-reload";

// a tab left open across a deploy asks for files the new build no longer has
const isChunkError = (error: unknown) =>
    error instanceof Error &&
    /dynamically imported module|Importing a module script failed|Unable to preload CSS|error loading dynamically imported/i.test(
        error.message,
    );

/* reloads for the new build, at most once a minute so a broken deploy can't loop */
export const reloadOnce = () => {
    try {
        const last = Number(sessionStorage.getItem(RELOADED_AT));
        if (last && Date.now() - last < 60_000) return false;
        sessionStorage.setItem(RELOADED_AT, String(Date.now()));
    } catch {
        return false;
    }
    window.location.reload();
    return true;
};

type Props = { resetKey: string; children: ReactNode };
type State = { error?: unknown; key: string };

/* keeps a page that fails to load or render from blanking the whole site */
export default class RouteErrorBoundary extends Component<Props, State> {
    state: State = { key: this.props.resetKey };

    static getDerivedStateFromError(error: unknown) {
        return { error };
    }

    // moving to another page tries again
    static getDerivedStateFromProps(props: Props, state: State) {
        return props.resetKey === state.key
            ? null
            : { error: undefined, key: props.resetKey };
    }

    componentDidCatch(error: unknown) {
        if (isChunkError(error)) reloadOnce();
    }

    render() {
        if (this.state.error === undefined) return this.props.children;
        const stale = isChunkError(this.state.error);
        return (
            <ContentUnavailable
                icon="bx-error-circle"
                iconColor="text-red"
                title={
                    stale
                        ? "Epsilon Has Been Updated"
                        : "This Page Could Not Load"
                }
                description={
                    stale
                        ? "Reload to get the latest version."
                        : `Reload to try again. If this keeps happening, contact ${SUPPORT_EMAIL}.`
                }
                action={
                    <AsyncButton
                        isPrimary
                        onClick={() => window.location.reload()}
                    >
                        Reload
                    </AsyncButton>
                }
            />
        );
    }
}
