import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig(
    { ignores: ["build/**"] },
    tseslint.configs.recommended,
    {
        plugins: { "react-hooks": reactHooks },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { ignoreRestSiblings: true },
            ],
            "prefer-const": "warn",
        },
    },
    // global type declarations, used without imports
    {
        files: ["src/types/**"],
        rules: { "@typescript-eslint/no-unused-vars": "off" },
    },
);
