import { PUBLIC_URL } from "../constants"
import { Helmet } from "react-helmet"
import Loading from "../comps/ui/Loading";

import { Routes, Route, useLocation } from "react-router-dom"
import { lazy, Suspense } from "react";

// Pages
import Home from "./Home";
const Catalog = lazy(() => import("./Catalog"));
const Create = lazy(() => import("./Create"));
const OrgRouter = lazy(() => import("./orgs"));

const Pages = () => {
    const location = useLocation();

    return (
        <div>
            <Helmet>
                <meta property="og:url" content={PUBLIC_URL + location.pathname} />
				<meta property="og:site_name" content={"StuyActivities"} />
				<meta property="og:type" content={"website"} />
				<meta
					property="og:description"
					content={"An app to help students navigate the clubs and organizations at Stuyvesant High School."}
				/>
				<meta property={"og:title"} content={"StuyActivities"} />
				<title>StuyActivities</title>
            </Helmet>

            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path={"/"} Component={Home} />
                    <Route path={"/catalog"} Component={Catalog} />
                    <Route path={"/create"} Component={Create} />
                    <Route path={"/:orgUrl/*"} Component={OrgRouter} />
                </Routes>
            </Suspense>
        </div>
    )
}

export default Pages