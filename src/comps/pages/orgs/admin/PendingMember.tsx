import { supabase } from "../../../../supabaseClient";
import { Button } from "@mui/material";
import { useSnackbar } from "notistack";

const PendingMember = ({
  id,
  name,
  email,
  picture,
}: {
  id: number;
  name: string;
  email: string;
  picture: string | undefined;
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleApprove = async () => {
    const { error } = await supabase
      .from("memberships")
      .update({ active: true })
      .eq("id", id);

    if (error) {
      enqueueSnackbar(
        "Error approving member. Contact it@stuysu.org for support.",
        { variant: "error" }
      );
      return;
    }

    enqueueSnackbar("Member approved!", { variant: "success" });
  };

  const handleReject = async () => {
    const { error } = await supabase.from("memberships").delete().eq("id", id);
    if (error) {
      enqueueSnackbar(
        "Error rejecting member. Contact it@stuysu.org for support.",
        { variant: "error" }
      );
      return;
    }

    enqueueSnackbar("User rejected!", { variant: "success" });
  };

  return (
    <div>
      <p>
        {name} - {email}
      </p>
      <Button onClick={handleApprove}>Approve</Button>
      <Button onClick={handleReject}>Reject</Button>
    </div>
  );
};

export default PendingMember;
