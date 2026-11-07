import { isOpenToAll } from "../bulletin/normalize";
import { useOpportunities } from "../OpportunitiesContext";
import { Opportunity, OpportunityTag } from "../types";
import { isIneligible } from "../utils";

type EligibilityLineProps = {
    opportunity: Opportunity;
};

const TagList = ({
    label,
    tags,
    highlight,
}: {
    label: string;
    tags: OpportunityTag[];
    highlight: boolean;
}) => (
    <p
        className={`flex flex-wrap items-center gap-1 text-sm ${
            highlight ? "text-yellow" : "text-typography-2"
        }`}
    >
        {label}
        {tags.map((tag) => (
            <span
                key={tag.id}
                className={`rounded px-1.5 text-sm ${
                    highlight
                        ? "bg-yellow text-black scheme-light:text-white"
                        : "bg-layer-2 text-typography-2"
                }`}
            >
                {tag.name}
            </span>
        ))}
    </p>
);

const EligibilityLine = ({ opportunity }: EligibilityLineProps) => {
    const { student } = useOpportunities();
    const { eligibilities, eligibility_text: text } = opportunity;
    const required = eligibilities.filter((tag) => !tag.preferred);
    const preferred = eligibilities.filter((tag) => tag.preferred);

    if (!required.length && !preferred.length) {
        // ages and GPAs have no tag, so show any limit in the bulletin's words
        if (!text || isOpenToAll(text)) return null;
        return <p className="text-sm text-typography-2">Eligibility: {text}</p>;
    }

    return (
        <>
            {required.length > 0 && (
                <TagList
                    label="Only eligible for"
                    tags={required}
                    highlight={isIneligible(opportunity, student)}
                />
            )}
            {preferred.length > 0 && (
                <TagList
                    label="Especially for"
                    tags={preferred}
                    highlight={false}
                />
            )}
        </>
    );
};

export default EligibilityLine;
