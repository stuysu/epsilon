import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import CalendarPage from "./pages/Calendar";
import ContentUnavailable from "../../components/ui/content/ContentUnavailable";

const ScheduleBlankPage = () => {
    return (
        <ContentUnavailable
            title="No Events"
            description="Nothing here, yet!"
        />
    );
};

const ScheduleRoutes = () => {
    return (
        <Routes>
            <Route index element={<CalendarPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="special-events" element={<ScheduleBlankPage />} />
            <Route path="*" element={<Navigate to="/meetings" replace />} />
        </Routes>
    );
};

export default ScheduleRoutes;
