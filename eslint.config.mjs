import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
    { ignores: ["build/**"] },
    ...tseslint.configs.recommended,
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
);
