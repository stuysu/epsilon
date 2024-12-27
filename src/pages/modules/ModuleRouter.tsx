import { PUBLIC_URL } from "../../constants";
import { Helmet } from "react-helmet";
import Loading from "../../comps/ui/Loading";

import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense } from "react";

import AttendanceRouter from "./attendance";
import InvalidModule from "./InvalidModule";
import LoginGate from "../../comps/ui/LoginGate";

const ModuleRouter = () => {
    const location = useLocation();

    return (
        <LoginGate page="use modules">
            <Helmet>
                <meta
                    property="og:url"
                    content={PUBLIC_URL + location.pathname}
                />
                <meta property="og:site_name" content={"Epsilon"} />
                <meta property="og:type" content={"website"} />
                <meta
                    property="og:description"
                    content={"The everything part of the everything app."}
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
        </LoginGate>
    );
};

export default ModuleRouter;
