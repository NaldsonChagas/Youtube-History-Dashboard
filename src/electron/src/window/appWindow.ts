import { BrowserWindow } from "electron";

export function createAppWindow(port: number, preloadPath: string): BrowserWindow {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
  });
  win.loadURL(`http://localhost:${port}`);
  return win;
}
