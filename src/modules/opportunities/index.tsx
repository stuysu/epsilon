import React from "react";
import { Helmet } from "react-helmet";
import { Navigate, Route, Routes } from "react-router-dom";
import Discover from "./pages/Discover";
import { opportunityQuickLinks, opportunityTags } from "./data";
import ContentUnavailable from "../../components/ui/content/ContentUnavailable";
import Catalog from "./pages/Catalog";

const OpportunitiesBlankPage = () => {
    return (
        <ContentUnavailable
            title="Opportunities await."
            description="The Epsilon team is hard at work to complete the Opportunities module."
        />
    );
};

const OpportunitiesIndex = () => {
    return (
        <div className="relative min-h-screen bg-bg -mb-20">
            <Helmet>
                <title>Opportunities - Epsilon</title>
                <meta
                    name="description"
                    content="The largest compendium of opportunities for Stuyvesant students to learn, grow, and explore."
                />
            </Helmet>

            <Routes>
                <Route
                    index
                    element={
                        <Discover
                            quickLinks={opportunityQuickLinks}
                            tags={opportunityTags}
                        />
                    }
                />
                <Route
                    path="discover"
                    element={
                        <Discover
                            quickLinks={opportunityQuickLinks}
                            tags={opportunityTags}
                        />
                    }
                />
                <Route path="catalog" element={<Catalog />} />
                <Route
                    path="my-opportunities"
                    element={<OpportunitiesBlankPage />}
                />
                <Route path="advertise" element={<OpportunitiesBlankPage />} />
                <Route
                    path="*"
                    element={<Navigate to="/opportunities" replace />}
                />
            </Routes>
        </div>
    );
};

export default OpportunitiesIndex;
