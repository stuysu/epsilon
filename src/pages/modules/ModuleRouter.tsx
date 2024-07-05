import { PUBLIC_URL } from "../../constants"
import { Helmet } from "react-helmet"
import Loading from "../../comps/ui/Loading"

import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, useContext } from "react";

import AttendanceRouter from "./attendance";
import InvalidModule from "./InvalidModule";

import UserContext from "../../comps/context/UserContext";
import { Typography } from "@mui/material";

const ModuleRouter = () => {
    const location = useLocation();
    const user = useContext(UserContext);

    if (!user.signed_in) {
        return (
            <Typography variant="h1" width="100%" align='center'>You must be signed in to use modules</Typography>
        )
    }
    

    return (
        <div>
            <Helmet>
                <meta
                    property="og:url"
                    content={PUBLIC_URL + location.pathname}
                />
                <meta property="og:site_name" content={"Epsilon"} />
                <meta property="og:type" content={"website"} />
                <meta
                    property="og:description"
                    content={
                        "The everything part of the everything app."
                    }
                />
                <meta property={"og:title"} content={"Epsilon"} />
                <title>Modules | Epsilon</title>
            </Helmet>
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path="/attendance/*" Component={AttendanceRouter} />
                    <Route path="/*" Component={InvalidModule} />
                </Routes>
            </Suspense>
        </div>
    )
}

export default ModuleRouter;