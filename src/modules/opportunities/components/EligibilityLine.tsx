import { isOpenToAll } from "../bulletin/normalize";
import { useOpportunities } from "../OpportunitiesContext";
import { Opportunity, OpportunityTag } from "../types";
import { isEligible, isIneligible } from "../utils";

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
        className={`flex flex-wrap items-center gap-1 important text-[0.8125rem] ${
            highlight
                ? "text-red scheme-dark:text-[#ff6b5c]"
                : "text-typography-2"
        }`}
    >
        {label}
        {tags.map((tag) => (
            <span
                key={tag.id}
                className={`rounded-[3px] px-1 ${
                    highlight
                        ? "bg-red text-white scheme-dark:bg-[#e45647b3] scheme-dark:text-[#e8e8e8]"
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
        // ages and GPAs have no tag, so show the bulletin's words
        if (!text || isOpenToAll(text)) return null;
        return (
            <p className="text-sm text-typography-2 [overflow-wrap:anywhere]">
                Eligibility: {text}
            </p>
        );
    }

    return (
        <>
            {/* only worth showing when the student may not qualify */}
            {required.length > 0 && !isEligible(opportunity, student) && (
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
