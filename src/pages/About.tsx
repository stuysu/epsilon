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
                maxWidth: "600px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                alignItems: "center",
                textAlign: "center",
                flexWrap: "wrap",
            }}
        >
            <h2>{title}</h2>
            <br />
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
        <Box
            sx={{
                marginTop: "2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
                    mixBlendMode: theme.colorMode ? "color-dodge" : "normal",
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
            <br />
            Epsilon's interface is designed and developed by Will Zhang, SU IT
            '23-'25
            <br />
            <br />
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
                Yuhao “Ben” Pan, SU IT Co-Director ’22-’23, SU IT ’21-’22 <br />
                Chun Yeung “Frank” Wong, SU IT Co-Director ’22-’23, SU IT
                ’21-’22 <br />
                William Vongphanith, SU IT Assistant Director ’22-’23 <br />
                David Chen, SU IT ’21-’23 <br />
                Randy Sim, SU IT ’22-’23
            </Credit>
            <Break />
            <br />
            <Center>
                <p>
                    <i>
                        “We honor those who walked so we could run. We must run
                        so our children soar. And we will not grow weary.”
                    </i>
                </p>
            </Center>
            <br />
            <Break />
            <Credit title="The StuyActivities 2.0 Team">
                Julian Giordano, SU President ’20-’21
                <br />
                Shivali Korgaonkar, SU Vice President ’20-’21
                <br />
                Abir Taheer, SU IT ’20-’21
                <br />
                Victor Veytsman, SU IT ’20-’21
                <br />
                Ethan Shan, SU IT ’20-’21
                <br />
                Theo Kubovy-Weiss, SU Exec ’20-’21
                <br />
                Neve Diaz-Carr, SU Exec ’20-’21
                <br />
                Aaron Wang, SU Exec ’20-’21
                <br />
            </Credit>
            <Credit title="The Original StuyActivities Team">
                William Wang, SU President ’18-’19
                <br />
                Vishwaa Sofat, SU Vice President ’18-’19
                <br />
                Gilvir Gill, SU IT ’17-’18; Stuyvesant ’18
                <br />
                Ivan Galakhov, SU IT ’18-’19
                <br />
                Alwin Peng, SU IT ’18-’19
                <br />
                Jesse Hall, SU IT ’18-’19
                <br />
                Abir Taheer, SU IT ’18’19
                <br />
                Elizabeth Avakov, SU Clubs & Pubs ’18-’19
                <br />
                Gordon Ebanks, SU Clubs & Pubs ’18-’19
                <br />
                Joshua Weiner, SU SLT ’18-’19
                <br />
            </Credit>
        </Box>
    );
};

export default About;
