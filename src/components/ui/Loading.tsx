import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const Loading = () => {
    return (
        <Box
            sx={{
                width: "100%",
                height: "85vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                pointerEvents: "none",
            }}
        >
            <CircularProgress />
        </Box>
    );
};

export default Loading;
