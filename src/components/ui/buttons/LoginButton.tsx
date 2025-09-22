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
            <svg
                className="absolute fill-typography-1 pointer-events-none"
            >
                <path d="M24.7108 10.2261H12.7899V15.0546H19.6501C19.0116 18.1229 16.3388 19.8859 12.7899 19.8859C8.60534 19.8859 5.23249 16.5895 5.23249 12.4984C5.23249 8.40864 8.60534 5.11225 12.7899 5.11225C14.5923 5.11225 16.2214 5.73767 17.4999 6.76045L21.222 3.12406C18.9544 1.19183 16.0468 -0.000244141 12.7899 -0.000244141C5.69776 -0.000244141 0 5.56697 0 12.4998C0 19.4325 5.69633 24.9998 12.7899 24.9998C19.1848 24.9998 25 20.4539 25 12.4998C25 11.761 24.884 10.9649 24.7108 10.2261Z" />
            </svg>
            <span>Sign in with Google</span>
        </button>
    );
};

export default LoginButton;
