import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { reloadOnce } from "./components/RouteErrorBoundary";

// a lazy page's files went missing in a deploy; otherwise the error boundary shows it
window.addEventListener("vite:preloadError", (event) => {
    if (reloadOnce()) event.preventDefault();
});

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);
root.render(<App />);
