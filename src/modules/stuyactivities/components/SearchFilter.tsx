import { capitalizeWords } from "../../../utils/DataFormatters";
import SearchInput from "../../../components/ui/input/SearchInput";
import InteractiveChip from "../../../components/ui/input/InteractiveChip";
import { PUBLIC_URL } from "../../../config/constants";
import React from "react";

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
            <img
                src={`${PUBLIC_URL}/textures/org_color.png`}
                alt={""}
                className="absolute blur-2xl opacity-10 pointer-events-none"
            />
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
                        <InteractiveChip
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
                <p>Commitment Level</p>
                <div className={"flex flex-row gap-2 flex-wrap mt-2"}>
                    {commitmentLevels.map((level) => (
                        <InteractiveChip
                            key={level}
                            title={capitalizeWords(level)}
                            selectable={true}
                            defaultSelected={value.commitmentLevels.includes(
                                level,
                            )}
                            onChange={(selected) => {
                                onChange({
                                    ...value,
                                    commitmentLevels: selected
                                        ? [level, ...value.commitmentLevels]
                                        : value.commitmentLevels.filter(
                                              (v) => v !== level,
                                          ),
                                });
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className={"w-full mt-6"}>
                <p>Meeting Days</p>
                <div className={"flex flex-row gap-2 flex-wrap mt-2"}>
                    {meetingDays.map((day) => (
                        <InteractiveChip
                            key={day}
                            title={capitalizeWords(day)}
                            selectable={true}
                            defaultSelected={value.meetingDays.includes(day)}
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

export default SearchFilter;
