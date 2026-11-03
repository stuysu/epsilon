import { useContext } from "react";
import UserContext from "../../../contexts/UserContext";
import { isOpenToAll } from "../bulletin/normalize";
import { Opportunity } from "../types";
import { isIneligible } from "../utils";

type EligibilityLineProps = {
    opportunity: Opportunity;
};

const EligibilityLine = ({ opportunity }: EligibilityLineProps) => {
    const user = useContext(UserContext);
    const { eligibilities, eligibility_text: text } = opportunity;

    if (!eligibilities.length) {
        // ages and GPAs have no tag, so show any limit in the bulletin's words
        if (!text || isOpenToAll(text)) return null;
        return <p className="text-sm text-typography-2">Eligibility: {text}</p>;
    }

    const ineligible = isIneligible(opportunity, user.grade);

    return (
        <p
            className={`flex flex-wrap items-center gap-1 text-sm ${
                ineligible ? "text-yellow" : "text-typography-2"
            }`}
        >
            Only eligible for
            {eligibilities.map((eligibility) => (
                <span
                    key={eligibility.id}
                    className={`rounded px-1.5 text-sm ${
                        ineligible
                            ? "bg-yellow text-black scheme-light:text-white"
                            : "bg-layer-2 text-typography-2"
                    }`}
                >
                    {eligibility.name}
                </span>
            ))}
        </p>
    );
};

export default EligibilityLine;
