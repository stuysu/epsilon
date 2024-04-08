import React, { useEffect } from "react";
import { supabase } from "../../supabaseClient";
import UserContext from "./UserContext";
import { Snackbar } from "@mui/material";

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  let [message, setMessage] = React.useState("");

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
    setMessage: setMessage,
  });

  supabase.auth.onAuthStateChange((event) => {
    if (event !== "SIGNED_OUT") {
    } else {
      setMessage("Signed Out!");
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
        setMessage: setMessage,
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
                                picture,
                                meetings (
                                    title,
                                    description,
                                    start_time,
                                    end_time,
                                    rooms (
                                        name
                                    )
                                )
                            )
                        )
                    `,
          )
          .eq("email", supabaseUser.email);

        if (error) {
          setMessage("Error logging in. Contact it@stuysu.org for support.");
          return;
        }

        if (!Array.isArray(data) || data?.length === 0) {
          // user is not in our public.users table. sign out + notify
          await supabase.auth.signOut();

          setMessage(
            "Unverified account. Please contact it@stuysu.org for support.",
          );
          return;
        }

        let grade;
        let d = new Date();

        if (d.getMonth() < 8) {
          grade = 12 - (data[0].grad_year - d.getFullYear());
        } else {
          grade = 12 - (data[0].grad_year - d.getFullYear() - 1);
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
          memberships: data[0].memberships,
        }; // user in our own user table
        let isAdmin = false;
        /* CHECK PERMISSIONS */
        ({ data, error } = await supabase
          .from("permissions")
          .select()
          .eq("user_id", user.id));

        if (error) {
          setMessage(
            "Error fetching permissions. Contact it@stuysu.org for support.",
          );
        }
        if (Array.isArray(data) && data?.length > 0) {
          isAdmin = true;
        }

        if (!user.picture) {
          /* get google pfp and update */
          let avatarURL = supabaseUser.user_metadata.avatar_url;
          user.picture = avatarURL;

          ({ error } = await supabase
            .from("users")
            .update({ picture: avatarURL })
            .eq("id", user.id));

          if (error) {
            setMessage(
              "Unable to save profile picture to server. Please contact it@stuysu.org for support.",
            );
          }
        }

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
          setMessage: setMessage,
        });
      }
    };

    getUser();
  }, []);

  return (
    <UserContext.Provider value={value}>
      {children}
      <Snackbar
        open={message.length > 0}
        autoHideDuration={3000}
        onClose={() => setMessage("")}
        message={message}
      />
    </UserContext.Provider>
  );
};

export default UserProvider;
