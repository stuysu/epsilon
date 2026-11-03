import { ReactNode } from "react";

export type AlertSeverity = "success" | "info" | "warning" | "error";

const severityStyles: Record<AlertSeverity, { color: string; icon: string }> = {
    success: {
        color: "bg-[#2e7d32] scheme-dark:bg-[#388e3c]",
        icon: "bx-check-circle",
    },
    info: { color: "bg-[#0288d1]", icon: "bx-info-circle" },
    warning: {
        color: "bg-[#ed6c02] scheme-dark:bg-[#f57c00]",
        icon: "bx-error",
    },
    error: { color: "bg-[#d32f2f]", icon: "bx-error-circle" },
};

type AlertBannerProps = {
    severity?: AlertSeverity;
    onClose?: () => void;
    children: ReactNode;
};

const AlertBanner = ({
    severity = "info",
    onClose,
    children,
}: AlertBannerProps) => {
    const { color, icon } = severityStyles[severity] ?? severityStyles.info;

    return (
        <div
            role="alert"
            className={`flex items-start gap-3 rounded-[10px] px-4 py-1.5 text-white scheme-dark:text-black/90 ${color}`}
        >
            <i className={`bx ${icon} py-[7px] text-[22px] leading-none`} />
            <div className="min-w-0 flex-1 py-2">{children}</div>
            {onClose && (
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/10"
                >
                    <i className="bx bx-x text-[20px]" />
                </button>
            )}
        </div>
    );
};

export default AlertBanner;
