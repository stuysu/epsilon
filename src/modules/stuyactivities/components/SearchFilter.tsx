import { Box, Chip, InputBase, Stack, Typography } from "@mui/material";

import { capitalizeWords } from "../../../utils/DataFormatters";

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
        <Box
            sx={{
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
                overflowY: "auto",
            }}
        >
            <div className={"relative"}>
                <i
                    className={
                        "absolute bx bx-search bx-sm z-10 top-[0.8rem] left-3"
                    }
                ></i>
                <Box
                    sx={{
                        width: "100%",
                        height: "50px",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <InputBase
                        placeholder="Find Activities..."
                        sx={{
                            borderRadius: "10px",
                            width: "100%",
                            padding: "20px",
                            paddingLeft: "45px",
                            paddingBottom: "17px",
                            fontVariationSettings: `'wght' 700`,
                            transition: "background-color 0.1s ease",
                            backgroundColor: "#1F1F1F80",
                            "&:hover": {
                                backgroundColor: "#2A2A2A80",
                            },
                            "&:focus-within": {
                                backgroundColor: "#3A3A3A80",
                            },
                            boxShadow:
                                "0px 0px 2px 0px rgba(255, 255, 255, 0.30) inset",
                        }}
                        value={value.name}
                        onChange={(e) => {
                            e.target.value = e.target.value.replace(
                                onlyAlpha,
                                "",
                            );
                            onChange({ ...value, name: e.target.value });
                        }}
                    />
                </Box>
            </div>
            <Box sx={{ width: "100%", marginTop: "20px" }}>
                <Typography sx={{ width: "100%" }}>Tags</Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ marginTop: "10px" }}
                >
                    {tags.map((tag) => (
                        <Chip
                            key={tag}
                            sx={{
                                borderRadius: "10px",
                                paddingTop: "1px",
                                fontVariationSettings: "'wght' 700",
                                color: "rgba(218,218,218,0.8)",
                            }}
                            label={capitalizeWords(tag)}
                            onClick={() => {
                                let exists =
                                    value.tags.findIndex((v) => v === tag) !==
                                    -1;

                                onChange({
                                    ...value,
                                    tags: exists
                                        ? value.tags.filter((v) => v !== tag)
                                        : [tag, ...value.tags],
                                });
                            }}
                            variant={
                                value.tags.find((v) => v === tag)
                                    ? "filled"
                                    : "outlined"
                            }
                            clickable
                        />
                    ))}
                </Stack>
            </Box>
            <Box sx={{ width: "100%", marginTop: "20px" }}>
                <Typography sx={{ width: "100%" }}>Commitment Level</Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ marginTop: "10px" }}
                >
                    {commitmentLevels.map((level) => (
                        <Chip
                            key={level}
                            sx={{
                                borderRadius: "10px",
                                paddingTop: "1px",
                                fontVariationSettings: "'wght' 700",
                                color: "rgba(218,218,218,0.8)",
                            }}
                            label={capitalizeWords(level)}
                            onClick={() => {
                                let exists =
                                    value.commitmentLevels.findIndex(
                                        (v) => v === level,
                                    ) !== -1;

                                onChange({
                                    ...value,
                                    commitmentLevels: exists
                                        ? value.commitmentLevels.filter(
                                              (v) => v !== level,
                                          )
                                        : [level, ...value.commitmentLevels],
                                });
                            }}
                            variant={
                                value.commitmentLevels.find((v) => v === level)
                                    ? "filled"
                                    : "outlined"
                            }
                            clickable
                        />
                    ))}
                </Stack>
            </Box>
            <Box sx={{ width: "100%", marginTop: "20px" }}>
                <Typography sx={{ width: "100%" }}>Meeting Days</Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ marginTop: "10px" }}
                >
                    {meetingDays.map((day) => (
                        <Chip
                            key={day}
                            sx={{
                                borderRadius: "10px",
                                paddingTop: "1px",
                                fontVariationSettings: "'wght' 700",
                                color: "rgba(218,218,218,0.8)",
                            }}
                            label={capitalizeWords(day)}
                            onClick={() => {
                                let exists =
                                    value.meetingDays.findIndex(
                                        (v) => v === day,
                                    ) !== -1;

                                onChange({
                                    ...value,
                                    meetingDays: exists
                                        ? value.meetingDays.filter(
                                              (v) => v !== day,
                                          )
                                        : [day, ...value.meetingDays],
                                });
                            }}
                            variant={
                                value.meetingDays.find((v) => v === day)
                                    ? "filled"
                                    : "outlined"
                            }
                            clickable
                        />
                    ))}
                </Stack>
            </Box>
        </Box>
    );
};

export default SearchFilter;
