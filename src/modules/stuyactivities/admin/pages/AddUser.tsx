import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { enqueueSnackbar } from "notistack";
import FormPage from "../../../../components/ui/forms/FormPage";
import MultiPageForm from "../../../../components/ui/forms/MultiPageForm";
import FormSection from "../../../../components/ui/forms/FormSection";
import useMediaQuery from "../../../../utils/useMediaQuery";
import FormTextField from "../../../../components/ui/forms/FormTextField";
import OrgRequirements from "../../../../utils/OrgRequirements";
import FormCheckbox from "../../../../components/ui/forms/FormCheckbox";

type User = {
    first_name: string;
    last_name: string;
    email: string;
    grad_year: number | null;
    is_faculty: boolean;
};

const emptyUser: User = {
    first_name: "",
    last_name: "",
    email: "",
    grad_year: null,
    is_faculty: false,
};

const AddUser = () => {
    const [userData, setUserData] = useState<User>(emptyUser);

    const isMobile = useMediaQuery("not all and (min-width: 640px)");

    const createUser = async () => {
        const { error: userCreateError } = await supabase.functions.invoke(
            "create-user",
            { body: userData },
        );

        if (userCreateError) {
            console.error("Supabase function error:", userCreateError);
            // the function explains what went wrong (like "User already exists") in its response
            let message = "Contact it@stuysu.org for support.";
            try {
                const body = await userCreateError.context?.json();
                if (body?.error) message = body.error;
            } catch {
                // no readable response, so keep the generic message
            }
            return enqueueSnackbar(message, { variant: "error" });
        }
        enqueueSnackbar("User created successfully", { variant: "success" });
    };

    return (
        <div className={"w-full p-4 sm:p-12"}>
            <h1>Add New User</h1>
            <MultiPageForm
                title=""
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
                <FormPage title="User Information">
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
                            required
                            requirements={{ minChar: 1, maxChar: 60 }}
                            sx={{ width: isMobile ? "100%" : "25%" }}
                        />
                        <FormTextField
                            label="Last Name"
                            field="last_name"
                            required
                            requirements={{ minChar: 1, maxChar: 60 }}
                            sx={{
                                marginLeft: isMobile ? "" : "20px",
                                marginTop: isMobile ? "20px" : "",
                                width: isMobile ? "100%" : "25%",
                            }}
                        />
                        <FormTextField
                            label="Email"
                            field="email"
                            required={true}
                            requirements={
                                OrgRequirements.faculty_email.requirements
                            }
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
                            requirements={
                                OrgRequirements.grad_year.requirements
                            }
                            sx={{
                                marginTop: isMobile ? "20px" : "40px",
                                width: isMobile ? "100%" : "25%",
                            }}
                        />
                        <FormSection
                            sx={{
                                marginTop: "30px",
                                marginLeft: isMobile ? "" : "40px",
                            }}
                        >
                            <FormCheckbox
                                field="is_faculty"
                                label="Faculty?"
                                description="Check this box if this user is a faculty."
                            />
                        </FormSection>
                    </FormSection>
                </FormPage>
            </MultiPageForm>
        </div>
    );
};

export default AddUser;
