import { PUBLIC_URL } from "../constants"
import { Helmet } from "react-helmet"
import Loading from "../comps/ui/Loading";

import { Routes, Route, useLocation } from "react-router-dom"
import React, { lazy, Suspense } from "react";

// Pages
import Home from "./Home";

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
                </Routes>
            </Suspense>
        </div>
    )
}

export default Pages