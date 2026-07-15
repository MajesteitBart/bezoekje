import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Dialogs intentionally reset local form state when they open. This is
      // an established project pattern and is not a render-loop risk here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Delivery-agent runtime files are validated by their own scripts and are
    // not part of the Next.js application lint surface.
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
