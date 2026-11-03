import CheckboxField from "../../../components/ui/input/CheckboxField";
import { Opportunity } from "../types";
import { toggleValue } from "../utils";

type NoLongerListedProps = {
    opportunities: Opportunity[];
    archiveIds: number[];
    onChange: (archiveIds: number[]) => void;
};

const NoLongerListed = ({
    opportunities,
    archiveIds,
    onChange,
}: NoLongerListedProps) => (
    <section className="rounded-2xl bg-layer-1 p-6 shadow-control">
        <h3 className="mb-1">No longer listed</h3>
        <p className="mb-3 text-sm text-typography-2">
            These are not in this bulletin. Checked ones will be archived and
            can return if a later bulletin lists them.
        </p>
        <div className="flex flex-col">
            {opportunities.map((opportunity) => (
                <CheckboxField
                    key={opportunity.id}
                    label={opportunity.title}
                    checked={archiveIds.includes(opportunity.id)}
                    onChange={() =>
                        onChange(toggleValue(archiveIds, opportunity.id))
                    }
                />
            ))}
        </div>
    </section>
);

export default NoLongerListed;
