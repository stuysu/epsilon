import { Box } from "@mui/material";
import { ReactNode, useContext } from "react";
import { PUBLIC_URL } from "../constants";
import { ThemeContext } from "../comps/context/ThemeProvider";

const Center = ({ children }: { children?: ReactNode }) => {
    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
            }}
        >
            {children}
        </Box>
    );
};

const Break = () => {
    return <Box width="100%" />;
};

const Credit = ({
    title,
    children,
}: {
    title: string;
    children?: ReactNode;
}) => {
    return (
        <Box
            sx={{
                width: "600px",
                padding: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "start",
                textAlign: "center",
                flexWrap: "wrap",
            }}
        >
            <h2>{title}</h2>
            <Break />
            {children}
        </Box>
    );
};

const About = () => {
    const theme = useContext(ThemeContext);

    const wordmarkSrc = theme.colorMode
        ? `${PUBLIC_URL}/wordmark.svg`
        : `${PUBLIC_URL}/wordmark_light.svg`;

    return (
        <Box sx={{ width: "100%", padding: "20px" }}>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                }}
            >
                <img
                    src={wordmarkSrc}
                    alt="Epsilon"
                    style={{
                        marginBottom: "40px",
                        maxWidth: "300px",
                        height: "auto",
                        mixBlendMode: theme.colorMode
                            ? "color-dodge"
                            : "normal",
                        position: "relative",
                        zIndex: 3,
                        filter: theme.colorMode ? "" : "invert(0%)",
                    }}
                />
                <Break />
                <p>The everything platform for Stuyvesant High School.</p>
                <Break />
                <p>One Site, One School, For Everyone</p>
                <Break />
                <br />
                The new interface is designed and developed by Will Zhang, SU IT
                '23-'25
                <br />
            </Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}
            >
                <Credit title="The Original Epsilon Team">
                    Randy Sim, SU IT Co-Director '23-'24, SU IT '22-'23 <br />
                    David Chen, SU IT Co-Director '23-'25, SU IT '21-'23 <br />
                    Rahul Deb, SU IT Co-Director '24-'25, SU IT '23-'24 <br />
                    Nathaniel Moy, SU IT Manager '24-'25, SU IT '23-'25 <br />
                    Adam Choi, SU IT '23-'25 <br />
                </Credit>
                <Break />
                <Credit title="SU IT 23-24">
                    Randy Sim, SU IT Co-Director '23-'24, SU IT '22-'23 <br />
                    David Chen, SU IT Co-Director '23-'24, SU IT '21-'23 <br />
                    Tony Chen, SU IT ’23-’24 <br />
                    Adam Choi, SU IT ’23-’24 <br />
                    Rahul Deb, SU IT ’23-’24 <br />
                    Richard Wan, SU IT ’23-’24 <br />
                </Credit>
                <Credit title="SU IT 22-23">
                    Yuhao “Ben” Pan, SU IT Co-Director ’22-’23, SU IT ’21-’22{" "}
                    <br />
                    Chun Yeung “Frank” Wong, SU IT Co-Director ’22-’23, SU IT
                    ’21-’22 <br />
                    William Vongphanith, SU IT Assistant Director ’22-’23 <br />
                    David Chen, SU IT ’21-’23 <br />
                    Randy Sim, SU IT ’22-’23
                </Credit>
                <Break />
                <Center>
                    <h3>Heavily inspired by:</h3>
                </Center>
                <Center>
                    <p>
                        <i>
                            “We honor those who walked so we could run. We must
                            run so our children soar. And we will not grow
                            weary.”
                        </i>
                    </p>
                </Center>
                <Break />
                <Credit title="The StuyActivities 2.0 Team:">
                    Julian Giordano, SU President ’20-’21 <br />
                    <br />
                    Shivali Korgaonkar, SU Vice President ’20-’21 <br />
                    <br />
                    Abir Taheer, SU IT ’20-’21 <br />
                    <br />
                    Victor Veytsman, SU IT ’20-’21 <br />
                    <br />
                    Ethan Shan, SU IT ’20-’21 <br />
                    <br />
                    Theo Kubovy-Weiss, SU Exec ’20-’21 <br />
                    <br />
                    Neve Diaz-Carr, SU Exec ’20-’21 <br />
                    <br />
                    Aaron Wang, SU Exec ’20-’21 <br />
                    <br />
                </Credit>
                <Credit title="The Original StuyActivities Team:">
                    William Wang, SU President ’18-’19 <br />
                    <br />
                    Vishwaa Sofat, SU Vice President ’18-’19 <br />
                    <br />
                    Gilvir Gill, SU IT ’17-’18; Stuyvesant ’18 <br />
                    <br />
                    Ivan Galakhov, SU IT ’18-’19 <br />
                    <br />
                    Alwin Peng, SU IT ’18-’19 <br />
                    <br />
                    Jesse Hall, SU IT ’18-’19 <br />
                    <br />
                    Abir Taheer, SU IT ’18’19 <br />
                    <br />
                    Elizabeth Avakov, SU Clubs & Pubs ’18-’19 <br />
                    <br />
                    Gordon Ebanks, SU Clubs & Pubs ’18-’19 <br />
                    <br />
                    Joshua Weiner, SU SLT ’18-’19 <br />
                    <br />
                </Credit>
            </Box>
        </Box>
    );
};

export default About;
