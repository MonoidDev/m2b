import eslint from "@eslint/js";
import eslintPluginImportX from "eslint-plugin-import-x";
import globals from "globals";
import * as tseslint from "typescript-eslint";

import m2b from "m2b-infra/eslint-plugin";

export default tseslint.config([
  {
    ignores: ["**/dist/"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  {
    plugins: { m2b },
    languageOptions: { globals: globals.nodeBuiltin },
    rules: {
      "import-x/default": "off",
      "import-x/no-named-as-default-member": "off",
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          pathGroups: [
            {
              pattern: "@(react|react-native)",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import-x/no-relative-packages": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "m2b/enforce-hash-imports": "error",
      "m2b/no-console-log":
        process.env.NODE_ENV === "production" ? "error" : "warn",
    },
  },
]);
