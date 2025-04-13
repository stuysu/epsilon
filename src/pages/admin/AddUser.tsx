import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { enqueueSnackbar } from "notistack";
import FormPage from "../../comps/ui/forms/FormPage";
import MultiPageForm from "../../comps/ui/forms/MultiPageForm";
import FormSection from "../../comps/ui/forms/FormSection";
import { useMediaQuery } from "@mui/material";
import FormTextField from "../../comps/ui/forms/FormTextField";
import OrgRequirements from "../../utils/OrgRequirements";
import FormCheckbox from "../../comps/ui/forms/FormCheckbox";

type User = {
    first_name: string,
    last_name: string,
    email: string,
    grad_year: number,
    is_faculty: boolean
};

const emptyUser: User = {
    first_name: "",
    last_name: "",
    email: "",
    grad_year: -1,
    is_faculty: false
};

const AddUser = () => {
    const [userData, setUserData] = useState<User>(emptyUser);

    const isMobile = useMediaQuery("(max-width: 620px)");

    const createUser = async () => {
        let user = { ...userData };

        const { data: allUsersData, error: allUsersError } = await supabase
            .from("users")
            .select()
            .eq("email", userData.email);

        if(allUsersError) {
            enqueueSnackbar("Failed to fetch all users", { variant: "error" });
            return;
        }

        if(!allUsersData || allUsersData.length === 0) {
            const { data: userCreateData, error: userCreateError } =
                await supabase.functions.invoke("create-user", { body: user });

            if (userCreateError || !userCreateData) {
                const error = await userCreateError?.context.text();
                let message = "Contact it@stuysu.org for support.";
                if (error) {
                    message = error;
                }
                return enqueueSnackbar("Error creating organization. " + message, {
                    variant: "error",
                });
            }

            enqueueSnackbar("User created successfully", { variant: "success" });
        } else {
            enqueueSnackbar("User already exists", { variant: "warning" });
            return;
        }
    }

    return( 
        <MultiPageForm
            title="Create New User"
            value={userData}
            onFormChange={setUserData}
            onSubmit={createUser}
            submitText="Create User"
            sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
            }}
        >
            <FormPage title="User Info">
                <FormSection
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexWrap: isMobile ? "wrap" : "nowrap",
                        }}
                >
                    <FormTextField
                        label="First Name"
                        field="first_name"
                        required={OrgRequirements.name.required}
                        requirements={OrgRequirements.name.requirements}
                        sx={{ width: isMobile ? "50%" : "25%" }}
                    />
                    <FormTextField
                        label="Last Name"
                        field="last_name"
                        required={OrgRequirements.name.required}
                        requirements={OrgRequirements.name.requirements}
                        sx={{
                            marginLeft: isMobile ? "" : "20px",
                            marginTop: isMobile ? "20px" : "",
                            width: isMobile ? "50%" : "25%",
                        }}
                    />
                    <FormTextField
                        label="Email"
                        field="email"
                        required={true}
                        requirements={OrgRequirements.faculty_email.requirements}
                        sx={{
                            marginLeft: isMobile ? "" : "20px",
                            marginTop: isMobile ? "20px" : "",
                            width: isMobile ? "100%" : "50%",
                        }}
                    />
                </FormSection>
                <FormSection
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexWrap: isMobile ? "wrap" : "nowrap",                            
                        }}
                >
                    <FormTextField
                        label="Grad Year"
                        field="grad_year"
                        required={OrgRequirements.grad_year.required}
                        requirements={OrgRequirements.grad_year.requirements}
                        sx={{
                            marginTop: isMobile ? "20px" : "40px",
                            width: isMobile ? "50%" : "25%",
                        }}
                    />
                    <FormSection sx={{ marginTop: "30px", marginLeft: "40px"}}>
                    <FormCheckbox
                            field="faculty"
                            label="Faculty?"
                            description="Check this box if this user is a faculty."
                    />
                    </FormSection>
                </FormSection>
            </FormPage>
        </MultiPageForm>
    );
};

export default AddUser;
