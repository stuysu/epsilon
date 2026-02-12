import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Catalog from "./pages/Catalog";
import CharterForm from "./pages/CharterForm";
import CharterLanding from "./pages/CharterLanding";
import Regulations from "./pages/Regulations";
import Archives from "./pages/Archives";
import Support from "./pages/Support";

const StuyActivitiesRoutes = () => {
    return (
        <Routes>
            <Route index element={<Catalog />} />
            <Route path="create" element={<CharterForm />} />
            <Route path="charter" element={<CharterLanding />} />
            <Route path="rules" element={<Regulations />} />
            <Route path="archives" element={<Archives />} />
            <Route path="support" element={<Support />} />
            <Route path="*" element={<Navigate to="/stuyactivities" replace />} />
        </Routes>
    );
};

export default StuyActivitiesRoutes;
