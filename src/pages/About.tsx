import { Box, Button } from "@mui/material";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const Center = ({ children } : { children? : ReactNode }) => {
    return (
        <Box sx={{ width: "100%", display: 'flex', justifyContent: 'center', flexWrap: "wrap"}}>
            { children }
        </Box>
    )
}

const Break = () => {
    return (
        <Box width='100%' />
    )
}

const Credit = ({ title, children } : { title: string, children?: ReactNode }) => {
    return (
        <Box sx={{ width: "600px", padding: "20px", display: "flex", justifyContent: 'center', flexWrap: "wrap" }}>
            <h2>{title}</h2>
            <Break />
            {children}
        </Box>
    );
}

const About = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ width: "100%", padding: "20px"}}>
            <Button variant="contained" onClick={() => navigate("/")}>Back to home</Button>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
                <h1>Epsilon</h1>
                <Break />
                <p>
                    The everything platform for Stuyvesant High School.
                </p>
                <Break />
                <i>One Site, One School, For Everyone</i>
            </Box>
            <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                <Credit title="The Original Epsilon Team">
                    Randy Sim, SU IT Co-Director '23-'24, SU IT '22-'23 <br/><br/>
                    David Chen, SU IT Co-Director '23-'24, SU IT '21-'23 <br/><br/>
                    Nathaniel Moy, SU IT '23-'24
                </Credit>
                <Break />
                <Credit title="SU IT Department Team 23-24:">
                    Randy Sim, SU IT Co-Director '23-'24, SU IT '22-'23 <br/><br/>
                    David Chen, SU IT Co-Director '23-'24, SU IT '21-'23 <br/><br/>
                    Tony Chen, SU IT ’23-’24 <br/><br/>
                    Adam Choi, SU IT ’23-’24 <br/><br/>
                    Rahul Deb, SU IT ’23-’24 <br/><br/>
                    Richard Wan, SU IT ’23-’24 <br/><br/>
                </Credit>
                <Credit title="SU IT Department Team 22-23:">
                    Yuhao “Ben” Pan, SU IT Co-Director ’22-’23, SU IT ’21-’22 <br/><br/>
                    Chun Yeung “Frank” Wong, SU IT Co-Director ’22-’23, SU IT ’21-’22 <br/><br/>
                    William Vongphanith, SU IT Assistant Director ’22-’23 <br/><br/>
                    David Chen, SU IT ’21-’23 <br/><br/>
                    Randy Sim, SU IT ’22-’23 <br/><br/>
                </Credit>
                <Break />
                <Center><h3>Heavily inspired by:</h3></Center>
                <Center><p><i>“We honor those who walked so we could run. We must run so our children soar. And we will not grow weary.”</i></p></Center>
                <Break />
                <Credit title="The StuyActivities 2.0 Team:">
                    Julian Giordano, SU President ’20-’21 <br/><br/>
                    Shivali Korgaonkar, SU Vice President ’20-’21 <br/><br/>
                    Abir Taheer, SU IT ’20-’21 <br/><br/>
                    Victor Veytsman, SU IT ’20-’21 <br/><br/>
                    Ethan Shan, SU IT ’20-’21 <br/><br/>
                    Theo Kubovy-Weiss, SU Exec ’20-’21 <br/><br/>
                    Neve Diaz-Carr, SU Exec ’20-’21 <br/><br/>
                    Aaron Wang, SU Exec ’20-’21 <br/><br/>
                </Credit>
                <Credit title="The Original StuyActivities Team:">
                    William Wang, SU President ’18-’19 <br/><br/>
                    Vishwaa Sofat, SU Vice President ’18-’19 <br/><br/>
                    Gilvir Gill, SU IT ’17-’18; Stuyvesant ’18 <br/><br/>
                    Ivan Galakhov, SU IT ’18-’19 <br/><br/>
                    Alwin Peng, SU IT ’18-’19 <br/><br/>
                    Jesse Hall, SU IT ’18-’19 <br/><br/>
                    Abir Taheer, SU IT ’18’19 <br/><br/>
                    Elizabeth Avakov, SU Clubs & Pubs ’18-’19 <br/><br/>
                    Gordon Ebanks, SU Clubs & Pubs ’18-’19 <br/><br/>
                    Joshua Weiner, SU SLT ’18-’19 <br/><br/>
                </Credit>
            </Box>
        </Box>
    );
}

export default About;