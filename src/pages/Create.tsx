import { useContext, useState } from "react";
import UserContext from "../comps/context/UserContext";

import { useNavigate } from "react-router-dom";
import MultiPageForm from "../comps/ui/forms/MultiPageForm";
import FormPage from "../comps/ui/forms/FormPage";
import FormTextField from "../comps/ui/forms/FormTextField";
import FormDropSelect from "../comps/ui/forms/FormDropSelect";
import FormCheckSelect from "../comps/ui/forms/FormCheckSelect";

const emptyForm = {
  name: "",
  url: "",
  picture: null,
  mission: "",
  purpose: "",
  benefit: "",
  appointment_procedures: "",
  uniqueness: "",
  meeting_schedule: "",
  meeting_days: [],
  keywords: [],
  commitment_level: "",
  join_instructions: ""
}

const Create = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);

  const onSubmit = async () => {

  }
  
  return (
    <MultiPageForm
      title="Create New Organization" 
      value={formData} 
      onFormChange={setFormData}
      onSubmit={onSubmit}
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
