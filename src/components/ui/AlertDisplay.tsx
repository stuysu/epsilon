import { useEffect, useState, useRef } from "react";
import { Popover } from "radix-ui";
import AlertBanner from "./AlertBanner";
import DisplayLinks from "../DisplayLinks";

type AlertInfo = {
    message: string;
    expiry?: number;
    severity?: "success" | "info" | "warning" | "error";
};

const AlertDisplay = () => {
    const [open, setOpen] = useState(false);
    const [sessionDismissed, setSessionDismissed] = useState(false);
    const [data, setData] = useState<AlertInfo | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(
        null,
    );
    const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const openTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isError = data?.severity === "error";
    const isOpen = Boolean(menuAnchor);
    useEffect(() => {
        const fetchAlert = async () => {
            // the alert service being down shouldn't surface as an error
            const res = await fetch("https://alert.stuysu.org").catch(
                () => null,
            );
            if (!res || res.status === 404) return;
            try {
                const alertData = (await res.json()) as AlertInfo;
                setData(alertData);
                if (
                    localStorage.getItem("dismissedAlert") !== alertData.message
                )
                    setOpen(true);
            } catch (e) {
                // log error for debugging
                console.error(e);
            }
        };

        fetchAlert();
        return () => {
            setOpen(false);
            setData(null);
            if (openTimeout.current) {
                clearTimeout(openTimeout.current);
            }
            if (closeTimeout.current) {
                clearTimeout(closeTimeout.current);
            }
        };
    }, []);

    const handleCloseClick = () => {
        if (openTimeout.current) {
            clearTimeout(openTimeout.current);
        }
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
        }
        setSessionDismissed(true);
        setMenuAnchor(null);
    };

    const handleDoNotRemindAgain = () => {
        if (data && data.message) {
            localStorage.setItem("dismissedAlert", data.message);
        }
        setOpen(false);
        setMenuAnchor(null);
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
        const t = event.currentTarget;
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
        if (openTimeout.current) {
            clearTimeout(openTimeout.current);
        }
        openTimeout.current = setTimeout(() => {
            setMenuAnchor(t);
        }, 150);
    };

    const handleMouseLeave = () => {
        if (openTimeout.current) {
            clearTimeout(openTimeout.current);
            openTimeout.current = null;
        }
        closeTimeout.current = setTimeout(() => {
            setMenuAnchor(null);
        }, 150);
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (openTimeout.current) {
            clearTimeout(openTimeout.current);
            openTimeout.current = null;
        }
        if (menuAnchor === event.currentTarget) {
            setMenuAnchor(null);
            setSessionDismissed(true);
        } else {
            setMenuAnchor(event.currentTarget);
        }
    };

    const handleMenuEnter = () => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
    };

    if (
        sessionDismissed ||
        !open ||
        !data ||
        !data.message ||
        // if expiry is defined, check that if the date is past
        (data.expiry !== undefined && new Date(data.expiry || 0) < new Date())
    )
        return <></>;
    return (
        <div className={"z-[9999] relative w-full p-4 bg-bg"}>
            <Popover.Root
                open={isOpen}
                onOpenChange={(next) => {
                    if (!next) setMenuAnchor(null);
                }}
            >
                <Popover.Anchor virtualRef={{ current: menuAnchor }} />
                <AlertBanner
                    severity={data.severity}
                    onClose={isError ? undefined : handleCloseClick}
                    closeButtonProps={{
                        onMouseEnter: handleMouseEnter,
                        onMouseLeave: handleMouseLeave,
                        onTouchEnd: handleTouchEnd,
                    }}
                >
                    {/* the message takes the banner's own text colour, which is
                        chosen to read on each severity in every theme */}
                    <div className="relative top-0.5 [&_a]:text-inherit [&_a]:underline [&_p]:text-inherit">
                        <DisplayLinks text={data.message} />
                    </div>
                </AlertBanner>
                {!isError && (
                    <Popover.Portal>
                        <Popover.Content
                            side="bottom"
                            align="end"
                            sideOffset={4}
                            onOpenAutoFocus={(event) => event.preventDefault()}
                            onCloseAutoFocus={(event) => event.preventDefault()}
                            onMouseEnter={handleMenuEnter}
                            onMouseLeave={handleMouseLeave}
                            className="z-[10000] overflow-hidden rounded-lg border border-divider bg-layer-1 shadow-xl"
                        >
                            <button
                                type="button"
                                onClick={handleDoNotRemindAgain}
                                className="px-3 py-2 text-sm text-typography-1 hover:bg-layer-3"
                            >
                                Do not remind me again
                            </button>
                        </Popover.Content>
                    </Popover.Portal>
                )}
            </Popover.Root>
        </div>
    );
};

export default AlertDisplay;
