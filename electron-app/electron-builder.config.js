const TARGET = process.env.ELECTRON_TARGET || "ui";

module.exports = {
  appId: `com.bynd.desktop-app.${TARGET}`,
  productName: `Bynd-${TARGET}`,
  copyright: "Copyright © 2025 Bynd",
  directories: {
    buildResources: "assets",
    output: `dist/${TARGET}`,
  },
  files: ["main.js", `../${TARGET}/.output/public/**/*`],
  extraResources: [
    {
      from: `../${TARGET}/.output/public`,
      to: `public`,
    },
  ],
  mac: {
    target: ["dmg", "zip"],
  },
  win: {
    target: ["nsis", "zip"],
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
};
