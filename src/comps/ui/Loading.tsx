import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const Loading = ({ fullscreen = false }: { fullscreen?: boolean }) => {
    return (
        <Box
            sx={{
                width: "100%",
                height: fullscreen ? "100vh" : "100%",
                display: "flex",
                position: fullscreen ? "fixed" : "relative",
                textAlign: "center",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <CircularProgress />
        </Box>
    );
};

export default Loading;
