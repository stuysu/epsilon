import { Slider, Toggle } from "radix-ui";
import { ReactNode, useEffect, useId, useState } from "react";
import CheckboxField from "../../../components/ui/input/CheckboxField";
import SearchInput from "../../../components/ui/input/SearchInput";
import SortSelect from "../../../components/ui/input/SortSelect";
import ToggleChip from "../../../components/ui/input/ToggleChip";
import {
    OpportunityCategory,
    OpportunityEligibility,
    OpportunityFilters,
} from "../types";
import { toggleValue } from "../utils";
import { useOpportunities } from "../OpportunitiesContext";

type FilterPanelProps = {
    filters: OpportunityFilters;
    onChange: (filters: OpportunityFilters) => void;
    categories: OpportunityCategory[];
    eligibilities: OpportunityEligibility[];
    maxCost: number;
    canReset: boolean;
    onReset: () => void;
};

const SORTS: { value: OpportunityFilters["sort"]; label: string }[] = [
    { value: "deadline", label: "Soonest deadline" },
    { value: "newest", label: "Newest first" },
    { value: "title", label: "Title (A-Z)" },
    { value: "cost", label: "Lowest cost" },
];

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
                Pick any that describe you.
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

const ROW_CLASS =
    "important w-full cursor-pointer rounded-lg px-3 pb-[0.35rem] pt-1 text-left text-sm shadow-control transition-colors";
const rowColors = (on: boolean) =>
    on
        ? "bg-accent text-white"
        : "bg-layer-2 text-typography-2 hover:bg-layer-3";

type CategoryRowProps = {
    category: OpportunityCategory;
    subcategories: OpportunityCategory[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
};

// turning a category on shows its subcategories underneath
const CategoryRow = ({
    category,
    subcategories,
    selectedIds,
    onChange,
}: CategoryRowProps) => {
    const subIds = subcategories.map((sub) => sub.id);
    const selectedSubs = subIds.filter((id) => selectedIds.includes(id));
    const withoutFamily = selectedIds.filter(
        (id) => id !== category.id && !subIds.includes(id),
    );
    const allSelected = selectedIds.includes(category.id);
    const pressed = allSelected || selectedSubs.length > 0;
    const groupId = useId();

    // with no subcategory left, the whole category stays chosen
    const toggleSub = (subId: number) => {
        const next = toggleValue(selectedSubs, subId);
        onChange([...withoutFamily, ...(next.length ? next : [category.id])]);
    };

    return (
        <div className="flex flex-col gap-2">
            <Toggle.Root
                pressed={pressed}
                onPressedChange={() =>
                    onChange(
                        pressed
                            ? withoutFamily
                            : [...withoutFamily, category.id],
                    )
                }
                aria-controls={subcategories.length ? groupId : undefined}
                className={`${ROW_CLASS} flex items-center justify-between gap-2 ${rowColors(pressed)}`}
            >
                {category.name}
                {subcategories.length > 0 && (
                    <i
                        className={`bx ${pressed ? "bx-chevron-up" : "bx-chevron-down"}`}
                        aria-hidden="true"
                    />
                )}
            </Toggle.Root>

            {pressed && subcategories.length > 0 && (
                <div
                    id={groupId}
                    role="group"
                    aria-label={`${category.name} subcategories`}
                    className="ml-3 flex flex-col gap-2 border-l border-divider pl-3"
                >
                    <Toggle.Root
                        pressed={allSelected}
                        onPressedChange={() =>
                            onChange([...withoutFamily, category.id])
                        }
                        className={`${ROW_CLASS} ${rowColors(allSelected)}`}
                    >
                        All {category.name}
                    </Toggle.Root>
                    {subcategories.map((sub) => {
                        const on = selectedSubs.includes(sub.id);
                        return (
                            <Toggle.Root
                                key={sub.id}
                                pressed={on}
                                onPressedChange={() => toggleSub(sub.id)}
                                className={`${ROW_CLASS} ${rowColors(on)}`}
                            >
                                {sub.name}
                            </Toggle.Root>
                        );
                    })}
                </div>
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
    canReset,
    onReset,
}: FilterPanelProps) => {
    const update = (changes: Partial<OpportunityFilters>) =>
        onChange({ ...filters, ...changes });

    const mainCategories = categories.filter((c) => c.parent_id === null);
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
                placeholder="Search Anything..."
                aria-label="Search opportunities"
                value={filters.query}
                onChange={(query) => update({ query })}
                trailing={
                    <div className="absolute right-1 top-1/2 z-10 -translate-y-1/2">
                        <SortSelect
                            compact
                            value={filters.sort}
                            onChange={(sort) => update({ sort })}
                            options={SORTS}
                            label="Sort"
                        />
                    </div>
                }
            />
            <button
                type="button"
                onClick={onReset}
                disabled={!canReset}
                className="important -mt-2 mb-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-layer-2 px-3 py-1.5 text-sm text-typography-1 shadow-control transition-colors enabled:cursor-pointer enabled:hover:bg-layer-3 disabled:text-typography-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
            >
                <i className="bx bx-reset" aria-hidden="true" />
                Reset Filters
            </button>
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
                    title="Open To"
                    action={
                        <CheckboxField
                            checked={filters.showIneligible}
                            onChange={(showIneligible) =>
                                update({ showIneligible })
                            }
                            label="Show Ineligible"
                            small
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
                            <span className="text-sm text-typography-1 [font-variation-settings:'wght'_500]">
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
                            {/* thumb hit areas reach 24px past the dot */}
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
