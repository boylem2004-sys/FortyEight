import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import { sharedIgnores, sharedRules } from "./base.js";

/** For the Next.js app. Includes React, hooks, a11y, and Next rules. */
export default defineConfig([
  sharedIgnores,
  ...nextVitals,
  ...nextTs,
  { rules: sharedRules },
  prettier,
]);
