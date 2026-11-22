import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "../../components/ui/content/Loading";
import LoginGate from "../../components/ui/content/LoginGate";
import Catalog from "./Catalog";
import Detail from "./Detail";
import Discover from "./Discover";
import { OpportunitiesProvider } from "./OpportunitiesContext";
import Saved from "./Saved";

const Admin = lazy(() => import("./admin"));

const OpportunitiesRouter = () => (
    <LoginGate page="browse opportunities">
        <OpportunitiesProvider>
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route index Component={Discover} />
                    <Route path="catalog" Component={Catalog} />
                    <Route path="saved" Component={Saved} />
                    <Route path="admin" Component={Admin} />
                    <Route path=":id" Component={Detail} />
                </Routes>
            </Suspense>
        </OpportunitiesProvider>
    </LoginGate>
);

export default OpportunitiesRouter;
