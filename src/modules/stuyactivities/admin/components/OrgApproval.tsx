import { supabase } from "../../../../lib/supabaseClient";

import { useSnackbar } from "notistack";
import OrgChat from "./OrgChat";

import { useState } from "react";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import Divider from "../../../../components/ui/Divider";
import Avatar from "../../../../components/ui/Avatar";
import {
    functionErrorStatus,
    functionErrorText,
} from "../../../../utils/FunctionErrors";
import { sortWeekdays } from "../../../../utils/DataFormatters";
import UserDialog from "../../../../components/ui/overlays/UserDialog";
import { sizedPicture } from "../../../../utils/sizedPicture";

const OrgApproval = ({
    onBack,
    onDecision,
    ...org
}: {
    onBack: () => void;
    onDecision: () => void;
} & Partial<OrgContextType>) => {
    const { enqueueSnackbar } = useSnackbar();
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [confirmingReject, setConfirmingReject] = useState(false);

    const approve = async () => {
        setButtonsDisabled(true);
        const { error } = await supabase.functions.invoke(
            "approve-organization",
            { body: { organization_id: org.id } },
        );

        if (error) {
            setButtonsDisabled(false);
            enqueueSnackbar(
                (await functionErrorText(error)) ||
                    "Error approving organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            /* someone else already approved or rejected it: refresh the list */
            if ([404, 409].includes(functionErrorStatus(error) ?? 0)) {
                onDecision();
            }
            return;
        }

        enqueueSnackbar("Organization approved!", { variant: "success" });
        setButtonsDisabled(false);
        onDecision();
    };

    const reject = async () => {
        setButtonsDisabled(true);
        const { error } = await supabase.functions.invoke(
            "reject-organization",
            { body: { organization_id: org.id } },
        );
        if (error) {
            setButtonsDisabled(false);
            enqueueSnackbar(
                (await functionErrorText(error)) ||
                    "Error rejecting organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            /* someone else already approved or rejected it: refresh the list */
            if ([404, 409].includes(functionErrorStatus(error) ?? 0)) {
                onDecision();
            }
            return;
        }

        enqueueSnackbar("Organization rejected!", { variant: "success" });
        setButtonsDisabled(false);
        onDecision();
    };

    return (
        <div className="m-10">
            <div className="mb-10 flex flex-col sm:flex-row justify-between items-center">
                <h1 className={"font-['instrument-serif'] font-normal"}>
                    New Charter: {org.name}
                </h1>
                <div>
                    <AsyncButton onClick={onBack} sx={{ marginRight: "10px" }}>
                        Back
                    </AsyncButton>
                    <AsyncButton
                        onClick={approve}
                        color="success"
                        sx={{ marginRight: "10px" }}
                        disabled={buttonsDisabled}
                        isPrimary={true}
                    >
                        Approve Activity & Publish
                    </AsyncButton>
                    <AsyncButton
                        onClick={() => setConfirmingReject(true)}
                        color="secondary"
                        sx={{ marginRight: "10px" }}
                        disabled={buttonsDisabled}
                    >
                        Reject
                    </AsyncButton>
                </div>
            </div>

            <UserDialog
                title="Reject this charter?"
                description={`${org.name || "This Activity"} will be deleted and its leaders will be emailed. This can't be undone.`}
                open={confirmingReject}
                onClose={() => setConfirmingReject(false)}
                onConfirm={reject}
                confirmText="Reject"
            />

            <div className={"flex flex-col sm:flex-row gap-10"}>
                <div className={"w-full flex flex-col gap-2"}>
                    <h4>Activity Name</h4>
                    <p>{org.name}</p>
                    <Divider />

                    <h4>URL</h4>
                    <p className={"font-mono"}>{org.url}</p>
                    <Divider />

                    <h4>Picture</h4>
                    {org.picture ? (
                        <Avatar
                            src={sizedPicture(org.picture, 96)}
                            alt={org.name}
                            style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: "15px",
                            }}
                        />
                    ) : (
                        <p>No picture provided</p>
                    )}
                    <Divider />

                    <h4>Origin Story</h4>
                    <p>{org.mission}</p>
                    <Divider />

                    <h4>Goals</h4>
                    <p>{org.goals}</p>
                    <Divider />

                    <h4>Activity Description</h4>
                    <p>{org.purpose}</p>
                    <Divider />

                    <h4>Appointment Procedures</h4>
                    <p>{org.appointment_procedures}</p>
                    <Divider />

                    <h4>Uniqueness</h4>
                    <p>{org.uniqueness}</p>
                    <Divider />

                    <h4 className={org.is_returning ? "text-yellow" : ""}>
                        Returning Activity Declaration
                    </h4>
                    <p>
                        {org.is_returning
                            ? org?.returning_info || "N/A"
                            : "Claims to not be a returning Activity."}
                    </p>
                    <Divider />

                    <h4>Meeting Description</h4>
                    <p>{org.meeting_description}</p>
                    <Divider />

                    <h4>Meeting Schedule</h4>
                    <p>{org.meeting_schedule}</p>
                    <Divider />

                    <h4>Meeting Days</h4>
                    <p>{sortWeekdays(org.meeting_days ?? []).join(", ")}</p>
                    <Divider />

                    <h4>Commitment Level</h4>
                    <p>{org.commitment_level}</p>
                    <Divider />

                    <h4>Keywords</h4>
                    <p className={"font-mono"}>{org.keywords || "none"}</p>
                    <Divider />

                    <h4>Tags</h4>
                    <p>{org.tags?.join(", ") || "none"}</p>
                    <Divider />

                    <h4>Clubs/Pubs Fair Interest</h4>
                    <p>{org.fair ? "Attending" : "Not Attending"}</p>
                    <Divider />

                    <h4>Creator</h4>
                    <p className={"font-mono"}>
                        {
                            org.memberships?.find((m) => m.role === "CREATOR")
                                ?.users?.email
                        }
                    </p>
                    <Divider />

                    <h4>Faculty Advisor</h4>
                    <p className={"font-mono"}>{org?.faculty_email || "N/A"}</p>
                    <Divider />
                </div>

                <div className="h-fit sticky top-12 w-full mb-12">
                    <OrgChat organization_id={org.id as number} />
                </div>
            </div>
        </div>
    );
};

export default OrgApproval;
