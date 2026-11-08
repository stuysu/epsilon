import { Opportunity } from "../types";
import { getCostLabel } from "../utils";

type OpportunityDetailsProps = {
    opportunity: Opportunity;
    full?: boolean;
};

const OpportunityDetails = ({
    opportunity,
    full = false,
}: OpportunityDetailsProps) => {
    // the icons are decorative, so each row is named for screen readers
    const rows = [
        { icon: "bx-calendar", label: "Dates", text: opportunity.date_text },
        { icon: "bx-map", label: "Location", text: opportunity.location },
        { icon: "bx-dollar", label: "Cost", text: getCostLabel(opportunity) },
        // the bulletin's wording can hold several rounds the badge can't show
        ...(full
            ? [
                  {
                      icon: "bx-time-five",
                      label: "Deadline",
                      text: opportunity.deadline_text,
                  },
                  {
                      icon: "bx-user",
                      label: "Eligibility",
                      text: opportunity.eligibility_text,
                  },
              ]
            : []),
    ];

    return (
        <ul className="flex flex-col gap-1.5">
            {rows.map(
                ({ icon, label, text }) =>
                    text && (
                        <li
                            key={icon}
                            className="flex items-center gap-2 rounded-lg bg-layer-2 px-3 py-1 text-sm text-typography-1 [font-variation-settings:'wght'_500]"
                        >
                            <i
                                className={`bx ${icon} text-typography-2`}
                                aria-hidden="true"
                            />
                            <span className="sr-only">{label}:</span>
                            <span className="min-w-0 [overflow-wrap:anywhere]">
                                {text}
                            </span>
                        </li>
                    ),
            )}
        </ul>
    );
};

export default OpportunityDetails;
