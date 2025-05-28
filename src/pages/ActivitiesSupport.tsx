import React from "react";
import { Divider, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

const HelpItem = ({
    icon,
    iconColor,
    title,
    description,
    content,
}: {
    icon: string;
    iconColor: string;
    title: string;
    description: string;
    content?: string;
}) => {
    const [expanded, setExpanded] = React.useState(false);
    return (
        <div
            className={"flex flex-row items-start gap-3 my-4 cursor-pointer"}
            onClick={() => setExpanded((prev) => !prev)}
        >
            <i className={`bx ${icon} bx-lg relative top-2.5 ${iconColor}`}></i>
            <div>
                <Typography variant="h3">{title}</Typography>
                <Typography variant="h4" color="secondary">
                    {description}
                </Typography>
                <AnimatePresence initial={false}>
                    {content && expanded && (
                        <motion.div
                            key="content"
                            initial={{
                                opacity: 0,
                                height: 0,
                                filter: "blur(8px)",
                            }}
                            animate={{
                                opacity: 1,
                                height: "auto",
                                filter: "blur(0px)",
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                                filter: "blur(8px)",
                            }}
                            transition={{ duration: 0.5, ease: [0, 0, 0, 1] }}
                            style={{ overflow: "hidden" }}
                        >
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                mt={2}
                                maxWidth="800px"
                            >
                                {content}
                            </Typography>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ActivitiesSupport = () => {
    return (
        <div className={"m-[4.5vw]"}>
            <Typography variant="h1" marginBottom={3}>
                Get help with StuyActivities.
            </Typography>
            <Divider />
            <HelpItem
                icon="bx-time"
                iconColor="text-blue-500"
                title="My Charter has not been approved yet."
                description="I submitted my charter over a week ago, yet it still hasn’t been approved."
                content="Charters are reviewed and approved once a week by the Clubs & Pubs administrators.
                If your charter hasn't been approved yet, it may still be under review. Once it's fully approved,
                it will appear on the Epsilon website and you'll receive an email confirmation.
                We work around the clock to approve applications, but if it's been much longer than a week since submission
                or you have any concerns, you can follow up by emailing clubpub@stuysu.org for updates."
            />
            <Divider />
            <HelpItem
                icon="bx-message-square-error"
                iconColor="text-red-500"
                title="My Charter was denied."
                description="My Charter submission was denied and I don’t know what went wrong."
                content="If your charter was denied, it’s likely due to an issue with the information
                submitted or a rule it may have violated. Unfortunately, we are not able to provide detailed feedback.
                We recommend emailing clubpub@stuysu.org to ask for
                clarification on why it was denied and what you can do to fix it. They’ll be able to tell you exactly what
                went wrong and how to revise your submission."
            />
            <Divider />
            <HelpItem
                icon="bx-pencil"
                iconColor="text-orange-400"
                title="My Charter update isn’t reflected."
                description="I submitted an edit request to an existing Charter, but it has not been reflected on the Activity page."
                content="Edit requests to existing charters need to be reviewed and approved by the Clubs & Pubs team before the changes appear on the Activity page. These approvals typically happen on a set day each week."
            />
            <Divider />
            <HelpItem
                icon="bx-user-plus"
                iconColor="text-yellow-300"
                title="How do I invite new members?"
                description="I can’t figure out how to invite new members."
                content="To invite new members to your Activity, you can share the activity link. This link allows anyone with it to join your Activity.
                You can also encourage them to visit the Epsilon website and search for your Activity in the catalog."
            />
            <Divider />
            <HelpItem
                icon="bx-mail-send"
                iconColor="text-grey-300"
                title="Request technical support with the StuyActivities service."
                description="Send an email to IT@stuysu.org"
            />
            <Divider />
            <HelpItem
                icon="bx-mail-send"
                iconColor="text-grey-300"
                title="Request Clubs & Pubs support."
                description="Send an email to clubpub@stuysu.org"
            />
        </div>
    );
};

export default ActivitiesSupport;
