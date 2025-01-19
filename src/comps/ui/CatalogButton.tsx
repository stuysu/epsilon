import { useNavigate } from "react-router-dom";
import "./UnauthenticatedButtons.css";

export default function CatalogButton() {
    const navigate = useNavigate();

    return (
        <button
            className="button"
            style={{ textDecoration: "none", marginTop: 20 }}
            onClick={() => navigate("/catalog")}
        >
            View Catalog
        </button>
    );
}