import React, { useContext, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import UserContext from "./UserContext";
import { useSnackbar } from "notistack";
import { ThemeContext } from "./ThemeProvider";

const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { enqueueSnackbar } = useSnackbar();
    const { colorMode } = useContext(ThemeContext);
    const [loading, setLoading] = useState(true);

    const [value, setValue] = React.useState<UserContextType>({
        signed_in: false,
        admin: false,
        id: -1,
        first_name: "",
        last_name: "",
        email: "",
        picture: "",
        grade: -1,
        memberships: [],
        is_faculty: false,
        active: false,
    });

    supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_OUT") {
        } else {
            setValue({
                signed_in: false,
                admin: false,
                id: -1,
                first_name: "",
                last_name: "",
                email: "",
                picture: "",
                grade: -1,
                memberships: [],
                is_faculty: false,
                active: false,
            });
        }
    });

    useEffect(() => {
        const getUser = async () => {
            var authData = await supabase.auth.getSession();

            if (authData.data?.session?.user) {
                // fetch user profile
                const supabaseUser = authData.data.session.user; // user stored in auth.user table
                let { data, error } = await supabase
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
              )
          `,
                    )
                    .eq("email", supabaseUser.email);

                if (error) {
                    enqueueSnackbar(
                        "Error logging in. Contact it@stuysu.org for support.",
                        { variant: "error" },
                    );
                    setLoading(false);
                    return;
                }

                if (!Array.isArray(data) || data?.length === 0) {
                    // user is not in our public.users table. notify
                    enqueueSnackbar(
                        "Unverified account. Please contact it@stuysu.org for support.",
                        { variant: "error" },
                    );
                    setLoading(false);
                    return;
                }

                let grade;
                let d = new Date();

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
                ({ data, error } = await supabase
                    .from("permissions")
                    .select()
                    .eq("user_id", user.id));

                if (error) {
                    enqueueSnackbar(
                        "Error fetching permissions. Contact it@stuysu.org for support.",
                        { variant: "error" },
                    );
                    setLoading(false);
                }
                if (Array.isArray(data) && data?.length > 0) {
                    isAdmin = true;
                }

                if (!user.picture) {
                    /* get google pfp and update */
                    let avatarURL = supabaseUser.user_metadata.avatar_url;
                    user.picture = avatarURL;

                    let { error: profileUpdateError } = await supabase.rpc(
                        "update_profile_picture",
                        { profile_url: avatarURL },
                    );

                    if (profileUpdateError) {
                        enqueueSnackbar(
                            "Unable to save profile picture to server. Please contact it@stuysu.org for support.",
                            { variant: "error" },
                        );
                        setLoading(false);
                    }

                    enqueueSnackbar("Profile Picture Updated!", {
                        variant: "success",
                    });
                }

                /* 
          This shows every time we log in (even if its saved already). Thus, it is commented out.
          enqueueSnackbar("Signed In!", { variant: "success" }) 
        */

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
                });
            }
            setLoading(false);
        };

        getUser();
    }, [enqueueSnackbar]);

    if (loading) {
        return (
            <div
                style={{
                    backgroundColor: colorMode ? "#0c161b" : "#ebf5f2",
                    width: "100vw",
                    height: "100vh",
                }}
            />
        );
    }

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

export default UserProvider;
