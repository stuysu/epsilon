import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { supabase } from "../lib/supabaseClient";
import UserContext from "./UserContext";
import { useSnackbar } from "notistack";
import { ThemeContext } from "./ThemeProvider";
import { useLocation } from "react-router-dom";
import UnauthorizedAccount from "../modules/home/UnauthorizedAccount";
import { SUPPORT_EMAIL } from "../config/constants";

const signedOut: UserContextType = {
    signed_in: false,
    admin: false,
    permission: "",
    permissions: [],
    id: -1,
    first_name: "",
    last_name: "",
    email: "",
    picture: "",
    grade: -1,
    memberships: [],
    is_faculty: false,
    active: false,
};

const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { enqueueSnackbar } = useSnackbar();
    const { effectiveMode } = useContext(ThemeContext);
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [unauthorizedEmail, setUnauthorizedEmail] = useState<string>();

    const [value, setValue] = React.useState<UserContextType>(signedOut);

    // the account whose profile is loaded (or loading)
    const loadedEmail = useRef<string | undefined>(undefined);

    const getUser = useCallback(async () => {
        const authData = await supabase.auth.getSession();
        loadedEmail.current = authData.data?.session?.user?.email;

        if (authData.data?.session?.user) {
            // fetch user profile
            const supabaseUser = authData.data.session.user; // user stored in auth.user table
            const { data, error } = await supabase
                .from("users")
                .select(
                    `
              id,
              first_name,
              last_name,
              email,
              grad_year,
              picture,
              is_faculty,
              active,
              memberships (
                  id,
                  role,
                  role_name,
                  active,
                  organizations (
                      id,
                      name,
                      url,
                      picture
                  )
              ),
              permissions (
                permission
              )
          `,
                )
                .eq("email", supabaseUser.email);

            if (error) {
                enqueueSnackbar(
                    `Error logging in. Contact ${SUPPORT_EMAIL} for support.`,
                    { variant: "error" },
                );
                setLoading(false);
                return;
            }

            if (!Array.isArray(data) || data?.length === 0) {
                // user is not in our public.users table
                setUnauthorizedEmail(supabaseUser.email || "");
                setLoading(false);
                return;
            }

            let grade;
            const d = new Date();

            if (!data[0].is_faculty && data[0].grad_year) {
                if (d.getMonth() < 8) {
                    grade = 12 - (data[0].grad_year - d.getFullYear());
                } else {
                    grade = 12 - (data[0].grad_year - d.getFullYear() - 1);
                }
            } else {
                grade = 0;
            }

            /* this probably isn't necessary and could be replaced with better typescript */
            const user: User = {
                first_name: data[0].first_name,
                last_name: data[0].last_name,
                email: data[0].email,
                grade: grade,
                picture: data[0].picture,
                id: data[0].id,
                is_faculty: data[0].is_faculty,
                active: data[0].active,
                memberships: data[0].memberships as Membership[],
            }; // user in our own user table
            let isAdmin = false;
            /* CHECK PERMISSIONS */
            if (
                data &&
                data[0].permissions.some(
                    (p: { permission: string }) => p.permission === "ADMIN",
                )
            ) {
                isAdmin = true;
            }
            // a user can hold several permissions, and ADMIN outranks the rest
            const permission = isAdmin
                ? "ADMIN"
                : data[0].permissions[0]?.permission;

            /* get google pfp and update; password logins have none */
            const avatarURL = supabaseUser.user_metadata.avatar_url;
            if (!user.picture && avatarURL) {
                user.picture = avatarURL;

                const { error: profileUpdateError } = await supabase.rpc(
                    "update_profile_picture",
                    { profile_url: avatarURL },
                );

                if (profileUpdateError) {
                    enqueueSnackbar(
                        `Unable to save profile picture to server. Please contact ${SUPPORT_EMAIL} for support.`,
                        { variant: "error" },
                    );
                    setLoading(false);
                } else {
                    enqueueSnackbar("Profile Picture Updated!", {
                        variant: "success",
                    });
                }
            }

            /*
          This shows every time we log in (even if its saved already). Thus, it is commented out.
          enqueueSnackbar("Signed In!", { variant: "success" })
        */

            setUnauthorizedEmail(undefined);
            setValue({
                signed_in: true,
                admin: isAdmin,
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                picture: user.picture,
                grade: user.grade,
                memberships: user.memberships,
                is_faculty: user.is_faculty,
                active: user.active,
                permission,
                permissions: data[0].permissions.map(
                    (p: { permission: string }) => p.permission,
                ),
            });
        }
        setLoading(false);
    }, [enqueueSnackbar]);

    useEffect(() => {
        // fetches; state is only set once the response arrives
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getUser();
    }, [getUser]);

    // sign-ins and sign-outs in other tabs arrive as auth events or storage changes
    useEffect(() => {
        const sync = async () => {
            const { data } = await supabase.auth.getSession();
            const email = data.session?.user?.email;
            if (email === loadedEmail.current) return;
            loadedEmail.current = email;
            if (email) {
                getUser();
            } else {
                setUnauthorizedEmail(undefined);
                setValue(signedOut);
            }
        };
        const { data } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT") {
                loadedEmail.current = undefined;
                setUnauthorizedEmail(undefined);
                setValue(signedOut);
            } else if (event === "SIGNED_IN") {
                // auth calls inside the callback can deadlock, so defer
                setTimeout(sync, 0);
            }
        });
        const onStorage = (e: StorageEvent) => {
            if (e.key === null || e.key.endsWith("-auth-token")) sync();
        };
        window.addEventListener("storage", onStorage);
        return () => {
            data.subscription.unsubscribe();
            window.removeEventListener("storage", onStorage);
        };
    }, [getUser]);

    // pages call refresh after the user's own memberships change
    const provided = useMemo(
        () => ({ ...value, refresh: getUser }),
        [value, getUser],
    );

    if (loading) {
        return (
            <div
                style={{
                    backgroundColor:
                        effectiveMode === "dark" ? "#0c161b" : "#ebf5f2",
                    height: "100dvh",
                }}
            />
        );
    }

    if (
        unauthorizedEmail !== undefined &&
        location.pathname !== "/activities-support"
    ) {
        return <UnauthorizedAccount email={unauthorizedEmail} />;
    }

    return (
        <UserContext.Provider value={provided}>{children}</UserContext.Provider>
    );
};

export default UserProvider;
