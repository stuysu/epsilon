import { CSSProperties, useContext, useEffect, useState } from "react";
import UserContext from "../comps/context/UserContext";

import { Typography, useMediaQuery } from "@mui/material";
import MultiPageForm from "../comps/ui/forms/MultiPageForm";
import FormPage from "../comps/ui/forms/FormPage";
import FormTextField from "../comps/ui/forms/FormTextField";
import FormDropSelect from "../comps/ui/forms/FormDropSelect";
import FormCheckSelect from "../comps/ui/forms/FormCheckSelect";

import { supabase } from "../supabaseClient";
import FormUpload from "../comps/ui/forms/FormUpload";
import { useSnackbar } from "notistack";
import FormSection from "../comps/ui/forms/FormSection";
import FormChipText from "../comps/ui/forms/FormChipText";
import FormTagSelect from "../comps/ui/forms/FormTagSelect";
import FormCheckbox from "../comps/ui/forms/FormCheckbox";

import OrgRequirements from "../utils/OrgRequirements";

import { PUBLIC_URL } from "../constants";

type FormType = {
    name: string;
    url: string;
    socials: string;
    picture?: File;
    mission: string;
    purpose: string;
    benefit: string;
    appointment_procedures: string;
    uniqueness: string;
    meeting_schedule: string;
    meeting_days: string[];
    keywords: string[];
    tags: string[];
    commitment_level: string;
    join_instructions: string;
    returning: boolean;
    returning_info: string;
};

const emptyForm: FormType = {
    name: "",
    url: "",
    socials: "",
    picture: undefined,
    mission: "",
    purpose: "",
    benefit: "",
    appointment_procedures: "",
    uniqueness: "",
    meeting_schedule: "",
    meeting_days: [],
    keywords: [],
    tags: [],
    commitment_level: "",
    join_instructions: "",
    returning: false,
    returning_info: "",
};

const multilineStyle: CSSProperties = {
    width: "100%",
    display: "flex",
    marginTop: "20px",
};

