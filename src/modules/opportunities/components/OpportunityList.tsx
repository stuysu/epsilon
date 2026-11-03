import Skeleton from "../../../components/ui/Skeleton";
import { Opportunity } from "../types";
import OpportunityCard from "./OpportunityCard";

export const OpportunityListSkeleton = () => (
    <div className="flex flex-col gap-5" aria-hidden="true">
        {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-64 w-full rounded-2xl" />
        ))}
    </div>
);

type OpportunityListProps = {
    opportunities: Opportunity[];
};

const OpportunityList = ({ opportunities }: OpportunityListProps) => (
    <div className="flex flex-col gap-5">
        {opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
    </div>
);

export default OpportunityList;
