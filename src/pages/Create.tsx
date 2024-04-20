import { useContext, useState } from "react";
import UserContext from "../comps/context/UserContext";

import { useNavigate } from "react-router-dom";
import MultiPageForm from "../comps/ui/forms/MultiPageForm";
import FormPage from "../comps/ui/forms/FormPage";
import FormTextField from "../comps/ui/forms/FormTextField";
import FormDropSelect from "../comps/ui/forms/FormDropSelect";
import FormCheckSelect from "../comps/ui/forms/FormCheckSelect";

import { supabase } from "../supabaseClient";

type FormType = {
  name: string,
  url: string,
  picture?: File,
  mission: string,
  purpose: string,
  benefit: string,
  appointment_procedures: string,
  uniqueness: string,
  meeting_schedule: string,
  meeting_days: string,
  keywords: string,
  commitment_level: string,
  join_instructions: string
}

const emptyForm : FormType = {
  name: "",
  url: "",
  picture: undefined,
  mission: "",
  purpose: "",
  benefit: "",
  appointment_procedures: "",
  uniqueness: "",
  meeting_schedule: "",
  meeting_days: "",
  keywords: "",
  commitment_level: "",
  join_instructions: ""
}

const Create = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormType>(emptyForm);

  const createActivity = async () => {
    let payload = {
      creator_id: user.id,
      name: formData.name,
      url: formData.url,
      picture: null, // update after creating initial org
      mission: formData.mission,
      purpose: formData.purpose,
      benefit: formData.benefit,
      appointment_procedures: formData.appointment_procedures,
      uniqueness: formData.uniqueness,
      meeting_schedule: formData.meeting_schedule,
      meeting_days: formData.meeting_days,
      keywords: formData.keywords,
      commitment_level: formData.commitment_level,
      join_instructions: formData.join_instructions,
    }

    let { data: orgCreateData, error: orgCreateError } = await supabase
      .from("organizations")
      .insert(payload)
      .select(`
        id
      `);

    if (orgCreateError || !orgCreateData) {
      return user.setMessage(
        "Error creating organization. Contact it@stuysu.org for support.",
      );
    }

    let orgId = orgCreateData[0].id;

    /* Create picture if organization is successfully created */
    
    /* convert picture to url */
    if (formData.picture) {
      let filePath = `org-pictures/${orgId}/${Date.now()}-${formData.picture.name}`
      let { data: storageData, error: storageError } = await supabase
        .storage
        .from('public-files')
        .upload(filePath, formData.picture);
      
      if (storageError || !storageData) {
        return user.setMessage(
          "Error uploading image to storage. Contact it@stuysu.org for support."
        )
      }

      let { data: urlData } = await supabase
      .storage
      .from('public-files')
      .getPublicUrl(filePath)

      if (!urlData) {
        /* attempt to delete organization */
        await supabase
          .from('organizations')
          .delete()
          .eq('id', orgId)

        return user.setMessage("Failed to retrieve image after upload. Contact it@stuysu.org for support.");
      }

      
      let { error: updateUrlError } = await supabase
          .from("organizations")
          .update({ picture: urlData.publicUrl })
          .eq('id', orgId)

      if (updateUrlError) {
        /* attempt to delete organization */
        await supabase
          .from('organizations')
          .delete()
          .eq('id', orgId)
        return user.setMessage("Error uploading image to organization. Contact it@stuysu.org for support.")
      }
    }
    
    user.setMessage("Organization created!");
    /* redirect after creation */
    navigate(`/${formData.url}`)
  };
  
  return (
    <MultiPageForm
      title="Create New Organization" 
      value={formData} 
      onFormChange={setFormData}
      onSubmit={createActivity}
      submitText="Create Activity"
      width="100%"
      height="600px"
    >
      <FormPage title="Basic Info">
        <FormTextField
          field="name"
          label="Name"
        />
        <FormDropSelect 
          field="commitment_level"
          selections={[ {id: "LOW", display: "Low"}, {id: "HIGH", display: "High"}]}
          label="Commitment Level"
        />
        <FormCheckSelect 
          field="meeting_days"
          selections={[ { id: "MONDAY", display: "Monday"}, { id: "TUESDAY", display: "Tuesday"}]}
          label="Select meeting days"
          formatter={(choices) => choices.join(",")}
        />
      </FormPage>
    </MultiPageForm>
  )
};

export default Create;
