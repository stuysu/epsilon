import { Popover, Slider, Toggle } from "radix-ui";
import { ReactNode, useEffect, useId, useState } from "react";
import CheckboxField from "../../../components/ui/input/CheckboxField";
import SearchInput from "../../../components/ui/input/SearchInput";
import ToggleChip from "../../../components/ui/input/ToggleChip";
import {
    OpportunityCategory,
    OpportunityEligibility,
    OpportunityFilters,
} from "../types";
import { DEFAULT_FILTERS, toggleValue } from "../utils";
import { useOpportunities } from "../OpportunitiesContext";

type FilterPanelProps = {
    filters: OpportunityFilters;
    onChange: (filters: OpportunityFilters) => void;
    categories: OpportunityCategory[];
    eligibilities: OpportunityEligibility[];
    maxCost: number;
};

const formatDollars = (amount: number) => `$${amount.toLocaleString("en-US")}`;

type FilterGroupProps = {
    title: string;
    action?: ReactNode;
    children: ReactNode;
};

const FilterGroup = ({ title, action, children }: FilterGroupProps) => (
    <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-normal text-typography-2">{title}</h3>
            {action}
        </div>
        {children}
    </section>
);

// not a filter, so Reset leaves it alone
const AboutYou = ({ groups }: { groups: OpportunityEligibility[] }) => {
    const { student, setAboutYou } = useOpportunities();
    const chosen = student.groups;

    const toggle = (name: string) => {
        const next = toggleValue(chosen ?? [], name);
        setAboutYou(next.length ? next : null);
    };

    return (
        <FilterGroup
            title="About You"
            action={
                chosen !== null && (
                    <button
                        type="button"
                        onClick={() => setAboutYou(null)}
                        className="cursor-pointer rounded text-sm text-typography-2 hover:text-typography-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                    >
                        Clear
                    </button>
                )
            }
        >
            <p className="text-sm text-typography-2">
                Marks what you can&apos;t apply for. Saved only on this device.
            </p>
            <div className="flex flex-wrap gap-2">
                {groups.map((group) => (
                    <ToggleChip
                        key={group.id}
                        title={group.name}
                        selected={chosen?.includes(group.name) ?? false}
                        onChange={() => toggle(group.name)}
                    />
                ))}
                <ToggleChip
                    title="None of these"
                    selected={chosen !== null && chosen.length === 0}
                    onChange={(selected) => setAboutYou(selected ? [] : null)}
                />
            </div>
        </FilterGroup>
    );
};

