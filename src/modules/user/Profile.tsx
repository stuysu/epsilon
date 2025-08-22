import { Box, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import UserContext from "../../contexts/UserContext";
import LoginGate from "../../components/ui/LoginGate";
import { supabase } from "../../lib/supabaseClient";
import { PUBLIC_URL } from "../../config/constants";

const Profiles = () => {
    const user = useContext(UserContext);
    const [fourDigitId, setFourDigitId] = useState<Number | null>(null);
    const [showPointsPopup, setShowPointsPopup] = useState(false);

    useEffect(() => {
        const fetchID = async () => {
            const { data, error } = await supabase
                .from("fourdigitids")
                .select("value")
                .maybeSingle();
            if (error) console.log(error);
            else if (data) setFourDigitId(data.value as Number);
        };
        fetchID();
    }, [user]);

    return (
        <LoginGate sx={{ width: "100%", paddingLeft: "20px" }}>
            <Box sx={{ padding: "40px" }}>
                <p>My Epsilon Profile</p>
                <div
                    className={
                        "flex flex-row justify-between relative items-start"
                    }
                >
                    <h1>
                        {user.first_name + " " + user.last_name}
                        {user.is_faculty ? (
                            <i
                                className={
                                    "text-green-600 bx bx-check-shield relative top-0.5 left-1"
                                }
                            ></i>
                        ) : (
                            ""
                        )}
                    </h1>
                    <div
                        style={{
                            position: "relative",
                            display: "inline-block",
                        }}
                        onMouseEnter={() => setShowPointsPopup(true)}
                        onMouseLeave={() => setShowPointsPopup(false)}
                    >
                        <div className={"relative bottom-1"}>
                            <h1 className={"text-accent"}>
                                <span
                                    style={{
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                    }}
                                >
                                    Stay tuned for points!
                                </span>{" "}
                                <i
                                    className={
                                        "bx bx-tada bx-loader-circle relative top-1"
                                    }
                                ></i>
                            </h1>
                        </div>
                        {showPointsPopup && (
                            <div
                                className={
                                    "w-72 bg-zinc-800 p-5 absolute right-0 top-16 rounded-lg shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.075)] z-50"
                                }
                            >
                                <div
                                    className={
                                        "flex flex-row justify-between relative items-end"
                                    }
                                >
                                    <p>Start an Activity</p>
                                    <h2>
                                        1,000
                                    </h2>
                                </div>

                                <div
                                    className={
                                        "flex flex-row justify-between relative items-end"
                                    }
                                >
                                    <p>Join an Activity</p>
                                    <h2>250</h2>
                                </div>
                                <div
                                    className={
                                        "flex flex-row justify-between relative items-end"
                                    }
                                >
                                    <p>Attend a meeting</p>
                                    <h2>100</h2>
                                </div>
                                <div
                                    className={
                                        "flex flex-row justify-between relative items-end"
                                    }
                                >
                                    <p>Gain a member</p>
                                    <h2>50</h2>
                                </div>
                                <div
                                    className={
                                        "flex flex-row justify-between relative items-end"
                                    }
                                >
                                    <p>Mark an attendance</p>
                                    <h2>10</h2>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Typography width="100%" sx={{ fontFamily: "monospace" }}>
                    Grade: {user.grade + "th" || "No Grade"}
                </Typography>
                <div
                    className={
                        "bg-neutral-600 w-full h-px mb-1.5 mt-1 opacity-50"
                    }
                ></div>
                <Typography width="100%" sx={{ fontFamily: "monospace" }}>
                    Email: {user.email || "No Email"}
                </Typography>
                <div
                    className={
                        "bg-neutral-600 w-full h-px mb-1.5 mt-1 opacity-50"
                    }
                ></div>
                {fourDigitId && (
                    <Typography
                        width="100%"
                        marginBottom={5}
                        sx={{ fontFamily: "monospace" }}
                    >
                        Epsilon ID: {String(fourDigitId).padStart(4, "0")}
                    </Typography>
                )}
                <img
                    src={`${PUBLIC_URL}/taglines/medals.svg`}
                    className={"w-64 mb-3"}
                    alt={"Medals of Honor"}
                ></img>
                <p>Medals are coming soon to Epsilon. Preview them below!</p>
                <div className="flex flex-col -ml-7">
                    <div className={"flex flex-row items-center -mb-6"}>
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/moderator.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h2>The Presider</h2>
                            <Typography variant={"body1"}>
                                Awarded to members of the Epsilon team and the
                                Clubs & Pubs division of the Student Union.
                            </Typography>
                        </div>
                    </div>

                    <div className={"flex flex-row items-center -mb-6"}>
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/leader.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h2>The Leader</h2>
                            <Typography variant={"body1"}>
                                Awarded to members of the Clubs and Pubs Leaders
                                Union of Business.
                            </Typography>
                        </div>
                    </div>

                    <div className={"flex flex-row items-center -mb-6"}>
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/special.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h2>The Founder</h2>
                            <Typography variant={"body1"}>
                                Awarded to the founders of Epsilon.
                            </Typography>
                        </div>
                    </div>

                    <div className={"flex flex-row items-center -mb-6"}>
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/five_thousand.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h2>The Guided</h2>
                            <Typography variant={"body1"}>
                                Awarded to users who have accumulated more than
                                5,000{" "}
                                <i
                                    className={
                                        "bx bx-loader-circle bx-tada relative top-px"
                                    }
                                ></i>
                                .
                            </Typography>
                        </div>
                    </div>

                    <div className={"flex flex-row items-center -mb-6"}>
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/ten_thousand.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h2>
                                The Determined
                            </h2>
                            <p>
                                Awarded to users who have accumulated more than
                                10,000{" "}
                                <i
                                    className={
                                        "bx bx-loader-circle bx-tada relative top-px"
                                    }
                                ></i>
                                .
                            </p>
                        </div>
                    </div>

                    <div className={"flex flex-row items-center -mb-6"}>
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/editor.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h2>The Amender</h2>
                            <Typography variant={"body1"}>
                                Awarded to the administrators of an Activity who
                                have made a successful amendment to their
                                Activity's charter.
                            </Typography>
                        </div>
                    </div>
                </div>
            </Box>
        </LoginGate>
    );
};

export default Profiles;
