import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Calendar from "../calendar";
import SpecialEvents from "./SpecialEvents";

const Schedule = () => (
    <Routes>
        <Route index element={<Navigate to="calendar" replace />} />
        <Route path="calendar" Component={Calendar} />
        <Route path="special-events" Component={SpecialEvents} />
        <Route path="*" element={<Navigate to="calendar" replace />} />
    </Routes>
);

export default Schedule;
