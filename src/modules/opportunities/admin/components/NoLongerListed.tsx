import CheckboxField from "../../../../components/ui/input/CheckboxField";
import { Opportunity } from "../../types";
import { formatDate, getTodayEastern, toggleValue } from "../../utils";

type NoLongerListedProps = {
    opportunities: Opportunity[];
    archiveIds: number[];
    onChange: (archiveIds: number[]) => void;
};

const NoLongerListed = ({
    opportunities,
    archiveIds,
    onChange,
}: NoLongerListedProps) => {
    const today = getTodayEastern();
    const toArchive = opportunities.filter((o) =>
        archiveIds.includes(o.id),
    ).length;
    return (
        <section className="rounded-2xl bg-layer-1 p-6 shadow-control max-sm:p-4">
            <h3 className="mb-1 leading-tight">
                No longer listed ({toArchive} of {opportunities.length} to
                archive)
            </h3>
            <p className="mb-3 text-sm text-typography-2">
                These are not in this bulletin. Checked ones will be archived
                and can return if a later bulletin lists them. Ones whose
                deadline hasn&apos;t passed start unchecked.
            </p>
            <div className="flex flex-col">
                {opportunities.map((opportunity) => {
                    const openUntil =
                        opportunity.deadline && opportunity.deadline >= today
                            ? formatDate(opportunity.deadline, {
                                  withYear:
                                      opportunity.deadline.slice(0, 4) !==
                                      today.slice(0, 4),
                              })
                            : null;
                    return (
                        <CheckboxField
                            key={opportunity.id}
                            label={
                                openUntil ? (
                                    <>
                                        {opportunity.title}
                                        <span className="text-typography-2">
                                            {" "}
                                            · open until {openUntil}
                                        </span>
                                    </>
                                ) : (
                                    opportunity.title
                                )
                            }
                            ariaLabel={`Archive ${opportunity.title}${openUntil ? `, open until ${openUntil}` : ""}`}
                            checked={archiveIds.includes(opportunity.id)}
                            onChange={() =>
                                onChange(
                                    toggleValue(archiveIds, opportunity.id),
                                )
                            }
                        />
                    );
                })}
            </div>
        </section>
    );
};

export default NoLongerListed;
