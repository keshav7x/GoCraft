import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginNext from "@next/eslint-plugin-next";
import globals from "globals";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const tsPreset = require.resolve("@babel/preset-typescript");

/** Temporary TSX lint pass — reuses the repo's own plugins/parser. Deleted after use. */
export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    languageOptions: {
      globals: { ...globals.browser },
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        filename: "/gocraft-lint/virtual.tsx",
        babelOptions: {
          presets: [tsPreset],
        },
      },
    },
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },
  {
    ...pluginReactHooks.configs.flat.recommended,
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { onlyWarn },
  },
];
