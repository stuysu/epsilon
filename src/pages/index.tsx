import { PUBLIC_URL } from "../constants";
import { Helmet } from "react-helmet";
import Loading from "../comps/ui/Loading";

import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useState } from "react";

// Pages
import Home from "./Home";
import AllMeetings from "./AllMeetings";
import NavBar from "../comps/ui/nav/NavBar";
import About from "./About";
import Rules from "./Rules";
import { Typography } from "@mui/material";

const ModuleRouter = lazy(() => import("./modules/ModuleRouter"));
const Catalog = lazy(() => import("./Catalog"));
const Settings = lazy(() => import("./Settings"));
const Create = lazy(() => import("./Create"));
const OrgRouter = lazy(() => import("./orgs"));
const AdminRouter = lazy(() => import("./admin"));

const Pages = () => {
    const location = useLocation();
    const [showDesignBanner, setDesignBanner] = useState(true); // State for banner visibility

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
                        "An app to help students navigate the clubs and organizations at Stuyvesant High School."
                    }
                />
                <meta property={"og:title"} content={"Epsilon"} />
                <title>Epsilon</title>
            </Helmet>

            <Suspense fallback={<Loading />}>
                <NavBar />
                <Routes>
                    <Route path={"/"} Component={Home} />
                    <Route path={"/catalog"} Component={Catalog} />
                    <Route path={"/settings"} Component={Settings} />
                    <Route path={"/create"} Component={Create} />
                    <Route path={"/about"} Component={About} />
                    <Route path={"/meetings"} Component={AllMeetings} />
                    <Route path={"/rules"} Component={Rules} />
                    <Route path={"/modules/*"} Component={ModuleRouter} />
                    <Route path={"/admin/*"} Component={AdminRouter} />
                    <Route path={"/:orgUrl/*"} Component={OrgRouter} />
                </Routes>
                {showDesignBanner && (
                    <div
                        style={{ zIndex: 51 }}
                        className="fixed flex bottom-0 w-full h-12 border-t border-stone-700 bg-stone-900/85 backdrop-blur-xl items-center justify-center"
                    >
                        <Typography className="text-center">Epsilon is undergoing redesign until March 2025. Please excuse our appearance.</Typography>
                        <button
                            onClick={() => setDesignBanner(false)}
                            className="absolute right-5"
                        >
                            <i className="bx bx-x bx-md"></i>
                        </button>
                    </div>
                )}
            </Suspense>
        </div>
    );
};

export default Pages;
