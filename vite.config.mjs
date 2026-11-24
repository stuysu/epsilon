import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const VENDOR_CHUNKS = [
    [
        "react",
        /node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//,
    ],
    ["supabase", /node_modules\/@supabase\//],
    ["motion", /node_modules\/(framer-motion|motion-dom|motion-utils)\//],
    ["radix", /node_modules\/(@radix-ui|radix-ui)\//],
];

export default defineConfig(({ command, mode, isPreview }) => {
    const env = loadEnv(mode, process.cwd(), "REACT_APP_");

    /* without REACT_APP_SUPABASE_URL the app falls back to production
       (src/config/constants.ts); only Netlify builds may rely on that */
    if (!env.REACT_APP_SUPABASE_URL && !isPreview) {
        const allowed =
            process.env.NETLIFY === "true" ||
            env.REACT_APP_ALLOW_PROD_DB === "true";
        if (command === "build" && !allowed) {
            throw new Error(
                "REACT_APP_SUPABASE_URL is not set, so this build would use the production database. Set it (see .env.example), or set REACT_APP_ALLOW_PROD_DB=true if you mean production.",
            );
        }
        if (command === "serve" && mode !== "test") {
            console.warn(
                env.REACT_APP_ALLOW_PROD_DB === "true"
                    ? "\nWarning: REACT_APP_SUPABASE_URL is not set, so the app is using the production database.\n"
                    : "\nWarning: REACT_APP_SUPABASE_URL is not set, so the app would use the production database and won't load. Set it (see .env.example).\n",
            );
        }
    }

    return {
        plugins: [react(), tailwindcss()],
        // the editor breaks if a second copy of Lexical is bundled
        resolve: { dedupe: ["lexical", "@lexical/list"] },
        envPrefix: "REACT_APP_",
        // the app reads its settings from process.env, which browsers don't have
        define: {
            "process.env": JSON.stringify({
                ...env,
                NODE_ENV: mode === "production" ? "production" : "development",
            }),
        },
        server: { port: Number(process.env.PORT) || 3000 },
        // unit tests for pure helpers: npm test
        test: {
            include: ["src/**/*.test.ts"],
            environment: "node",
        },
        build: {
            outDir: process.env.BUILD_PATH || "build",
            emptyOutDir: true,
            rolldownOptions: {
                output: {
                    // big libraries change rarely, so they get their own cacheable files
                    codeSplitting: {
                        groups: VENDOR_CHUNKS.map(([name, test]) => ({
                            name,
                            test,
                        })),
                    },
                },
            },
        },
    };
});
