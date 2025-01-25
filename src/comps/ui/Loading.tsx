import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const Loading = ({ fullscreen = false }: { fullscreen?: boolean }) => {
    return (
        <Box
            sx={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                position: "fixed",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <CircularProgress />
        </Box>
    );
};

export default Loading;
