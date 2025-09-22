import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { Valentine } from "../../../valentines/ValentineType";
import { enqueueSnackbar } from "notistack";
import ValentineDisplay from "../../../valentines/components/ValentineDisplay";
import Loading from "../../../../components/ui/content/Loading";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";

const ApprovedValentines = () => {
    const [approvedMessages, setApprovedMessages] = useState<Valentine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("valentinesmessages")
                .select("sender,receiver,message,background")
                .not("verified_at", "is", null)
                .not("verified_by", "is", null)
                .returns<Valentine[]>();
            setLoading(false);
            if (error || !data) {
                enqueueSnackbar("Error fetching valentines messages.", {
                    variant: "error",
                });
                return;
            }
            setApprovedMessages(
                data.map((entry) => {
                    return {
                        ...entry,
                        sender: 0,
                        receiver: 0,
                        show_sender: false,
                    };
                }),
            );
        };
        fetchMessages();
    }, []);

    if (loading) return <Loading />;

    return (
        <section className={"m-6"}>
            {approvedMessages.length > 0 ? (
                approvedMessages.map((v) => (
                    <ValentineDisplay key={v.id} valentine={v} admin mini />
                ))
            ) : (
                <ContentUnavailable
                    icon="bx-heart"
                    iconColor="text-red"
                    title="No Approved Messages"
                    description="No valentines messages found."
                />
            )}
        </section>
    );
};

export default ApprovedValentines;
