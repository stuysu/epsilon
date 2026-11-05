import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "REACT_APP_");

    return {
        plugins: [react()],
        envPrefix: "REACT_APP_",
        // the app reads its settings from process.env, which browsers don't have
        define: {
            "process.env": JSON.stringify({
                ...env,
                NODE_ENV: mode === "production" ? "production" : "development",
            }),
        },
        server: { port: Number(process.env.PORT) || 3000 },
        build: { outDir: process.env.BUILD_PATH || "build", emptyOutDir: true },
        test: { environment: "jsdom", globals: true },
    };
});
