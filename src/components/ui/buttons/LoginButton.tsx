import { useLocation } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import "./UnauthenticatedButtons.css";
import { SUPPORT_EMAIL } from "../../../config/constants";

type LoginButtonProps = {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
};

const LoginButton = ({ onMouseEnter, onMouseLeave }: LoginButtonProps) => {
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo:
                    window.location.origin +
                    location.pathname +
                    location.search,
            },
        });
        if (error) {
            enqueueSnackbar(
                `Couldn't start signing in with Google. Try again, or contact ${SUPPORT_EMAIL} if it keeps failing.`,
                { variant: "error" },
            );
        }
    };

    return (
        <button
            onClick={signInWithGoogle}
            className="button shadow-control"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            title="You must sign in with a stuy.edu address"
        >
            <i className="absolute bx bxl-google left-4 bx-sm" />
            <span>Sign in with Google</span>
        </button>
    );
};

export default LoginButton;
