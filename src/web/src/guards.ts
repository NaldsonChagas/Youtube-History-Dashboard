import { getImportStatus } from "./api.js";

export async function requireImportData(): Promise<boolean> {
  try {
    const status = await getImportStatus();
    if (!status.hasData) {
      window.location.href = "/";
      return false;
    }
    return true;
  } catch {
    window.location.href = "/";
    return false;
  }
}
