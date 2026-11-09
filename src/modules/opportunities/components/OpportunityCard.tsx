import { Link, useLocation } from "react-router-dom";
import { useOpportunities } from "../OpportunitiesContext";
import { Opportunity } from "../types";
import { getStatus, getTodayEastern, unquote } from "../utils";
import EligibilityLine from "./EligibilityLine";
import OpportunityDetails from "./OpportunityDetails";
import StatusBadge from "./StatusBadge";

const LABEL_ICONS: Record<string, string> = {
    New: "bxs-star",
    "Coming Up": "bx-calendar-event",
    Today: "bx-calendar-star",
    "Deadline Today": "bx-alarm-exclamation",
    "Deadline Approaching": "bx-alarm-exclamation",
};

type OpportunityCardProps = {
    opportunity: Opportunity;
};

const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
    const { student } = useOpportunities();
    const { pathname } = useLocation();
    const status = getStatus(opportunity, student, getTodayEastern());
    const [mainCategory, ...otherCategories] = opportunity.categories;
    // "New" or "Deadline Today" means nothing once the listing has ended,
    // and deadline labels repeat the badge when there's a date to show
    const label =
        status.struck ||
        (opportunity.deadline &&
            /^Deadline/.test(opportunity.bulletin_label ?? ""))
            ? null
            : opportunity.bulletin_label;

    return (
        <article className="relative flex flex-col gap-3 rounded-2xl [overflow-wrap:anywhere] bg-layer-1 p-6 shadow-prominent transition-colors sm:hover:bg-layer-2">
            {/* the badge drops below a long title on narrow phones */}
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <h2
                    className={`min-w-0 break-words text-xl font-semibold ${status.struck ? "text-typography-2 line-through" : "text-typography-1"}`}
                >
                    {/* the link covers the whole card */}
                    <Link
                        to={`/opportunities/${opportunity.id}`}
                        state={{ from: pathname }}
                        className="text-inherit no-underline after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                    >
                        {opportunity.title}
                    </Link>
                </h2>
                <StatusBadge status={status} />
            </div>

            {(mainCategory || label) && (
                <p className="flex flex-wrap items-center gap-1.5 text-sm">
                    {label && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-white">
                            <i
                                aria-hidden="true"
                                className={`bx ${LABEL_ICONS[label] ?? "bx-info-circle"}`}
                            />
                            {label}
                        </span>
                    )}
                    {mainCategory && (
                        <span className="rounded-2xl bg-layer-2 px-2.5 py-0.5 text-typography-1">
                            {mainCategory.name}
                        </span>
                    )}
                    {otherCategories.map((category) => (
                        <span
                            key={category.id}
                            className="rounded-2xl bg-layer-2 px-2.5 py-0.5 text-typography-2"
                        >
                            {category.name}
                        </span>
                    ))}
                </p>
            )}

            <OpportunityDetails opportunity={opportunity} />

            <p className="line-clamp-4 text-sm text-typography-2">
                {unquote(opportunity.description)}
            </p>

            <EligibilityLine opportunity={opportunity} />
        </article>
    );
};

export default OpportunityCard;
