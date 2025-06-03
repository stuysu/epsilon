import React, { ReactNode } from "react";
import { PUBLIC_URL } from "../constants";
import { Typography } from "@mui/material";

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

const About = () => {
    return (
        <div className={"m-6 sm:m-10 flex flex-col items-center pb-32"}>
            <img
                src={`${PUBLIC_URL}/textures/AboutNotice.png`}
                className={"max-w-2xl w-full mt-10"}
            ></img>
            <Credit title={"the original epsilon team, 2024-2025"}>
                <MemberGroup
                    role={"interface design & development"}
                    names={["Will Zhang"]}
                ></MemberGroup>
                <MemberGroup
                    role={"programming"}
                    names={[
                        "David Chen",
                        "Rahul Deb",
                        "Randy Sim",
                        "Adam Choi",
                    ]}
                ></MemberGroup>
                <MemberGroup
                    role={"MANAGement"}
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
                    role={"Programming"}
                    names={["David Chen", "Randy Sim"]}
                ></MemberGroup>
                <MemberGroup
                    role={"STUDENT UNION executives"}
                    names={[
                        "Aaron Wang",
                        "Theo Kubovy-Weiss",
                        "Neve Diaz-Carr",
                    ]}
                ></MemberGroup>
            </Credit>
        </div>
    );
};

export default About;
