import { Link, Typography } from "@mui/material";
import Terms from "../comps/pages/charter/Terms";

const Rules = () => {
    return (
        <div className={"p-10 max-sm:mb-32"}>
            <div
                className={
                    "flex sm:justify-center items-center w-full h-48 sm:h-96"
                }
            >
                <h1
                    className={
                        "w-2/3 bg-blend-color-dodge text-white/75 sm:text-8xl text-4xl sm:text-center"
                    }
                >
                    Clubs & Pubs
                    <br />
                    Regulations
                </h1>
            </div>
            <div className={"flex flex-row sm:mx-5 justify-center"}>
                <div className={"w-1/4 sticky top-20 h-96 sm:block hidden"}>
                    <Typography variant={"h4"} color="primary" marginBottom={2}>
                        Table of Contents
                    </Typography>
                    <ul>
                        <li>
                            <Link href="#general">General Guidance</Link>
                        </li>
                        <li>
                            <Link href="#online">Online Meetings</Link>
                        </li>
                        <li>
                            <Link href="#activity">Activity Meetings</Link>
                        </li>
                        <li>
                            <Link href="#reservations">
                                Room Reservations and Usage
                            </Link>
                        </li>
                        <li>
                            <Link href="#funding">Funding</Link>
                        </li>
                        <li>
                            <Link href="#finances">Fundraising & Finances</Link>
                        </li>
                    </ul>
                </div>
                <Terms />
            </div>
        </div>
    );
};

export default Rules;