type CategoryRowProps = {
    category: OpportunityCategory;
    subcategories: OpportunityCategory[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
};

const CategoryRow = ({
    category,
    subcategories,
    selectedIds,
    onChange,
}: CategoryRowProps) => {
    const selectedSubs = subcategories.filter((sub) =>
        selectedIds.includes(sub.id),
    );
    const subIds = subcategories.map((sub) => sub.id);
    const withoutFamily = selectedIds.filter(
        (id) => id !== category.id && !subIds.includes(id),
    );
    const allSelected = selectedIds.includes(category.id);
    const pressed = allSelected || selectedSubs.length > 0;
    const headingId = useId();
    // the name includes the count shown on the button, so voice control matches it
    const triggerLabel = `${category.name} subcategories${
        selectedSubs.length
            ? `, ${selectedSubs.length} of ${subcategories.length} selected`
            : ""
    }`;

    const toggleSub = (subId: number) => {
        const nextSubs = toggleValue(
            selectedSubs.map((sub) => sub.id),
            subId,
        );
        onChange([...withoutFamily, ...nextSubs]);
    };

    return (
        <div
            className={`flex items-center rounded-lg shadow-control transition-colors ${
                pressed
                    ? "bg-accent text-white"
                    : "bg-layer-2 text-typography-2"
            }`}
        >
            <Toggle.Root
                pressed={pressed}
                onPressedChange={() =>
                    onChange(
                        pressed
                            ? withoutFamily
                            : [...withoutFamily, category.id],
                    )
                }
                className="flex-1 cursor-pointer px-3 py-1 text-left text-sm"
            >
                {category.name}
            </Toggle.Root>

            {subcategories.length > 0 && (
                <Popover.Root>
                    <Popover.Trigger
                        aria-label={triggerLabel}
                        // a taller invisible hit area, short of the rows above and below
                        className="relative flex cursor-pointer items-center gap-1 px-2 py-1 text-sm after:absolute after:-inset-y-[7px] after:left-0 after:-right-1 after:content-['']"
                    >
                        {selectedSubs.length > 0 &&
                            `${selectedSubs.length} of ${subcategories.length}`}
                        <i className="bx bx-filter-alt" aria-hidden="true" />
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content
                            side="right"
                            align="start"
                            sideOffset={8}
                            collisionPadding={16}
                            aria-labelledby={headingId}
                            className="z-50 flex w-56 flex-col gap-1 rounded-xl border border-divider bg-bg p-3 shadow-prominent"
                        >
                            <p
                                id={headingId}
                                className="important text-sm text-typography-2"
                            >
                                Filter {category.name}
                            </p>
                            <CheckboxField
                                checked={allSelected}
                                onChange={() =>
                                    onChange(
                                        allSelected
                                            ? withoutFamily
                                            : [...withoutFamily, category.id],
                                    )
                                }
                                label={`All ${category.name}`}
                            />
                            {subcategories.map((sub) => (
                                <CheckboxField
                                    key={sub.id}
                                    checked={selectedIds.includes(sub.id)}
                                    onChange={() => toggleSub(sub.id)}
                                    label={sub.name}
                                />
                            ))}
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            )}
        </div>
    );
};

const FilterPanel = ({
    filters,
    onChange,
    categories,
    eligibilities,
    maxCost,
}: FilterPanelProps) => {
    const update = (changes: Partial<OpportunityFilters>) =>
        onChange({ ...filters, ...changes });

    const mainCategories = categories.filter((c) => c.parent_id === null);
    const sortLabel =
        filters.sort === "deadline"
            ? "Sorted by deadline (switch to newest)"
            : "Sorted by newest (switch to deadline)";
    const costValue = filters.costRange ?? [0, maxCost];

    // keep the thumbs smooth while dragging, then filter when released
    const [draftCost, setDraftCost] = useState<number[]>(costValue);
    useEffect(() => {
        setDraftCost(filters.costRange ?? [0, maxCost]);
    }, [filters.costRange, maxCost]);

    return (
        <div className="flex flex-col">
            <SearchInput
                id="opportunity-search"
                placeholder="Search anything..."
                aria-label="Search opportunities"
                value={filters.query}
                onChange={(query) => update({ query })}
                inputClassName="pr-20"
                trailing={
                    <div className="absolute right-1 top-1/2 z-10 flex -translate-y-1/2">
                        <button
                            type="button"
                            aria-label="Reset all filters"
                            title="Reset all filters"
                            onClick={() => onChange(DEFAULT_FILTERS)}
                            className="flex h-10 w-9 cursor-pointer items-center justify-center rounded-lg text-typography-2 hover:text-typography-1"
                        >
                            <i className="bx bx-reset" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            aria-label={sortLabel}
                            title={sortLabel}
                            onClick={() =>
                                update({
                                    sort:
                                        filters.sort === "deadline"
                                            ? "newest"
                                            : "deadline",
                                })
                            }
                            className="flex h-10 w-9 cursor-pointer items-center justify-center rounded-lg text-typography-2 hover:text-typography-1"
                        >
                            <i
                                className="bx bx-sort-alt-2"
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                }
            />
            <div className="flex flex-col gap-5">
                <FilterGroup title="Status">
                    <div className="grid grid-cols-2 gap-2">
                        <ToggleChip
                            title="Active"
                            selected={filters.statuses.includes("active")}
                            onChange={() =>
                                update({
                                    statuses: toggleValue(
                                        filters.statuses,
                                        "active",
                                    ),
                                })
                            }
                        />
                        <ToggleChip
                            title="Archived"
                            selected={filters.statuses.includes("archived")}
                            onChange={() =>
                                update({
                                    statuses: toggleValue(
                                        filters.statuses,
                                        "archived",
                                    ),
                                })
                            }
                        />
                    </div>
                </FilterGroup>

                <FilterGroup title="Deadline">
                    <div className="grid grid-cols-2 gap-2">
                        <ToggleChip
                            title="This Week"
                            selected={filters.deadlines.includes("week")}
                            onChange={() =>
                                update({
                                    deadlines: toggleValue(
                                        filters.deadlines,
                                        "week",
                                    ),
                                })
                            }
                        />
                        <ToggleChip
                            title="Rolling Basis"
                            selected={filters.deadlines.includes("rolling")}
                            onChange={() =>
                                update({
                                    deadlines: toggleValue(
                                        filters.deadlines,
                                        "rolling",
                                    ),
                                })
                            }
                        />
                    </div>
                </FilterGroup>

                <FilterGroup title="Categories">
                    <div className="flex flex-col gap-2">
                        {mainCategories.map((category) => (
                            <CategoryRow
                                key={category.id}
                                category={category}
                                subcategories={categories.filter(
                                    (c) => c.parent_id === category.id,
                                )}
                                selectedIds={filters.categoryIds}
                                onChange={(categoryIds) =>
                                    update({ categoryIds })
                                }
                            />
                        ))}
                    </div>
                </FilterGroup>

                <AboutYou
                    groups={eligibilities.filter((e) => e.grade === null)}
                />

                <FilterGroup
                    title="Eligibility"
                    action={
                        <CheckboxField
                            checked={filters.showIneligible}
                            onChange={(showIneligible) =>
                                update({ showIneligible })
                            }
                            label="Show ineligible"
                        />
                    }
                >
                    <div className="flex flex-wrap gap-2">
                        {eligibilities.map((eligibility) => (
                            <ToggleChip
                                key={eligibility.id}
                                title={eligibility.name}
                                selected={filters.eligibilityIds.includes(
                                    eligibility.id,
                                )}
                                onChange={() =>
                                    update({
                                        eligibilityIds: toggleValue(
                                            filters.eligibilityIds,
                                            eligibility.id,
                                        ),
                                    })
                                }
                            />
                        ))}
                    </div>
                </FilterGroup>

                {maxCost > 0 && (
                    <FilterGroup
                        title="Cost"
                        action={
                            <span className="text-sm text-typography-1">
                                ${draftCost[0].toLocaleString("en-US")} to $
                                {draftCost[1].toLocaleString("en-US")}
                            </span>
                        }
                    >
                        <Slider.Root
                            className="relative flex h-5 w-full touch-none select-none items-center"
                            min={0}
                            max={maxCost}
                            step={Math.max(1, Math.round(maxCost / 100))}
                            minStepsBetweenThumbs={1}
                            value={draftCost}
                            onValueChange={setDraftCost}
                            onValueCommit={([low, high]) =>
                                update({
                                    costRange:
                                        low === 0 && high === maxCost
                                            ? null
                                            : [low, high],
                                })
                            }
                        >
                            <Slider.Track className="relative h-1 grow rounded-full bg-layer-3">
                                <Slider.Range className="absolute h-full rounded-full bg-accent" />
                            </Slider.Track>
                            {/* each thumb's hit area reaches 24px past its 16px dot */}
                            <Slider.Thumb
                                aria-label="Minimum cost"
                                aria-valuetext={formatDollars(draftCost[0])}
                                className="relative block h-4 w-4 cursor-pointer rounded-full bg-accent shadow-control outline-none after:absolute after:-inset-1 after:content-[''] focus-visible:ring-2 focus-visible:ring-typography-1"
                            />
                            <Slider.Thumb
                                aria-label="Maximum cost"
                                aria-valuetext={formatDollars(draftCost[1])}
                                className="relative block h-4 w-4 cursor-pointer rounded-full bg-accent shadow-control outline-none after:absolute after:-inset-1 after:content-[''] focus-visible:ring-2 focus-visible:ring-typography-1"
                            />
                        </Slider.Root>
                    </FilterGroup>
                )}
            </div>
        </div>
    );
};

export default FilterPanel;
