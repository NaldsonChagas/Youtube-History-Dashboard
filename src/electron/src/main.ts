import { app as electronApp, ipcMain, shell } from "electron";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { getAppPaths } from "./config/paths.js";
import { startApiServer } from "./server/apiServer.js";
import { createAppWindow } from "./window/appWindow.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..", "..");
const preloadPath = join(__dirname, "preload.js");

ipcMain.handle("open-external", (_event, url: string) => shell.openExternal(url));

async function run(): Promise<void> {
  await electronApp.whenReady();
  const userData = electronApp.getPath("userData");
  const paths = getAppPaths(userData, PROJECT_ROOT);

  const { app: apiApp, port } = await startApiServer({
    paths,
    projectRoot: PROJECT_ROOT,
  });

  const win = createAppWindow(port, preloadPath);
  win.on("closed", () => {
    apiApp.close().then(() => electronApp.quit());
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
