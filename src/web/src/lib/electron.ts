declare global {
  interface Window {
    electron?: { openExternal(url: string): Promise<void> };
  }
}

export function isElectron(): boolean {
  return (
    typeof navigator === "object" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.includes("Electron")
  );
}

export function openInSystemBrowser(url: string): void {
  if (window.electron?.openExternal) {
    void window.electron.openExternal(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
