import { supabase } from "../../supabaseClient";
import { PUBLIC_URL } from "../../constants";
import "./UnauthenticatedButtons.css";

const LoginButton = () => {
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
            className="button"
        >
            <img
                src={`${PUBLIC_URL}/Google.svg`}
                alt="Google Icon"
                className="google-icon"
            />
            Sign in with Google
        </button>
    );
};

export default LoginButton;