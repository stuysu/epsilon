import React, { useContext, useEffect, useState } from "react";
import UserContext from "../../contexts/UserContext";
import LoginGate from "../../components/ui/content/LoginGate";
import { supabase } from "../../lib/supabaseClient";
import { PUBLIC_URL } from "../../config/constants";
import UserDialog from "../../components/ui/overlays/UserDialog";
import Divider from "../../components/ui/Divider";
import { Helmet } from "react-helmet";

type Category = "Exclusive Series" | "Accolades" | "Venturer" | "Participation";

type Medal = {
    key: string;
    title: string;
    description: string;
    img: string;
    category: Category;
};

const MEDALS: Medal[] = [
    {
        key: "clubpub",
        title: "Clubs & Pubs Exclusive",
        description:
            "Awarded to members of the Clubs & Pubs division of the Student Union.",
        img: `${PUBLIC_URL}/achievements/moderator.png`,
        category: "Exclusive Series",
    },
    {
        key: "epsilon",
        title: "Epsilon Team Exclusive",
        description: "Awarded to current and past members of the Epsilon team.",
        img: `${PUBLIC_URL}/achievements/epsilon.png`,
        category: "Exclusive Series",
    },
    {
        key: "leader",
        title: "Activity Leader Exclusive",
        description:
            "Awarded to Activity leaders participating in the Clubs and Pubs Leaders' Union of Business.",
        img: `${PUBLIC_URL}/achievements/leader.png`,
        category: "Exclusive Series",
    },

    {
        key: "founder",
        title: "Founder's Honor",
        description: "Awarded to the original creators of Epsilon.",
        img: `${PUBLIC_URL}/achievements/special.png`,
        category: "Accolades",
    },
    {
        key: "twentythree",
        title: "Big 23",
        description:
            "Awarded to those who have attended at least 23 Activity meetings in" +
            " a single school year, joined at least 2 Activities, and signed up for at least 3 Opportunities.",
        img: `${PUBLIC_URL}/achievements/23.png`,
        category: "Accolades",
    },

    {
        key: "guided",
        title: "Guided Venturer",
        description:
            "Awarded to users who have spent 5,000 hours since joining Epsilon.",
        img: `${PUBLIC_URL}/achievements/five_thousand.png`,
        category: "Venturer",
    },
    {
        key: "extraordinary",
        title: "Extraordinary Venturer",
        description:
            "Awarded to users who have spent 10,000 hours since joining Epsilon.",
        img: `${PUBLIC_URL}/achievements/ten_thousand.png`,
        category: "Venturer",
    },

    {
        key: "amender",
        title: "The Amender",
        description:
            "Awarded to the administrators of an Activity who made a successful amendment to their Activity's charter.",
        img: `${PUBLIC_URL}/achievements/editor.png`,
        category: "Participation",
    },
    {
        key: "bug",
        title: "The Exterminator",
        description:
            "Awarded to users who reported a bug within Epsilon via GitHub that received a fix. Thank you for making Epsilon better!",
        img: `${PUBLIC_URL}/achievements/bugfinder.png`,
        category: "Participation",
    },
    {
        key: "connector",
        title: "The Connector",
        description:
            "Successfully invite 10 users to an Activity through the Send Invite feature. Keep going!",
        img: `${PUBLIC_URL}/achievements/connector.png`,
        category: "Participation",
    },
    {
        key: "plug",
        title: "The Plug",
        description:
            "Successfully invite 30 users to an Activity to achieve 100 total members through the Send Invite feature. That's about a tenth of the grade!",
        img: `${PUBLIC_URL}/achievements/plug.png`,
        category: "Participation",
    },
];

const SECTIONS: Category[] = [
    "Exclusive Series",
    "Accolades",
    "Venturer",
    "Participation",
];