const Create = () => {
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();

    const [formData, setFormData] = useState<FormType>(emptyForm);
    const isMobile = useMediaQuery("(max-width: 620px)");
    const checkFormFields = () => {
    const fields = ["name", "url", "mission", "purpose", "benefit", "keywords", "tags", "appointment_procedures"];
        return fields.some(field => {
            const value = formData[field as keyof FormType];
            return (typeof value === "string" && value.trim() !== "") || (Array.isArray(value) && value.length > 0);
        });
    };

useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (checkFormFields()) {
            event.preventDefault();
            event.returnValue = ''; // This is required for Chrome to show the prompt
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
}, [formData]);


    const createActivity = async () => {
        let body = {
            name: formData.name,
            url: formData.url.toLowerCase(),
            socials: formData.socials,
            // picture: null, // update after creating initial org
            mission: formData.mission,
            purpose: formData.purpose,
            benefit: formData.benefit,
            keywords: formData.keywords.join(",").toLowerCase(),
            tags: formData.tags,
            appointment_procedures: formData.appointment_procedures,
            uniqueness: formData.uniqueness,
            meeting_schedule: formData.meeting_schedule,
            meeting_days: formData.meeting_days,
            commitment_level: formData.commitment_level,
            join_instructions: formData.join_instructions,
            is_returning: formData.returning,
            returning_info: formData.returning_info,
        };

        let { data: orgCreateData, error: orgCreateError } =
            await supabase.functions.invoke("create-organization", { body });

        if (orgCreateError || !orgCreateData) {
            return enqueueSnackbar(
                "Error creating organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        let orgId = orgCreateData.id;

        /* Create picture if organization is successfully created */
        /* convert picture to url */
        if (formData.picture) {
            let filePath = `org-pictures/${orgId}/${Date.now()}-${formData.url}-profile${formData.picture.name.split(".").pop()}`;
            let { data: storageData, error: storageError } =
                await supabase.storage
                    .from("public-files")
                    .upload(filePath, formData.picture);

            if (storageError || !storageData) {
                /* attempt to delete organization */
                await supabase.from("organizations").delete().eq("id", orgId);
                return enqueueSnackbar(
                    "Error uploading image to storage. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            let { data: urlData } = await supabase.storage
                .from("public-files")
                .getPublicUrl(filePath);

            if (!urlData) {
                /* attempt to delete organization */
                await supabase.from("organizations").delete().eq("id", orgId);

                return enqueueSnackbar(
                    "Failed to retrieve image after upload. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            let { error: updateUrlError } = await supabase
                .from("organizations")
                .update({ picture: urlData.publicUrl })
                .eq("id", orgId);

            if (updateUrlError) {
                /* attempt to delete organization */
                await supabase.from("organizations").delete().eq("id", orgId);
                return enqueueSnackbar(
                    "Error uploading image to organization. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }
        }

        enqueueSnackbar("Organization created!", { variant: "success" });
        /* redirect after creation (with refresh) */
        window.location.href = `${PUBLIC_URL}/${formData.url}`;
    };

    return (
        <MultiPageForm
            title="Create New Organization"
            value={formData}
            onFormChange={setFormData}
            onSubmit={createActivity}
            submitText="Create Activity"
            sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
            }}
        >
            <FormPage title="Before you start">
                <Typography variant="body1">
                    Before you begin the chartering process, make sure to read
                    through the Clubs & Pubs Rules, which all Activities must
                    follow.
                    <br />
                    <br />
                    Once you’re confident that your Activity abides by all the
                    regulations, log in to your StuyActivities account (You've
                    already done that!) and fill out the Chartering form below.
                    Keep in mind that your charter will be public, so do your
                    best to provide helpful, substantive responses to the
                    questions, and avoid including confusing, inappropriate, or
                    incorrect information. <br />
                    <br />
                    Once you’ve submitted your club’s charter, please allow up
                    to two weeks for SU Clubs & Pubs Administrators to review
                    your charter. Unless there are any issues with your charter
                    (i.e. lack of compliance with the rules or unclear
                    submissions) the SU Admins will approve it. Once your
                    activity is approved, it will appear in the StuyActivities
                    Catalog, and you can begin adding members and scheduling
                    meetings. If you have any questions or concerns regarding
                    the chartering process, please reach out to us at
                    clubpub@stuysu.org. Happy chartering!
                </Typography>
            </FormPage>
            <FormPage title="Basic Info">
                <FormSection
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexWrap: isMobile ? "wrap" : "nowrap",
                    }}
                >
                    <FormTextField
                        label="Name"
                        field="name"
                        required={OrgRequirements.name.required}
                        requirements={OrgRequirements.name.requirements}
                        sx={{ width: isMobile ? "100%" : "50%" }}
                    />
                    <FormTextField
                        label="Url"
                        field="url"
                        description={
                            "https://site.com/<this is the part you are entering>\nExample: https://site.com/suit"
                        }
                        required={OrgRequirements.url.required}
                        requirements={OrgRequirements.url.requirements}
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
                        marginTop: "20px",
                        display: "flex",
                        flexWrap: isMobile ? "wrap" : "nowrap",
                    }}
                >
                    <FormDropSelect
                        label="Commitment Level"
                        field="commitment_level"
                        description={
                            "None: Any amount\nLow: <= 3 meetings a month\nMedium: 4-8 meetings a month\nHigh: 9+ Meetings a month"
                        }
                        required={OrgRequirements.commitment_level.required}
                        selections={[
                            {
                                id: "NONE",
                                display: "None",
                            },
                            {
                                id: "LOW",
                                display: "Low",
                            },
                            {
                                id: "MEDIUM",
                                display: "Medium",
                            },
                            {
                                id: "HIGH",
                                display: "High",
                            },
                        ]}
                        sx={{ width: "100%" }}
                    />
                    <FormTagSelect
                        field="tags"
                        label="Choose Tags"
                        tags={[
                            "Arts & Crafts",
                            "Academic & Professional",
                            "Club Sports & Recreational Games",
                            "Community Service & Volunteering",
                            "Cultural & Religious",
                            "Music",
                            "Public Speaking",
                            "STEM",
                            "Student Support & Government",
                            "Hobby & Special Interest",
                            "Publication",
                        ]}
                        description="Select up to 3 tags that best represent your activity"
                        required={OrgRequirements.tags.required}
                        requirements={OrgRequirements.tags.requirements}
                        sx={{
                            width: "100%",
                            marginLeft: isMobile ? "" : "20px",
                            marginTop: isMobile ? "20px" : "",
                        }}
                    />
                </FormSection>
                <FormSection sx={{ width: "100%", marginTop: "20px" }}>
                    <FormChipText
                        field="keywords"
                        label="Keywords"
                        required={OrgRequirements.keywords.required}
                        requirements={OrgRequirements.keywords.requirements}
                        description={`You are allowed up to 3 keywords that describe your activity. These will not be publicly visible but will help your activity show up in search results. Examples of keywords include alternate names or acronyms, such as 'SU' for the Student Union. Create a keyword using <ENTER> or <,>. PLEASE NOTE: You cannot paste a list of keywords, you must type them manually.`}
                    />
                </FormSection>
                <FormSection sx={{ width: "100%", marginTop: "20px" }}>
                    <FormTextField
                        label="Socials (optional)"
                        field="socials"
                        sx={{ width: "100%" }}
                        required={OrgRequirements.socials.required}
                        requirements={OrgRequirements.socials.requirements}
                    />
                </FormSection>
                <FormUpload
                    field="picture"
                    requirements={OrgRequirements.picture.requirements}
                    required={OrgRequirements.picture.required}
                    preview
                    sx={{ marginTop: "20px" }}
                />
            </FormPage>

            <FormPage title="Charter Information">
                <FormTextField
                    label="Mission"
                    field="mission"
                    multiline
                    requirements={OrgRequirements.mission.requirements}
                    required={OrgRequirements.mission.required}
                    sx={multilineStyle}
                    rows={4}
                    description="A quick blurb of what this organization is all about"
                />
                <FormTextField
                    label="Purpose"
                    field="purpose"
                    multiline
                    requirements={OrgRequirements.purpose.requirements}
                    required={OrgRequirements.purpose.required}
                    sx={multilineStyle}
                    rows={4}
                    description="This will serve as the official description of the club. Please include a brief statement about what is expected of general members involved in the club."
                />
                <FormTextField
                    label="Benefit"
                    field="benefit"
                    multiline
                    requirements={OrgRequirements.benefit.requirements}
                    required={OrgRequirements.benefit.required}
                    sx={multilineStyle}
                    rows={4}
                    description="How will this activity benefit the Stuyvesant community?"
                />
                <FormTextField
                    label="Appointment Procedures"
                    field="appointment_procedures"
                    multiline
                    requirements={
                        OrgRequirements.appointment_procedures.requirements
                    }
                    required={OrgRequirements.appointment_procedures.required}
                    sx={multilineStyle}
                    rows={4}
                    description="What are the leadership positions and how are they appointed? Are there any specific protocols members are expected to follow? What is the policy for transfer of leadership between school years? How will leaders be removed if necessary?"
                />
                <FormTextField
                    label="Uniqueness"
                    field="uniqueness"
                    multiline
                    requirements={OrgRequirements.uniqueness.requirements}
                    required={OrgRequirements.uniqueness.required}
                    sx={multilineStyle}
                    rows={4}
                    description="What makes your organization unique?"
                />
                <FormTextField
                    label="Meeting Schedule"
                    field="meeting_schedule"
                    requirements={OrgRequirements.meeting_schedule.requirements}
                    required={OrgRequirements.meeting_schedule.required}
                    sx={multilineStyle}
                    rows={4}
                    description={`Something like "Our meeting schedule varies throughout the year, but we meet at least once a month and up to 3 times in the Spring."`}
                />
                <FormSection sx={{ marginTop: "20px" }}>
                    <FormCheckSelect
                        label="Meeting Days"
                        field="meeting_days"
                        selections={[
                            { id: "MONDAY", display: "Monday" },
                            { id: "TUESDAY", display: "Tuesday" },
                            { id: "WEDNESDAY", display: "Wednesday" },
                            { id: "THURSDAY", display: "Thursday" },
                            { id: "FRIDAY", display: "Friday" },
                        ]}
                        required={OrgRequirements.meeting_days.required}
                    />
                </FormSection>
                <FormSection sx={{ marginTop: "20px", width: "100%" }}>
                    <FormCheckbox
                        field="returning"
                        label="Returning?"
                        description="Check this box if your club was chartered last year."
                    />
                    {formData.returning && (
                        <FormTextField
                            label="Returning Info"
                            field="returning_info"
                            requirements={
                                OrgRequirements.returning_info.requirements
                            }
                            required={OrgRequirements.returning_info.required}
                            sx={multilineStyle}
                            rows={4}
                            description={
                                "Give us an idea of the things your club did last year!"
                            }
                        />
                    )}
                </FormSection>
            </FormPage>
        </MultiPageForm>
    );
};

export default Create;
