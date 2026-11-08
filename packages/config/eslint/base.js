import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

/** Shared rules that every package uses on top of its preset. */
export const sharedRules = {
  "@typescript-eslint/no-unused-vars": [
    "error",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
  ],
  "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
  "no-console": ["warn", { allow: ["warn", "error"] }],
};

export const sharedIgnores = globalIgnores([
  "**/node_modules/**",
  "**/dist/**",
  "**/.next/**",
  "**/.turbo/**",
  "**/coverage/**",
  "**/playwright-report/**",
  "**/test-results/**",
  "**/next-env.d.ts",
]);

/** For plain TypeScript packages (core, api-client, db). */
export default defineConfig([
  sharedIgnores,
  js.configs.recommended,
  tseslint.configs.recommended,
  { rules: sharedRules },
  prettier,
]);
