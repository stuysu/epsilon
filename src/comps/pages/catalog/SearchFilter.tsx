import { Box, Typography, TextField, Stack, Chip } from "@mui/material";

type Props = {
    value: SearchParams;
    onChange: (s: SearchParams) => void;
    isOneColumn: boolean;
    isTwoColumn: boolean;
    isTwoWrap: boolean;
};

const tags = [
    "Arts & Crafts",
    "Academic & Professoinal",
    "Club Sports & Recreational Games",
    "Community Service & Volunteering",
    "Cultural & Religious",
    "Music",
    "Public Speaking",
    "STEM",
    "Student Support & Governmnet",
    "Hobby & Special Interest",
    "Publication"
]

const commitmentLevels = [
    'NONE',
    'LOW',
    'MEDIUM',
    'HIGH'
]

const meetingDays = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY'
]

const caps = (s : string) => s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();

const onlyAlpha = /[^a-z0-9 ]/gi;

const SearchFilter = ({ value, onChange, isOneColumn, isTwoColumn, isTwoWrap }: Props) => {
    

    return (
        <Box
            sx={{
                width: isOneColumn || isTwoWrap ? "100%" : (isTwoColumn ? '30%' : '25%'),
                height: isOneColumn || isTwoWrap ? " " : "100vh",
                padding: "20px",
                position: isOneColumn || isTwoWrap ? "relative" : "sticky",
                top: 0,
                paddingTop: "40px",
                overflowY: 'auto'
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    height: "50px",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <TextField
                    label="Search"
                    sx={{ width: "100%" }}
                    value={value.name}
                    onChange={(e) => {
                        e.target.value = e.target.value.replace(onlyAlpha, "");
                        onChange({ ...value, name: e.target.value });
                    }}
                />
            </Box>
            <Box sx={{ width: "100%", marginTop: '20px' }}>
                <Typography sx={{ width: "100%" }}>Tags</Typography>
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ marginTop: '10px'}}>
                    {
                        tags.map(
                            tag => (
                                <Chip 
                                    label={caps(tag)}

                                />
                            )
                        )
                    }
                </Stack>
            </Box>
            <Box sx={{ width: "100%", marginTop: '20px' }}>
                <Typography sx={{ width: "100%" }}>Commitment Level</Typography>
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ marginTop: '10px'}}>
                    {
                        commitmentLevels.map(
                            level => (
                                <Chip 
                                    label={caps(level)}

                                />
                            )
                        )
                    }
                </Stack>
            </Box>
            <Box sx={{ width: "100%", marginTop: '20px' }}>
                <Typography sx={{ width: "100%" }}>Meeting Days</Typography>
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ marginTop: '10px'}}>
                    {
                        meetingDays.map(
                            day => (
                                <Chip 
                                    label={caps(day)}

                                />
                            )
                        )
                    }
                </Stack>
            </Box>
        </Box>
    );
};

export default SearchFilter;
