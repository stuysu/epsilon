import { OpportunityStatus } from "../types";

const TONE_CLASSES: Record<OpportunityStatus["tone"], string> = {
    neutral: "bg-layer-2 text-typography-1",
    urgent: "bg-layer-2 text-yellow scheme-dark:text-[#facb49]",
    danger: "bg-red text-white scheme-dark:bg-[#e45647b3] scheme-dark:text-[#e8e8e8]",
};

type StatusBadgeProps = {
    status: OpportunityStatus;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
    // a soon deadline gets its own icon, not colour alone
    const urgent = status.tone === "urgent";
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.8125rem] font-bold shadow-control ${TONE_CLASSES[status.tone]}`}
        >
            <i
                className={`bx ${urgent ? "bx-alarm-exclamation" : status.icon}`}
                aria-hidden="true"
            />
            {urgent && <span className="sr-only">Soon: </span>}
            {status.label}
        </span>
    );
};

export default StatusBadge;
