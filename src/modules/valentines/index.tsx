import { Route, Routes } from "react-router-dom";
import Valentines from "./Valentines";
import LoginGate from "../../components/ui/LoginGate";
import Create from "./Create";
import { Box, Divider, Typography } from "@mui/material";

// overkill but leaving room for growth if needed
const ValentinesRouter = () => {
    return (
        <LoginGate>
            <Box
                sx={{
                    marginTop: "2rem",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    paddingBottom: "10vh",
                }}
            >
                <Typography variant="h2">Valentines</Typography>
                <Box
                    sx={{
                        marginTop: "1rem",
                        marginBottom: "2rem",
                        width: "80vw",
                    }}
                >
                    <Divider />
                </Box>
                <Routes>
                    <Route path="/" Component={Valentines} />
                    <Route path="/create" Component={Create} />
                </Routes>
            </Box>
        </LoginGate>
    );
};

export default ValentinesRouter;
