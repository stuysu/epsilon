import { CSSProperties, useContext, useEffect, useState } from "react";

import { Box, Typography, useMediaQuery } from "@mui/material";
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

import LoginGate from "../comps/ui/LoginGate";
import UserContext from "../comps/context/UserContext";

type FormType = {
    name: string;
    url: string;
    socials: string;
    picture?: File;
    mission: string;
    purpose: string;
    goals: string;
    appointment_procedures: string;
    uniqueness: string;
    meeting_description: string;
    meeting_schedule: string;
    meeting_days: string[];
    keywords: string[];
    tags: string[];
    commitment_level: string;
    join_instructions: string;
    returning: boolean;
    returning_info: string;
    fair: boolean;
    faculty_email: string;
};

const emptyForm: FormType = {
    name: "",
    url: "",
    socials: "",
    picture: undefined,
    mission: "",
    purpose: "",
    goals: "",
    appointment_procedures: "",
    uniqueness: "",
    meeting_description: "",
    meeting_schedule: "",
    meeting_days: [],
    keywords: [],
    tags: [],
    commitment_level: "",
    join_instructions: "",
    returning: false,
    returning_info: "",
    fair: false,
    faculty_email: "",
};

const multilineStyle: CSSProperties = {
    width: "100%",
    display: "flex",
    marginTop: "20px",
};

