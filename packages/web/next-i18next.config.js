const path = require("path");

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de"],
  },
  reloadOnPrerender: process.env.NODE_ENV === "development",
  localePath: path.resolve("./locales"),
  fallbackLng: false,
};
