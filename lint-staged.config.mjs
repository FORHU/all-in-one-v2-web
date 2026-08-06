/** @type {import('lint-staged').Config} */
export default {
  // TypeScript / TSX — lint then format (--log-level warn keeps hooks silent on success)
  // next-env.d.ts is excluded: eslint.config.mjs already ignores it globally,
  // so linting it directly here only produces a "file ignored" warning,
  // which trips --max-warnings=0.
  "*.{ts,tsx}": (filenames) => {
    const files = filenames
      .filter((f) => !f.endsWith("next-env.d.ts"))
      .map((f) => `"${f}"`);
    if (files.length === 0) return [];
    return [
      `eslint --fix --max-warnings=0 ${files.join(" ")}`,
      `prettier --write --log-level warn ${files.join(" ")}`,
    ];
  },

  // JavaScript — format only
  "*.{js,mjs,cjs}": ["prettier --write --log-level warn"],

  // Styles, JSON, Markdown, YAML — format only
  "*.{css,json,md,yml,yaml}": ["prettier --write --log-level warn"],
};
