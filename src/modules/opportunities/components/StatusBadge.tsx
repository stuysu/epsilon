import { OpportunityStatus } from "../types";

const TONE_CLASSES: Record<OpportunityStatus["tone"], string> = {
    neutral: "bg-layer-2 text-typography-1",
    urgent: "bg-layer-2 text-yellow",
    // white on the dark scheme's lighter red is too faint, so it gets black text
    danger: "bg-red text-white scheme-dark:text-black",
};

type StatusBadgeProps = {
    status: OpportunityStatus;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
    // a soon deadline is said in words and a different icon, not colour alone
    const urgent = status.tone === "urgent";
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-0.5 text-sm shadow-control ${TONE_CLASSES[status.tone]}`}
        >
            <i
                className={`bx ${urgent ? "bx-alarm-exclamation" : status.icon}`}
                aria-hidden="true"
            />
            {urgent && "Soon · "}
            {status.label}
        </span>
    );
};

export default StatusBadge;