const SECTION_DESCRIPTIONS: Record<Category, string> = {
    "Exclusive Series":
        "Reserved for members of specific leadership divisions.",
    Accolades: "Given for unique accomplishments and milestones.",
    Venturer: "These medals are granted based on your Epsilon account age.",
    Participation:
        "Participation medals celebrate the ones who contribute to the Stuy community.",
};

const Profiles = () => {
    const user = useContext(UserContext);
    const [fourDigitId, setFourDigitId] = useState<number | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeMedal, setActiveMedal] = useState<Medal | null>(null);

    useEffect(() => {
        const fetchID = async () => {
            const { data, error } = await supabase
                .from("fourdigitids")
                .select("value")
                .maybeSingle();
            if (error) {
                console.log(error);
            } else if (data) {
                setFourDigitId(Number(data.value));
            }
        };
        fetchID();
    }, [user]);

    const openMedalDialog = (medal: Medal) => {
        setActiveMedal(medal);
        setDialogOpen(true);
    };

    const closeMedalDialog = () => {
        setDialogOpen(false);
        setActiveMedal(null);
    };

    const MedalGrid = ({ items }: { items: Medal[] }) => (
        <div className="flex flex-wrap bg-layer-1 rounded-lg overflow-hidden">
            {items.map((m) => (
                <button
                    key={m.key}
                    type="button"
                    onClick={() => openMedalDialog(m)}
                    className="w-48 max-sm:w-32 overflow-hidden sm:hover:bg-layer-2 transition-colors"
                    aria-label={m.title}
                    title={m.title}
                >
                    <img
                        alt={m.title}
                        src={m.img}
                        className="cursor-pointer select-none"
                    />
                </button>
            ))}
        </div>
    );

    return (
        <LoginGate sx={{ width: "100%" }}>
            <Helmet>
                <title>Profile</title>
                <meta
                    name="description"
                    content="View your Epsilon profile and earned medals."
                />
            </Helmet>

            <div className={"sm:m-12 m-6"}>
                <p>Profile</p>
                <h1>
                    {user.first_name + " " + user.last_name}
                    {user.is_faculty ? (
                        <i
                            className={
                                "text-green-600 bx bx-check-shield relative top-0.5 left-1"
                            }
                        />
                    ) : (
                        ""
                    )}
                </h1>

                <p className={"mt-6 font-mono"}>
                    Grade: {user.grade ? `${user.grade}th` : "N/A"}
                </p>
                <Divider />
                <p className={"font-mono"}>Email: {user.email || "No Email"}</p>
                <Divider />
                <p className={"font-mono"}>
                    Account ID:{" "}
                    {fourDigitId == null
                        ? "N/A"
                        : String(fourDigitId).padStart(4, "0")}
                </p>

                <img
                    src={`${PUBLIC_URL}/taglines/medals.svg`}
                    className={
                        "w-64 mb-3 mt-16 bg-[#111111] p-3 rounded-lg relative right-3"
                    }
                    alt={"Medals of Honor"}
                />
                <p>Medals are coming soon to Epsilon. Preview them below!</p>

                <div className={"mb-8"}>
                    <Divider />
                </div>

                {SECTIONS.map((section, idx) => {
                    const items = MEDALS.filter((m) => m.category === section);
                    if (!items.length) return null;
                    return (
                        <div key={section} className="mb-8">
                            <h4>{section}</h4>
                            <p className="mb-4">
                                {SECTION_DESCRIPTIONS[section]}
                            </p>
                            <MedalGrid items={items} />
                            {idx !== SECTIONS.length - 1 && (
                                <Divider className="my-6" />
                            )}
                        </div>
                    );
                })}
            </div>

            <UserDialog
                open={dialogOpen}
                onClose={closeMedalDialog}
                title={activeMedal?.title ?? ""}
                description={activeMedal?.description ?? ""}
                confirmText="Got it!"
                cancelText="Close"
                onConfirm={() => {}}
                onCancel={() => {}}
                imageSrc={activeMedal?.img}
            />
        </LoginGate>
    );
};

export default Profiles;
