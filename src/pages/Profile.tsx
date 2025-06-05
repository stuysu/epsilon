import { Box, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import UserContext from "../comps/context/UserContext";
import LoginGate from "../comps/ui/LoginGate";
import { supabase } from "../supabaseClient";
import { PUBLIC_URL } from "../constants";

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
                <Typography variant={"body1"}>My Epsilon Profile</Typography>
                <div
                    className={
                        "flex flex-row justify-between relative items-start"
                    }
                >
                    <Typography variant={"h1"} marginBottom={5}>
                        {user.first_name + " " + user.last_name}
                    </Typography>
                    <div
                        style={{
                            position: "relative",
                            display: "inline-block",
                        }}
                        onMouseEnter={() => setShowPointsPopup(true)}
                        onMouseLeave={() => setShowPointsPopup(false)}
                    >
                        <div className={"relative bottom-1"}>
                            <Typography variant={"h1"} color={"#4486ff"}>
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
                            </Typography>
                        </div>
                        {showPointsPopup && (
                            <div
                                className={
                                    "w-96 bg-zinc-800 p-5 absolute right-0 top-16 rounded-lg shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.075)] z-50"
                                }
                            >
                                <div
                                    className={
                                        "flex flex-row justify-between relative items-end"
                                    }
                                >
                                    <Typography>Start an Activity</Typography>
                                    <Typography variant={"h2"}>
                                        1,000
                                    </Typography>
                                </div>

                                <div
                                    className={
                                        "flex flex-row justify-between relative items-end"
                                    }
                                >
                                    <Typography>Join an Activity</Typography>
                                    <Typography variant={"h2"}>250</Typography>
                                </div>
                                <div
                                    className={
                                        "flex flex-row justify-between relative items-end"
                                    }
                                >
                                    <Typography>Attend a meeting</Typography>
                                    <Typography variant={"h2"}>100</Typography>
                                </div>
                                <div
                                    className={
                                        "flex flex-row justify-between relative items-end"
                                    }
                                >
                                    <Typography>Gain a member</Typography>
                                    <Typography variant={"h2"}>50</Typography>
                                </div>
                                <div
                                    className={
                                        "flex flex-row justify-between relative items-end"
                                    }
                                >
                                    <Typography>Mark an attendance</Typography>
                                    <Typography variant={"h2"}>10</Typography>
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
                        EpsilonID: {String(fourDigitId).padStart(4, "0")}
                    </Typography>
                )}
                <img
                    src={`${PUBLIC_URL}/achievements/medalstitle.svg`}
                    className={"w-64 mb-3"}
                    alt={"Medals of Honor"}
                ></img>
                Medals are coming soon to Epsilon. Preview them below!
                <div className="flex flex-col -ml-7">
                    <div className={"flex flex-row items-center -mb-6"}>
                        <img
                            src={`${PUBLIC_URL}/achievements/moderator.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <Typography variant={"h2"}>The Presider</Typography>
                            <Typography variant={"body1"}>
                                Awarded to members of the Epsilon team and the
                                Clubs & Pubs division of the Student Union.
                            </Typography>
                        </div>
                    </div>

                    <div className={"flex flex-row items-center -mb-6"}>
                        <img
                            src={`${PUBLIC_URL}/achievements/leader.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <Typography variant={"h2"}>The Leader</Typography>
                            <Typography variant={"body1"}>
                                Awarded to members of the Clubs and Pubs Leaders
                                Union of Business.
                            </Typography>
                        </div>
                    </div>

                    <div className={"flex flex-row items-center -mb-6"}>
                        <img
                            src={`${PUBLIC_URL}/achievements/special.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <Typography variant={"h2"}>The Founder</Typography>
                            <Typography variant={"body1"}>
                                Awarded to the founders of Epsilon.
                            </Typography>
                        </div>
                    </div>

                    <div className={"flex flex-row items-center -mb-6"}>
                        <img
                            src={`${PUBLIC_URL}/achievements/five.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <Typography variant={"h2"}>The Guided</Typography>
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
                            src={`${PUBLIC_URL}/achievements/ten.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <Typography variant={"h2"}>
                                The Determined
                            </Typography>
                            <Typography variant={"body1"}>
                                Awarded to users who have accumulated more than
                                10,000{" "}
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
                            src={`${PUBLIC_URL}/achievements/editor.png`}
                            className={"w-36"}
                        ></img>

                        <div>
                            <Typography variant={"h2"}>The Amender</Typography>
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
