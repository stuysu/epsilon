import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import CreditsPage from "./pages/Credits";
import ContentUnavailable from "../../components/ui/content/ContentUnavailable";

const AboutBlankPage = () => {
    return (
        <ContentUnavailable
            title="It's right around the corner!"
            description="The Epsilon team is hard at work. This feature will be coming soon!"
        />
    );
};

const AboutModuleRoutes = () => {
    return (
        <Routes>
            <Route index element={<CreditsPage />} />
            <Route path="credits" element={<CreditsPage />} />
            <Route path="join-us" element={<AboutBlankPage />} />
            <Route path="design" element={<AboutBlankPage />} />
            <Route path="epsilon-support" element={<AboutBlankPage />} />
            <Route path="blog" element={<AboutBlankPage />} />
            <Route path="our-services" element={<AboutBlankPage />} />
            <Route path="*" element={<Navigate to="/about" replace />} />
        </Routes>
    );
};

export default AboutModuleRoutes;
