import { capitalizeWords } from "../../../utils/DataFormatters";
import SearchInput from "../../../components/ui/input/SearchInput";
import ToggleChip from "../../../components/ui/input/ToggleChip";
import { Slider } from "radix-ui";

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

const onlyAlpha = /[^a-z0-9 ]/gi;

const SearchFilter = ({
    value,
    onChange,
    isOneColumn,
    isTwoColumn,
    isTwoWrap,
}: Props) => {
    const commitmentRange = getCommitmentRange(value.commitmentLevels);
    const commitmentLabel = getCommitmentLabel(commitmentRange);

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
                paddingRight: isOneColumn ? "1rem" : "0rem",
                position: isOneColumn || isTwoWrap ? "relative" : "sticky",
                top: 0,
                paddingTop: "40px",
            }}
        >
            <SearchInput
                placeholder="Find Activities..."
                value={value.name}
                onChange={(val) => {
                    const clean = val.replace(onlyAlpha, "");
                    onChange({ ...value, name: clean });
                }}
            />

            <div className={"w-full mt-6"}>
                <p>Include Tags</p>
                <div className={"flex flex-row gap-2 flex-wrap mt-2"}>
                    {tags.map((tag) => (
                        <ToggleChip
                            key={tag}
                            title={capitalizeWords(tag)}
                            selectable={true}
                            defaultSelected={value.tags.includes(tag)}
                            onChange={(selected) => {
                                onChange({
                                    ...value,
                                    tags: selected
                                        ? [tag, ...value.tags]
                                        : value.tags.filter((v) => v !== tag),
                                });
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className={"w-full mt-6"}>
                <div className="flex items-center justify-between gap-4">
                    <p>Commitment Level</p>
                    <p className="important text-right text-typography-1">
                        {commitmentLabel}
                    </p>
                </div>
                <Slider.Root
                    className="relative mt-2 flex h-6 w-full touch-none select-none items-center"
                    value={commitmentRange}
                    min={0}
                    max={commitmentLevels.length - 1}
                    step={1}
                    minStepsBetweenThumbs={0}
                    onValueChange={(newRange) => {
                        const [minimum, maximum] = newRange;
                        const isFullRange =
                            minimum === 0 &&
                            maximum === commitmentLevels.length - 1;

                        onChange({
                            ...value,
                            commitmentLevels: isFullRange
                                ? []
                                : commitmentLevels.slice(minimum, maximum + 1),
                        });
                    }}
                >
                    <Slider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-layer-3 shadow-inner">
                        <Slider.Range className="absolute h-full rounded-full bg-accent" />
                    </Slider.Track>
                    <Slider.Thumb
                        aria-label="Minimum commitment level"
                        aria-valuetext={capitalizeWords(
                            commitmentLevels[commitmentRange[0]],
                        )}
                        className="backdrop-blur block size-5 rounded-full bg-accent outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                    />
                    <Slider.Thumb
                        aria-label="Maximum commitment level"
                        aria-valuetext={capitalizeWords(
                            commitmentLevels[commitmentRange[1]],
                        )}
                        className="backdrop-blur block size-5 rounded-full bg-accent outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                    />
                </Slider.Root>
            </div>

            <div className={"w-full mt-6"}>
                <p>Active Days</p>
                <div className={"flex w-full flex-row gap-2 mt-2"}>
                    {meetingDays.map((day) => (
                        <ToggleChip
                            key={day}
                            title={capitalizeWords(day.slice(0, 3))}
                            selectable={true}
                            defaultSelected={value.meetingDays.includes(day)}
                            className="min-w-0 flex-1"
                            onChange={(selected) => {
                                onChange({
                                    ...value,
                                    meetingDays: selected
                                        ? [day, ...value.meetingDays]
                                        : value.meetingDays.filter(
                                              (v) => v !== day,
                                          ),
                                });
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

function getCommitmentRange(selectedLevels: string[]): [number, number] {
    if (selectedLevels.length === 0) {
        return [0, commitmentLevels.length - 1];
    }

    const selectedIndices = selectedLevels
        .map((level) => commitmentLevels.indexOf(level))
        .filter((index) => index >= 0);

    if (selectedIndices.length === 0) {
        return [0, commitmentLevels.length - 1];
    }

    return [Math.min(...selectedIndices), Math.max(...selectedIndices)];
}

function getCommitmentLabel([minimum, maximum]: [number, number]) {
    const minimumLabel = capitalizeWords(commitmentLevels[minimum]);
    const maximumLabel = capitalizeWords(commitmentLevels[maximum]);

    return minimum === maximum
        ? minimumLabel
        : `${minimumLabel} to ${maximumLabel}`;
}

export default SearchFilter;
