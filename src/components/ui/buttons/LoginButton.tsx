import { supabase } from "../../../lib/supabaseClient";
import { PUBLIC_URL } from "../../../config/constants";
import "./UnauthenticatedButtons.css";

type LoginButtonProps = {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
};

const LoginButton = ({ onMouseEnter, onMouseLeave }: LoginButtonProps) => {
    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: PUBLIC_URL,
            },
        });
        if (error) {
            console.error("Error Signing In with Google", error.message);
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
            <i
                className="absolute bx bxl-google left-4 bx-sm"
            />
            <span>Sign in with Google</span>
        </button>
    );
};

export default LoginButton;
