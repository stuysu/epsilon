import { useNavigate } from "react-router-dom";
import "./UnauthenticatedButtons.css";
import { useState } from "react";

export default function CatalogButton() {
    const navigate = useNavigate();
    const [hover, setHover] = useState(false);

    return (
        <button
            style={{
                textDecoration: "underline",
                marginTop: 30,
                opacity: hover ? 0.75 : 1,
                transition: "opacity 0.2s ease",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => navigate("/catalog")}
        >
            Browse StuyActivities
        </button>
    );
}
