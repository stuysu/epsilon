import React from "react";
import Divider from "../../components/ui/Divider";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet } from "react-helmet";

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
            <i
                className={`bx ${icon} max-sm:hidden bx-lg relative top-2.5 ${iconColor}`}
            ></i>
            <div>
                <h3 className="mt-3">{title}</h3>
                <p className="mb-3">{description}</p>
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
                            <p className={"max-w-2xl mb-2"}>{content}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const Support = () => {
    return (
        <div className={"m-10 sm:m-12 max-sm:mb-32"}>
            <Helmet>
                <title>StuyActivities Support - Epsilon</title>
                <meta
                    name="description"
                    content="Get help with StuyActivities questions and issues."
                />
            </Helmet>
            <div
                className={
                    "sm:hidden flex sm:justify-center items-center w-full h-48 sm:h-96"
                }
            >
                <h1
                    className={
                        "sm:w-2/3 bg-blend-color-dodge sm:text-8xl text-4xl sm:text-center font-light leading-tight"
                    }
                >
                    Get help with
                    <br />
                    StuyActivities.
                </h1>
            </div>

            <div className={"hidden sm:block"}>
                <h1>Get help with StuyActivities.</h1>
            </div>

            <div className={"max-sm:-mr-4"}>
                <Divider />
                <HelpItem
                    icon="bx-time"
                    iconColor="text-blue"
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
                    iconColor="text-red"
                    title="My Charter was denied."
                    description="My Charter submission was denied and I don’t know what went wrong."
                    content="We may have shared specific details regarding why the submission was denied with you
                     via the Activity’s Messaging channel on Epsilon. Please review it carefully and determine
                     your next steps accordingly. You may submit a revised charter application from August through
                     May, subject to review in a future cycle. However, please note that repeat submissions may
                     result in your future applications not being considered. We strongly encourage you to carefully
                      review the applicable Clubs & Pubs Regulations and take corrective measures before resubmitting
                       your application. Compliance is essential for ensuring your Activity is eligible for approval.
                        If you have any questions or need clarification, please contact clubpub@stuysu.org for assistance."
                />
                <Divider />
                <HelpItem
                    icon="bx-question-mark"
                    iconColor="text-pink-500"
                    title="What do the different Activity statuses mean?"
                    description="Learn about the different Activity statuses and their impacts."
                    content="Pending Activities are yet to be approved by the Clubs & Pubs department and are not publicly visible.
                    Activities with less than 10 members, or otherwise specified by the SU, are locked and have limited privileges.
                    Such Activities cannot create posts, host meetings, or access certain features until they meet the required criteria.
                    Activities that are unlocked have no restrictions and can be joined by anyone, if accepted.
                    If your Activity has another status not listed here and you are unsure what it means, please contact us."
                />
                <Divider />
                <HelpItem
                    icon="bx-pencil"
                    iconColor="text-orange-400"
                    title="My Charter update isn’t reflected."
                    description="I edited my Charter, but the changes have not been reflected on the Activity page."
                    content="Edit requests to existing charters need to be reviewed and approved by the Clubs & Pubs team before the changes appear on the Activity page. These approvals typically happen on a set day each week."
                />
                <Divider />
                <HelpItem
                    icon="bx-user-plus"
                    iconColor="text-yellow"
                    title="How do I invite new members?"
                    description="I can’t figure out how to invite new members."
                    content="To invite new members to your Activity, you can share the activity link. This link allows anyone with it to join your Activity.
                You can also encourage them to visit the Epsilon website and search for your Activity in the catalog."
                />
                <Divider />
                <HelpItem
                    icon="bx-mail-send"
                    iconColor="text-typography-2"
                    title="Request technical support with the StuyActivities service."
                    description="Send an email to IT@stuysu.org"
                />
                <Divider />
                <HelpItem
                    icon="bx-mail-send"
                    iconColor="text-typography-2"
                    title="Request Clubs & Pubs support."
                    description="Send an email to clubpub@stuysu.org"
                />
            </div>
        </div>
    );
};

export default Support;
