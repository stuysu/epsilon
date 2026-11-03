import { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../../../contexts/UserContext";
import { Opportunity } from "../types";
import { getStatus, getTodayEastern } from "../utils";
import EligibilityLine from "./EligibilityLine";
import OpportunityDetails from "./OpportunityDetails";
import StatusBadge from "./StatusBadge";

type OpportunityCardProps = {
    opportunity: Opportunity;
};

const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
    const user = useContext(UserContext);
    const status = getStatus(opportunity, user.grade, getTodayEastern());
    const [mainCategory, ...otherCategories] = opportunity.categories;
    // "New" or "Deadline Today" means nothing once the listing has ended
    const label = status.struck ? null : opportunity.bulletin_label;

    return (
        <article className="relative flex flex-col gap-3 rounded-2xl bg-layer-1 p-6 shadow-prominent transition-colors sm:hover:bg-layer-2">
            {/* the badge drops below a long title on narrow phones */}
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <h2
                    className={`min-w-0 break-words text-xl font-semibold ${status.struck ? "line-through text-typography-2" : ""}`}
                >
                    {/* the link covers the whole card */}
                    <Link
                        to={`/opportunities/${opportunity.id}`}
                        className="text-inherit no-underline after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                    >
                        {opportunity.title}
                    </Link>
                </h2>
                <StatusBadge status={status} />
            </div>

            {(mainCategory || label) && (
                <p className="flex flex-wrap items-center gap-1.5 text-sm text-typography-2">
                    {label && (
                        <span className="rounded bg-accent px-1.5 text-white">
                            {label}
                        </span>
                    )}
                    {mainCategory && (
                        <span className="rounded bg-layer-2 px-1.5 text-typography-1">
                            {mainCategory.name}
                        </span>
                    )}
                    {otherCategories.map((category) => (
                        <span key={category.id}>· {category.name}</span>
                    ))}
                </p>
            )}

            <OpportunityDetails opportunity={opportunity} />

            <p className="line-clamp-4 text-sm text-typography-2">
                {opportunity.description}
            </p>

            <EligibilityLine opportunity={opportunity} />
        </article>
    );
};

export default OpportunityCard;
