import React, { ReactNode } from "react";
import { PUBLIC_URL } from "../../config/constants";
import { Typography } from "@mui/material";
import { Helmet } from "react-helmet";

const Credit = ({
    title,
    children,
}: {
    title: string;
    children?: ReactNode;
}) => {
    return (
        <div className={"max-w-3xl w-full mt-16"}>
            <div className={"relative flex flex-col items-center pb-12"}>
                <div
                    className={"bg-[#111111] relative z-10 w-fit p-3 uppercase"}
                >
                    <p
                        style={{
                            fontFamily: `'neue-haas-grotesk-display', sans-serif`,
                        }}
                    >
                        {title}
                    </p>
                </div>
                <div
                    className={
                        "z-0 relative bottom-6 w-full h-px bg-neutral-800"
                    }
                ></div>
            </div>
            <div className={"mt-3 flex flex-col items-center gap-5"}>
                {children}
            </div>
        </div>
    );
};

const MemberGroup = ({ role, names }: { role: string; names: string[] }) => {
    return (
        <div className={"flex sm:flex-row gap-5 items-start mb-3 flex-col"}>
            <p
                style={{
                    fontFamily: `'neue-haas-grotesk-display', sans-serif`,
                }}
                className={
                    "w-80 sm:text-right text-center uppercase relative top-2 mb-3"
                }
            >
                {role}
            </p>
            <div className={"flex flex-col w-80 text-center sm:text-left"}>
                {names.map((name, index) => (
                    <Typography key={index} variant={"h2"}>
                        {name}
                    </Typography>
                ))}
            </div>
        </div>
    );
};

const Index = () => {
    return (
        <div className={"m-6 sm:m-10 flex flex-col items-center pb-32"}>
            <Helmet>
                <title>About - Epsilon</title>
                <meta
                    name="description"
                    content="One Site, One School, For Everyone."
                />
            </Helmet>
            <img
                alt={"One Site, One School, For Everyone."}
                src={`${PUBLIC_URL}/taglines/about.png`}
                className={"max-w-2xl w-full mt-10"}
            ></img>
            <Credit title={"the original epsilon team, 2024-2025"}>
                <MemberGroup
                    role={"interface design & development"}
                    names={["Will Zhang"]}
                ></MemberGroup>
                <MemberGroup
                    role={"core programming"}
                    names={[
                        "David Chen",
                        "Rahul Deb",
                        "Randy Sim",
                        "Adam Choi",
                    ]}
                ></MemberGroup>
                <MemberGroup
                    role={"management"}
                    names={["Nathaniel Moy"]}
                ></MemberGroup>
            </Credit>

            <Credit title={"SU I.T. department, 2023-2024"}>
                <MemberGroup
                    role={"directors"}
                    names={["Randy Sim", "David Chen"]}
                ></MemberGroup>
                <MemberGroup
                    role={"programming"}
                    names={[
                        "Tony Chen",
                        "Rahul Deb",
                        "Richard Wan",
                        "Adam Choi",
                    ]}
                ></MemberGroup>
            </Credit>

            <Credit title={"SU I.T. department, 2022-2023"}>
                <MemberGroup
                    role={"directors"}
                    names={["Ben Pan", "Frank Wong"]}
                ></MemberGroup>
                <MemberGroup
                    role={"assistant director"}
                    names={["William Vongphanith"]}
                ></MemberGroup>
                <MemberGroup
                    role={"Programming"}
                    names={["David Chen", "Randy Sim"]}
                ></MemberGroup>
            </Credit>

            <Credit title={"THE STUYACTIVITIES 2.0 TEAM, 2020-2021"}>
                <MemberGroup
                    role={"STUDENT UNION PRESIDENT"}
                    names={["Julian Giordano"]}
                ></MemberGroup>
                <MemberGroup
                    role={"STUDENT UNION VICE PRESIDENT"}
                    names={["Shivali Korgaonkar"]}
                ></MemberGroup>
                <MemberGroup
                    role={"STUDENT UNION executives"}
                    names={[
                        "Aaron Wang",
                        "Theo Kubovy-Weiss",
                        "Neve Diaz-Carr",
                    ]}
                ></MemberGroup>
                <MemberGroup
                    role={"Programming"}
                    names={["Abir Taheer", "Victor Veytsman", "Ethan Shan"]}
                ></MemberGroup>
            </Credit>

            <Credit title={"THE ORIGINAL STUYACTIVITIES TEAM, 2018-2019"}>
                <MemberGroup
                    role={"STUDENT UNION PRESIDENT"}
                    names={["William Wang"]}
                ></MemberGroup>
                <MemberGroup
                    role={"STUDENT UNION VICE PRESIDENT"}
                    names={["Vishwaa Sofat"]}
                ></MemberGroup>
                <MemberGroup
                    role={"STUDENT UNION executives"}
                    names={[
                        "Elizabeth Avakov",
                        "Gordon Ebanks",
                        "Joshua Weiner, SLT",
                    ]}
                ></MemberGroup>
                <MemberGroup
                    role={"Programming"}
                    names={[
                        "Gilvir Gill",
                        "Ivan Galakhov",
                        "Alwin Peng",
                        "Jesse Hall",
                        "Abir Taheer",
                    ]}
                ></MemberGroup>
            </Credit>
        </div>
    );
};

export default Index;
