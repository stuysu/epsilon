import { Navigate, Route, Routes } from "react-router-dom";
import LoginGate from "../../components/ui/content/LoginGate";
import AdvertiseOpportunity from "./pages/Advertise";
import OpportunityCatalog from "./pages/Catalog";
import OpportunityDiscover from "./pages/Discover";
import MyOpportunities from "./pages/MyOpportunities";

export default function Opportunities() {
    return (
        <Routes>
            <Route index element={<OpportunityDiscover />} />
            <Route
                path="catalog"
                element={
                    <LoginGate page="browse Opportunities">
                        <OpportunityCatalog />
                    </LoginGate>
                }
            />
            <Route
                path="mine"
                element={
                    <LoginGate page="view your Opportunities">
                        <MyOpportunities />
                    </LoginGate>
                }
            />
            <Route
                path="advertise"
                element={
                    <LoginGate page="advertise an Opportunity">
                        <AdvertiseOpportunity />
                    </LoginGate>
                }
            />
            <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
    );
}
