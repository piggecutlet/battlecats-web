import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import perfectionist from "eslint-plugin-perfectionist";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // 以下は ESLint がデフォルトで除外
    // ソース: node_modules\.pnpm\eslint@9.39.4\node_modules\eslint\lib\config\default-config.js#L66
    // ドキュメント: https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignore-files-with-ignores
    "node_modules/**",

    // 以下は eslint-config-next がデフォルトで除外
    // ソース: node_modules/eslint-config-next/dist/index.js#L209
    // ドキュメント: https://nextjs.org/docs/app/api-reference/config/eslint
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // 自然順でソート
  // ドキュメント: https://perfectionist.dev/configs/recommended-natural
  perfectionist.configs["recommended-natural"],
]);

export default eslintConfig;
