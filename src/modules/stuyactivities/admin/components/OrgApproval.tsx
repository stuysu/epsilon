import { Avatar } from "@mui/material";
import { supabase } from "../../../../lib/supabaseClient";

import { useSnackbar } from "notistack";
import OrgChat from "./OrgChat";

import { useEffect, useState } from "react";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import Divider from "../../../../components/ui/Divider";
import { PUBLIC_URL } from "../../../../config/constants";


const acronyms = ["AI", "AP", "CS", "GSA"];
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
    const creator = org.memberships?.find((m) => m.role === 'CREATOR');
    const [memStr, setMemStr] = useState("");
    const [orgLinks, setOrgLinks] = useState<string[]>([]);
    let keywords = org.keywords?.split(",");
    const approve = async () => {
        setButtonsDisabled(true);
        const { error } = await supabase.functions.invoke(
            "approve-organization",
            { body: { organization_id: org.id } },
        );

        if (error) {
            setButtonsDisabled(false);
            return enqueueSnackbar(
                "Error approving organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
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
            return enqueueSnackbar(
                "Error rejecting organization. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
        }

        enqueueSnackbar("Organization rejected!", { variant: "success" });
        setButtonsDisabled(false);
        onDecision();
    };

    useEffect(() => {
        const test = async (id: number) => {
            const { data } = await supabase.from("memberships").select("*").neq("organization_id", org.id).eq("user_id", id);
            const collection: Map<number, string> = new Map<number, string>();
            data?.forEach((m: any) => {
                collection.set(m.organization_id, m.role);
            });
            const { data: orgsss } = await supabase.from("organizations").select("*").in("id", Array.from(collection.keys()));

            if (orgsss) {
                const links: string[] = [];
                const str = orgsss
                    .map((org: any, index: number) => {
                        return (
                            collection.get(org.id) +
                            " at " +
                            org.name +
                            (index === orgsss.length - 1 ? "" : ", ")
                        );
                    })
                    .join("");

                orgsss.map((org: any) => {
                    links.push(org.url);
                })
                setMemStr(str);
                setOrgLinks(links);
            };
        }
        test(creator?.users?.id!);
    }, [creator, keywords]);

    return (
        <div className="m-10">
            <div className="mb-10 flex flex-col sm:flex-row justify-between items-center">
                <h1 className={"font-['instrument-serif'] font-normal"}>
                    New Charter: {org.name}
                </h1>
                <div>
                    <AsyncButton
                        variant="contained"
                        onClick={onBack}
                        sx={{ marginRight: "10px" }}
                    >
                        Back
                    </AsyncButton>
                    <AsyncButton
                        variant="contained"
                        onClick={approve}
                        color="success"
                        sx={{ marginRight: "10px" }}
                        disabled={buttonsDisabled}
                        isPrimary={true}
                    >
                        Approve Activity & Publish
                    </AsyncButton>
                    <AsyncButton
                        variant="contained"
                        onClick={reject}
                        color="secondary"
                        sx={{ marginRight: "10px" }}
                        disabled={buttonsDisabled}
                    >
                        Reject
                    </AsyncButton>
                </div>
            </div>

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
                            src={org.picture}
                            alt={org.name}
                            sx={{ width: "150px", height: "150px", borderRadius: "15px", }}
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
                    <p>{org.meeting_days?.join(", ")}</p>
                    <Divider />

                    <h4>Commitment Level</h4>
                    <p>{org.commitment_level}</p>
                    <Divider />

                    <h4>Keywords</h4>
                    {!org.keywords && <p>none</p>}
                    {org.keywords &&
                        keywords?.map((n, i) => (
                            <p key={i}>{acronyms.includes(n.toUpperCase()) ? n.toUpperCase() : n[0].toUpperCase() + n.slice(1)}</p>
                        ))
                    }
                    <Divider />

                    <h4>Tags</h4>
                    <p>{org.tags?.join(", ") || "none"}</p>
                    <Divider />

                    <h4>Clubs/Pubs Fair Interest</h4>
                    <p>{org.fair ? "Attending" : "Not Attending"}</p>
                    <Divider />

                    <h4>Creator</h4>
                    <p className="text-sm my-2">{creator?.users?.first_name} {" "} {creator?.users?.last_name}</p>
                    <p className={"font-mono"}>
                        {creator?.users?.email}
                    </p>
                    <Divider />

                    <h4>Faculty Advisor</h4>
                    <p className={"font-mono"}>{org?.faculty_email || "N/A"}</p>
                    <Divider />

                    <h4>Activities</h4>
                        {memStr && memStr.split(",").map((v: string, index) => (
                            <div className="flex flex-row gap-2">
                                <p className="flex items-center" key={index}>{v}</p>
                                <a target="_blank" href={`${PUBLIC_URL}/${orgLinks[index]}`}>Link</a>
                            </div>
                        ))}
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
