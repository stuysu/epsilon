import { supabase } from "../../../../supabaseClient";
import { Box } from "@mui/material";
import { useSnackbar } from "notistack";
import { useContext, useEffect } from "react";
import OrgContext from "../../../context/OrgContext";
import OrgMember from "../OrgMember";
import AsyncButton from "../../../ui/AsyncButton";

const PendingMember = ({
    id,
    first_name,
    last_name,
    email,
    picture,
    auto
}: {
    id: number;
    first_name?: string;
    last_name?: string;
    email: string;
    picture: string | undefined;
    auto: boolean;
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext(OrgContext);

    const handleApprove = async () => {
        const { error } = await supabase.functions.invoke("approve-member", {
            body: { member_id: id },
        });

        if (error) {
            enqueueSnackbar(
                "Error approving member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        let memberIndex = organization.memberships.findIndex(
            (m) => m.id === id,
        );
        let memberData = organization.memberships[memberIndex];

        memberData.active = true;

        // update context
        if (organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: [
                    ...organization.memberships.slice(0, memberIndex),
                    memberData,
                    ...organization.memberships.slice(memberIndex + 1),
                ],
            });
        }

        enqueueSnackbar("Member approved!", { variant: "success" });
    };

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

        // update context
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

    useEffect(() => {
        if(auto) {
            handleApprove();
        }
    }, [auto]);

    return (
        <Box>
            {!auto ?
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexWrap: "nowrap",
                        alignItems: "center",
                    }}>
                    <Box sx={{ width: "100%" }}>
                        <OrgMember
                            email={email}
                            picture={picture}
                            first_name={first_name}
                            last_name={last_name}
                        />
                    </Box>
                    <Box sx={{ width: "200px", display: "flex", flexWrap: "nowrap" }}>
                        <AsyncButton
                            onClick={handleApprove}
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
                    </Box>
                </Box>
                :
                <></>
            }
        </Box>
    );
};

export default PendingMember;
