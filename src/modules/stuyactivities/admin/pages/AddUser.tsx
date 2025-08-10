import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { enqueueSnackbar } from "notistack";
import FormPage from "../../../../components/ui/forms/FormPage";
import MultiPageForm from "../../../../components/ui/forms/MultiPageForm";
import FormSection from "../../../../components/ui/forms/FormSection";
import { Typography, useMediaQuery } from "@mui/material";
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

    const isMobile = useMediaQuery("(max-width: 640px)");

    const createUser = async () => {
        const { error: userCreateError } = await supabase.functions.invoke(
            "create-user",
            { body: userData },
        );

        if (userCreateError) {
            console.error("Supabase function error:", userCreateError);
            const message =
                userCreateError.message || "Contact it@stuysu.org for support.";
            return enqueueSnackbar(message, { variant: "error" });
        }
        enqueueSnackbar("User created successfully", { variant: "success" });
    };

    return (
        <div className={"h-screen"}>
            <Typography variant="h1" width="100%" align="center">
                Add New User
            </Typography>
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
                <FormPage title=" ">
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
                                width: isMobile ? "50%" : "25%",
                            }}
                        />
                        <FormSection
                            sx={{ marginTop: "30px", marginLeft: "40px" }}
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
