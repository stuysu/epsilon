import { PUBLIC_URL } from "../constants";
import { Helmet } from "react-helmet";
import Loading from "../comps/ui/Loading";

import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";

// Pages
import Home from "./Home";
import AllMeetings from "./AllMeetings";
import NavBar from "../comps/ui/NavBar";
const Catalog = lazy(() => import("./Catalog"));
const Create = lazy(() => import("./Create"));
const OrgRouter = lazy(() => import("./orgs"));
const AdminRouter = lazy(() => import("./admin"));

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
          <Route path={"/create"} Component={Create} />
          <Route path={"/meetings"} Component={AllMeetings} />
          <Route path={"/admin/*"} Component={AdminRouter} />
          <Route path={"/:orgUrl/*"} Component={OrgRouter} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default Pages;
