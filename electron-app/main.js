const { app, BrowserWindow } = require("electron");
const path = require("path");
const express = require("express");
const getPort = require("get-port");
const isDev = !app.isPackaged;

const TARGET = process.env.ELECTRON_TARGET || "ui"; // 기본값: ui

const startExpressServer = async () => {
  return new Promise(async (resolve) => {
    const server = express();
    const staticPath = isDev
      ? path.join(__dirname, `../${TARGET}/.output/public`)
      : path.join(process.resourcesPath, `public`);

    server.use("/", express.static(staticPath));

    const port = await getPort({ port: getPort.makeRange(5000, 6000) });
    server.listen(port, "127.0.0.1", () => {
      console.log(`${TARGET} served on http://127.0.0.1:${port}`);
      resolve(`http://127.0.0.1:${port}`);
    });
  });
};

const createWindow = (url) => {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  win.loadURL(url);
  win.webContents.openDevTools({ mode: "detach" });
};

app.whenReady().then(async () => {
  const url = await startExpressServer();
  createWindow(url);
});

/** 
 * 맥에서 앱 완전 종료 시키는 코드 
 * - 슬랙이나 디스코드는 완전 종료안되고 백그라운드에서 살아 있으므로 quit하지 않음
 * app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) */
