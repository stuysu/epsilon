import { supabase } from "../../../../../lib/supabaseClient";
import { Box } from "@mui/material";
import { useSnackbar } from "notistack";
import { useContext } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import OrgMember from "../../components/OrgMember";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";

const PendingMember = ({
    id,
    first_name,
    last_name,
    email,
    picture,
    approveFunc,
}: {
    id: number;
    first_name?: string;
    last_name?: string;
    email: string;
    picture: string | undefined;
    approveFunc: () => void;
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext(OrgContext);
    
    const handleReject = async () => {
        const { error } = await supabase
            .from("memberships")
            .delete()
            .eq("id", id);
        if (error) {
            enqueueSnackbar(
                "Error rejecting member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        // update contexts
        if (organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: organization.memberships.filter(
                    (m) => m.id !== id,
                ),
            });
        }

        enqueueSnackbar("User rejected!", { variant: "success" });
    };

    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
            }}
        >
            <Box sx={{ width: "100%" }}>
                <OrgMember
                    email={email}
                    picture={picture}
                    role_name={"Pending Member"}
                    first_name={first_name}
                    last_name={last_name}
                />
            </Box>
            <div className={"flex px-3"}>
                <AsyncButton
                    onClick={(() => {approveFunc()})}
                    variant="contained"
                    sx={{ height: "40px" }}
                >
                    Approve
                </AsyncButton>
                <AsyncButton
                    onClick={handleReject}
                    variant="contained"
                    sx={{ height: "40px", marginLeft: "10px" }}
                >
                    Reject
                </AsyncButton>
            </div>
        </Box>
    );
};

export default PendingMember;
