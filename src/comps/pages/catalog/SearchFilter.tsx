import { Box, Typography, TextField } from "@mui/material";

type Props = {
    value: SearchParams;
    onChange: (s: SearchParams) => void;
    isOneColumn: boolean;
    isTwoColumn: boolean;
};

const onlyAlpha = /[^a-z0-9 ]/gi;

const SearchFilter = ({ value, onChange, isOneColumn, isTwoColumn }: Props) => {
    return (
        <Box
            sx={{
                width: isOneColumn || isTwoColumn ? "100%" : "25%",
                height: isOneColumn || isTwoColumn ? " " : "100vh",
                padding: "20px",
                position: isOneColumn || isTwoColumn ? "relative" : "sticky",
                top: 0,
                paddingTop: "40px",
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
            <Box sx={{ width: "100%", padding: "20px", marginTop: "15px" }}>
                <Typography sx={{ width: "100%" }}>Tags</Typography>
            </Box>
            <Box sx={{ width: "100%", padding: "20px", marginTop: "15px" }}>
                <Typography sx={{ width: "100%" }}>Commitment Level</Typography>
            </Box>
            <Box sx={{ width: "100%", padding: "20px", marginTop: "15px" }}>
                <Typography sx={{ width: "100%" }}>Meeting Days</Typography>
            </Box>
        </Box>
    );
};

export default SearchFilter;
