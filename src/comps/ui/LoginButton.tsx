import { Auth } from "@supabase/auth-ui-react";
import { PUBLIC_URL } from "../../constants";
import { supabase } from "../../supabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Box } from "@mui/material";

const LoginButton = () => (
    <Box
        sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}
    >
        <Auth
            redirectTo={PUBLIC_URL}
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google"]}
            onlyThirdPartyProviders
        />
    </Box>
);

export default LoginButton;
