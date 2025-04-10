import { useNavigate } from "react-router-dom";
import "./UnauthenticatedButtons.css";

export default function CatalogButton() {
    const navigate = useNavigate();

    return (
        <button
            style={{ textDecoration: "underline", marginTop: 30 }}
            onClick={() => navigate("/catalog")}
        >
            Browse StuyActivities
        </button>
    );
}
