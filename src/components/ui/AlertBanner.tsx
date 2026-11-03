import { ReactNode } from "react";

export type AlertSeverity = "success" | "info" | "warning" | "error";

const severityStyles: Record<AlertSeverity, { color: string; icon: string }> = {
    success: {
        color: "bg-[#2e7d32] scheme-dark:bg-[#43a047]",
        icon: "bx-check-circle",
    },
    // light schemes use white text and dark schemes near-black, both at 4.5:1 or more
    info: {
        color: "bg-[#0277bd] scheme-dark:bg-[#0288d1]",
        icon: "bx-info-circle",
    },
    warning: {
        color: "bg-[#b85000] scheme-dark:bg-[#f57c00]",
        icon: "bx-error",
    },
    error: {
        color: "bg-[#d32f2f] scheme-dark:bg-[#ef5350]",
        icon: "bx-error-circle",
    },
};

// "assertive" interrupts a screen reader, so keep it for news that needs action now
const LIVE_ROLES = {
    assertive: "alert",
    polite: "status",
    off: undefined,
} as const;

type AlertBannerProps = {
    severity?: AlertSeverity;
    onClose?: () => void;
    live?: keyof typeof LIVE_ROLES;
    children: ReactNode;
};

const AlertBanner = ({
    severity = "info",
    onClose,
    live = "assertive",
    children,
}: AlertBannerProps) => {
    const { color, icon } = severityStyles[severity] ?? severityStyles.info;

    return (
        <div
            role={LIVE_ROLES[live]}
            className={`flex items-start gap-3 rounded-[10px] px-4 py-1.5 text-white scheme-dark:text-black/90 ${color}`}
        >
            <i
                className={`bx ${icon} py-[7px] text-[22px] leading-none`}
                aria-hidden="true"
            />
            <div className="min-w-0 flex-1 py-2">{children}</div>
            {onClose && (
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/10"
                >
                    <i className="bx bx-x text-[20px]" aria-hidden="true" />
                </button>
            )}
        </div>
    );
};

export default AlertBanner;
