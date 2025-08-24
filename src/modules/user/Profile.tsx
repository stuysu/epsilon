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
                                    Points
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
                                    "w-72 bg-blurLight backdrop-blur-2xl p-5 absolute right-0 top-16 rounded-lg shadow-module z-50"
                                }
                            >
                                <p>Stay tuned for points!</p>
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
                    <Typography width="100%" sx={{ fontFamily: "monospace" }}>
                        Epsilon ID: {String(fourDigitId).padStart(4, "0")}
                    </Typography>
                )}
                <img
                    src={`${PUBLIC_URL}/taglines/medals.svg`}
                    className={"w-64 mb-3 mt-16"}
                    alt={"Medals of Honor"}
                ></img>
                <p className={"mb-5"}>
                    Medals are coming soon to Epsilon. Preview them below!
                </p>

                <div className="flex flex-col -ml-7">
                    <div
                        className={
                            "my-4 flex flex-row items-center border border-divider rounded-lg"
                        }
                    >
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/moderator.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h4>The Presider</h4>
                            <Typography variant={"body1"}>
                                Awarded to members of the Epsilon team and the
                                Clubs & Pubs division of the Student Union.
                            </Typography>
                        </div>
                    </div>

                    <div
                        className={
                            "my-4 flex flex-row items-center border border-divider rounded-lg"
                        }
                    >
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/leader.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h4>The Leader</h4>
                            <Typography variant={"body1"}>
                                Awarded to members of the Clubs and Pubs Leaders
                                Union of Business.
                            </Typography>
                        </div>
                    </div>

                    <div
                        className={
                            "my-4 flex flex-row items-center border border-divider rounded-lg"
                        }
                    >
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/special.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h4>The Founder</h4>
                            <Typography variant={"body1"}>
                                Awarded to the founders of Epsilon.
                            </Typography>
                        </div>
                    </div>

                    <div
                        className={
                            "my-4 flex flex-row items-center border border-divider rounded-lg"
                        }
                    >
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/five_thousand.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h4>The Guided</h4>
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

                    <div
                        className={
                            "my-4 flex flex-row items-center border border-divider rounded-lg"
                        }
                    >
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/ten_thousand.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h4>The Determined</h4>
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

                    <div
                        className={
                            "my-4 flex flex-row items-center border border-divider rounded-lg"
                        }
                    >
                        <img
                            alt=""
                            src={`${PUBLIC_URL}/achievements/editor.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <h4>The Amender</h4>
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