const Create = () => {
    const [submitting, setSubmitting] = useState<boolean>(false);

    const user: UserContextType = useContext(UserContext);
    const [eligible, setEligible] = useState<boolean>(true);

    const { enqueueSnackbar } = useSnackbar();

    const [formData, setFormData] = useState<FormType>(emptyForm);
    const isMobile = useMediaQuery("(max-width: 640px)");

    const [urlError, setUrlError] = useState<string>("");
    const [checkingUrl, setCheckingUrl] = useState<boolean>(false);
    const urlPattern = /^[a-zA-Z0-9_-]+$/;

    const validateUrl = async (url: string) => {
        if (
            OrgRequirements.url.requirements &&
            (url.length < OrgRequirements.url.requirements.minChar ||
                url.length > OrgRequirements.url.requirements.maxChar)
        ) {
            setUrlError(
                `URL ending must be between ${OrgRequirements.url.requirements.minChar} and ${OrgRequirements.url.requirements.maxChar} characters long`,
            );
            return;
        }
        if (!urlPattern.test(url)) {
            setUrlError(
                "URL can only contain letters, numbers, dashes, and underscores.",
            );
            return;
        }
        setUrlError("");
        setCheckingUrl(true);
        const { data, error } = await supabase
            .from("organizations")
            .select("id")
            .eq("url", url.toLowerCase());
        setCheckingUrl(false);
        if (error) {
            setUrlError("Error checking URL.");
            return;
        }
        if (data && data.length > 0) {
            setUrlError("This URL is already in use.");
        } else {
            setUrlError("");
        }
    };

    const checkFormFields = () => {
        const fields = [
            "name",
            "url",
            "mission",
            "purpose",
            "goals",
            "meeting_description",
            "meeting_schedule",
            "keywords",
            "tags",
            "appointment_procedures",
            "faculty_email",
        ];
        if (formData.returning && !formData.returning_info) return false;

        return fields.some((field) => {
            const value = formData[field as keyof FormType];
            if (typeof value === "string") {
                return value.trim() !== "";
            }
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return false;
        });
    };

    useEffect(() => {
        if (!eligible) return;
        const fetchPendingCharters = async () => {
            const owned = await supabase
                .from("memberships")
                .select(
                    `
                    user_id,
                    role,
		            organization_id,
                    organizations!inner(id)
                `,
                )
                .eq("user_id", user.id)
                .eq("role", "CREATOR")
                .eq("organizations.state", "PENDING");
            if ((owned?.data?.length || 0) > 0) setEligible(false);
        };

        fetchPendingCharters();
    }, [user]);

    useEffect(() => {
        if (submitting) {
            window.location.href = `${PUBLIC_URL}/${formData.url}`;
        }
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (checkFormFields() && !submitting) {
                event.preventDefault();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [formData, submitting]);

    const createActivity = async () => {
        let body = {
            name: formData.name,
            url: formData.url.toLowerCase(),
            socials: formData.socials,
            // picture: null, // update after creating initial org
            mission: formData.mission,
            goals: formData.goals,
            purpose: formData.purpose,
            keywords: formData.keywords.join(",").toLowerCase(),
            tags: formData.tags,
            appointment_procedures: formData.appointment_procedures,
            uniqueness: formData.uniqueness,
            meeting_description: formData.meeting_description,
            meeting_schedule: formData.meeting_schedule,
            meeting_days: formData.meeting_days,
            commitment_level: formData.commitment_level,
            join_instructions: formData.join_instructions,
            is_returning: formData.returning,
            returning_info: formData.returning_info,
            fair: formData.fair,
            faculty_email: formData.faculty_email,
        };

        let { data: orgCreateData, error: orgCreateError } =
            await supabase.functions.invoke("create-organization", { body });

        if (orgCreateError || !orgCreateData) {
            const error = await orgCreateError?.context.text();
            let message = "Contact it@stuysu.org for support.";
            if (error) {
                message = error;
            }
            return enqueueSnackbar("Error creating organization. " + message, {
                variant: "error",
            });
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
        setSubmitting(true);
    };
    if (!eligible)
        return (
            <Box
                sx={{
                    width: "100%",
                }}
            >
                <Typography align="center" variant="h3">
                    You may not submit a second charter if you already have one
                    pending.
                </Typography>
            </Box>
        );
    return (
        <LoginGate page={"charter an activity"}>
            <MultiPageForm
                title=""
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
                <FormPage title="Before You Start">
                    <Typography variant="body1">
                        Before you begin the chartering process, make sure to
                        read through the Clubs & Pubs Rules, which all
                        Activities must follow.
                        <br />
                        <br />
                        Once you’re confident that your Activity abides by all
                        the regulations, log in to your Epsilon account (You've
                        already done that!) and fill out the Chartering form
                        below. Keep in mind that your charter will be public, so
                        do your best to provide helpful, substantive responses
                        to the questions, and avoid including confusing,
                        inappropriate, or incorrect information.
                        <br />
                        <br />
                        Once you’ve submitted your club’s charter, please allow
                        up to two weeks for SU Clubs & Pubs Administrators to
                        review your charter. Unless there are any issues with
                        your charter (i.e. lack of compliance with the rules or
                        unclear submissions) the SU Admins will approve it. Once
                        your activity is approved, it will appear in the Epsilon
                        StuyActivities Catalog, and you can begin adding members
                        and scheduling meetings. If you have any questions or
                        concerns regarding the chartering process, please reach
                        out to us at clubpub@stuysu.org. Happy chartering!
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
                            label="Club Name"
                            field="name"
                            required={OrgRequirements.name.required}
                            requirements={OrgRequirements.name.requirements}
                            sx={{ width: isMobile ? "100%" : "50%" }}
                        />
                        <FormTextField
                            label="Url"
                            field="url"
                            description={
                                "https://epsilon.stuysu.org/<this is the part you are entering>\nExample: https://epsilon.stuysu.org/suit"
                            }
                            required={OrgRequirements.url.required}
                            requirements={OrgRequirements.url.requirements}
                            sx={{
                                marginLeft: isMobile ? "" : "20px",
                                marginTop: isMobile ? "20px" : "",
                                width: isMobile ? "100%" : "50%",
                            }}
                            error={!!urlError}
                            helperText={
                                urlError
                                    ? urlError
                                    : checkingUrl
                                      ? "Checking URL..."
                                      : formData.url && !urlError
                                        ? "URL is valid."
                                        : undefined
                            }
                            onBlur={async (e: any) => {
                                const url = e.target.value;
                                if (url) await validateUrl(url);
                            }}
                            onChange={(e: any) => {
                                const url = e.target.value;
                                if (url === "" || urlPattern.test(url)) {
                                    setFormData((prev) => ({ ...prev, url }));
                                    setUrlError("");
                                } else {
                                    setUrlError(
                                        "URL can only contain letters, numbers, dashes, and underscores.",
                                    );
                                }
                            }}
                            inputProps={{ pattern: urlPattern.source }}
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
                                "None: Any amount\nLow: 0–3 meetings a month\nMedium: 4–8 meetings a month\nHigh: 9+ Meetings a month"
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
                    <FormSection sx={{ width: "100%", marginTop: "20px" }}>
                        <FormTextField
                            label="Faculty Advisor Email (optional)"
                            field="faculty_email"
                            sx={{ width: "100%" }}
                            required={OrgRequirements.faculty_email.required}
                            requirements={
                                OrgRequirements.faculty_email.requirements
                            }
                            description="If a faculty member has agreed to be your club advisor, please input their preferred email here."
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
                        label="Origin Story"
                        field="mission"
                        multiline
                        requirements={OrgRequirements.mission.requirements}
                        required={OrgRequirements.mission.required}
                        sx={multilineStyle}
                        rows={4}
                        description="Tell us, in simple words, why you want to create this club OR what motivates you to lead it this year. This information won’t be displayed on Epsilon, we will use it to gauge your passion and reasoning in forming this club."
                    />
                    <FormTextField
                        label="Goals"
                        field="goals"
                        multiline
                        requirements={OrgRequirements.goals.requirements}
                        required={OrgRequirements.goals.required}
                        sx={multilineStyle}
                        rows={4}
                        description="What are your specific, realistic, and timely goals for this club to accomplish? This is for us to better support you throughout the year and can be edited as needed."
                    />
                    <FormTextField
                        label="Club Description"
                        field="purpose"
                        multiline
                        requirements={OrgRequirements.purpose.requirements}
                        required={OrgRequirements.purpose.required}
                        sx={multilineStyle}
                        rows={4}
                        description="This is what will be displayed on Epsilon: What do you want the Stuyvesant Community to know about your club?"
                    />
                    <FormTextField
                        label="Meeting Description"
                        field="meeting_description"
                        multiline
                        requirements={
                            OrgRequirements.meeting_description.requirements
                        }
                        required={OrgRequirements.meeting_description.required}
                        sx={multilineStyle}
                        rows={4}
                        description="What would a typical meeting look like? Describe with as much detail as possible how a meeting will be structured, and what activities will be specific to your club."
                    />
                    <FormTextField
                        label="Meeting Schedule"
                        field="meeting_schedule"
                        multiline
                        requirements={
                            OrgRequirements.meeting_schedule.requirements
                        }
                        required={OrgRequirements.meeting_schedule.required}
                        sx={multilineStyle}
                        rows={4}
                        description="What is your activity’s meeting schedule? Are there periods of time where your club will pause meetings?"
                    />
                    <FormSection
                        sx={{ marginTop: "20px", marginBottom: "20px" }}
                    >
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
                    <FormTextField
                        label="Appointment Procedures"
                        field="appointment_procedures"
                        multiline
                        requirements={
                            OrgRequirements.appointment_procedures.requirements
                        }
                        required={
                            OrgRequirements.appointment_procedures.required
                        }
                        sx={multilineStyle}
                        rows={4}
                        description="How many leaders will your club have? What will be their roles?"
                    />
                    <FormTextField
                        label="Uniqueness"
                        field="uniqueness"
                        multiline
                        requirements={OrgRequirements.uniqueness.requirements}
                        required={OrgRequirements.uniqueness.required}
                        sx={multilineStyle}
                        rows={4}
                        description="Why are you chartering this club and not joining another one?"
                    />
                    <FormSection sx={{ marginTop: "20px", width: "100%" }}>
                        <FormCheckbox
                            field="returning"
                            label="Returning?"
                            description="Check this box if your club was chartered last year. You MUST answer the following question if this is the case."
                        />
                        {formData.returning && (
                            <FormTextField
                                label="Returning Info"
                                field="returning_info"
                                multiline
                                requirements={
                                    OrgRequirements.returning_info.requirements
                                }
                                required={
                                    OrgRequirements.returning_info.required
                                }
                                sx={multilineStyle}
                                rows={4}
                                description={
                                    "Why should we allow your club to be rechartered? In what ways have you achieved the mission that your club stated in its charter last year?"
                                }
                            />
                        )}
                    </FormSection>
                    <FormSection sx={{ marginTop: "20px", width: "100%" }}>
                        <FormCheckbox
                            field="fair"
                            label="Do you want to represent your club at the Club Pub Fair?"
                            description="Check this box if so."
                        />
                    </FormSection>
                    <Typography sx={{ marginTop: "1rem" }}>
                        If you have additional information to share about your
                        club, please use the "Messages" feature in your club
                        admin panel.
                    </Typography>
                </FormPage>
            </MultiPageForm>
        </LoginGate>
    );
};

export default Create;
