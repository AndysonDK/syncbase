const tsGlob = "*.ts?(x)";

module.exports = {
  "*.css": "stylelint --fix",
  "*.{json,md,yml}": "prettier --write",
  "*.{js,ts,tsx,graphql}": () => "eslint . --fix",
  [`packages/server/src/**/${tsGlob}`]: () =>
    "yarn workspace @syncbase/server typecheck",
  [`packages/web/src/**/${tsGlob}`]: () =>
    "yarn workspace @syncbase/web typecheck",
};
