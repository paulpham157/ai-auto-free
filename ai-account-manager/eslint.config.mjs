import { createEslintConfig } from "@eslint/eslintrc";
import eslintConfigNext from "eslint-config-next";

export default await createEslintConfig({
  baseConfig: {
    ...eslintConfigNext,
    // Add additional configuration options here
  },
  ignores: [],
});
