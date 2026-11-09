import { useState } from "react";
import { capitalizeWords } from "../../../utils/DataFormatters";
import SearchInput from "../../../components/ui/input/SearchInput";
import SortSelect from "../../../components/ui/input/SortSelect";
import ToggleChip from "../../../components/ui/input/ToggleChip";
import {
    FilterGroup,
    FiltersToggle,
    ResetFiltersButton,
} from "../../../components/ui/input/FilterControls";

type Props = {
    value: SearchParams;
    onChange: (s: SearchParams) => void;
    isOneColumn: boolean;
    isTwoColumn: boolean;
    isTwoWrap: boolean;
};

const tags = [
    "Arts & Crafts",
    "Academic & Professional",
    "Club Sports & Recreational Games",
    "Community Service & Volunteering",
    "Cultural & Religious",
    "Music",
    "Public Speaking",
    "STEM",
    "Student Support & Government",
    "Hobby & Special Interest",
    "Publication",
];

const commitmentLevels = ["NONE", "LOW", "MEDIUM", "HIGH"];

const meetingDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const ACRONYMS = new Set(["STEM"]);

const SORTS: { value: CatalogSort; label: string }[] = [
    { value: "shuffle", label: "Shuffled" },
    { value: "name", label: "Name (A-Z)" },
    { value: "members", label: "Most members" },
    { value: "newest", label: "Newest first" },
];

const groups: {
    key: "tags" | "commitmentLevels" | "meetingDays";
    title: string;
    options: string[];
}[] = [
    { key: "tags", title: "Tags", options: tags },
    {
        key: "commitmentLevels",
        title: "Commitment Level",
        options: commitmentLevels,
    },
    { key: "meetingDays", title: "Meeting Days", options: meetingDays },
];

const SearchFilter = ({
    value,
    onChange,
    isOneColumn,
    isTwoColumn,
    isTwoWrap,
}: Props) => {
    const [filtersOpen, setFiltersOpen] = useState(false);
    const activeCount =
        value.tags.length +
        value.commitmentLevels.length +
        value.meetingDays.length;
    return (
        <div
            style={{
                width:
                    isOneColumn || isTwoWrap
                        ? "100%"
                        : isTwoColumn
                          ? "30%"
                          : "25%",
                height: isOneColumn || isTwoWrap ? " " : "100vh",
                paddingLeft: isOneColumn ? "1rem" : "3rem",
                paddingRight: isOneColumn
                    ? "1rem"
                    : isTwoWrap
                      ? "3rem"
                      : "0rem",
                position: isOneColumn || isTwoWrap ? "relative" : "sticky",
                top: 0,
                paddingTop: "40px",
            }}
        >
            <SearchInput
                placeholder="Search activities"
                aria-label="Search activities"
                value={value.name}
                onChange={(val) => onChange({ ...value, name: val })}
                trailing={
                    <div className="absolute right-1 top-1/2 z-10 -translate-y-1/2">
                        <SortSelect
                            compact
                            value={value.sort}
                            onChange={(sort) => onChange({ ...value, sort })}
                            options={SORTS}
                            label="Sort"
                        />
                    </div>
                }
            />
            <ResetFiltersButton
                disabled={
                    !activeCount && !value.name && value.sort === "shuffle"
                }
                onReset={() =>
                    onChange({
                        name: "",
                        tags: [],
                        commitmentLevels: [],
                        meetingDays: [],
                        sort: "shuffle",
                    })
                }
            />
            {isOneColumn && (
                <FiltersToggle
                    open={filtersOpen}
                    onToggle={() => setFiltersOpen(!filtersOpen)}
                    controls="activity-filters"
                    count={activeCount}
                />
            )}
            <div
                id="activity-filters"
                className={`flex flex-col gap-5 ${isOneColumn && !filtersOpen ? "hidden" : ""}`}
            >
                {groups.map((group) => (
                    <FilterGroup key={group.key} title={group.title}>
                        <div className="flex flex-wrap gap-2">
                            {group.options.map((option) => (
                                <ToggleChip
                                    key={option}
                                    title={
                                        ACRONYMS.has(option)
                                            ? option
                                            : capitalizeWords(option)
                                    }
                                    selected={value[group.key].includes(option)}
                                    onChange={(selected) =>
                                        onChange({
                                            ...value,
                                            [group.key]: selected
                                                ? [option, ...value[group.key]]
                                                : value[group.key].filter(
                                                      (v) => v !== option,
                                                  ),
                                        })
                                    }
                                />
                            ))}
                        </div>
                    </FilterGroup>
                ))}
            </div>
        </div>
    );
};

export default SearchFilter;
