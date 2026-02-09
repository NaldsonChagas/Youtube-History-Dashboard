import { getImportStatus, getServerInfo, importHistory } from "../lib/api.js";
import { isElectron, openInSystemBrowser } from "../lib/electron.js";
import { t } from "../lib/i18n.js";
import { applyTheme, initTheme, setStoredTheme } from "../lib/theme.js";

type Theme = "dark" | "light";

interface SetupState {
  theme: Theme;
  file: File | null;
  error: string;
  loading: boolean;
  networkUrl: string | null;
  toggleTheme: () => void;
  onFileChange: (e: Event) => void;
  confirm: () => Promise<void>;
  init: () => Promise<void>;
  dismissToast: () => void;
  openInSystemBrowser: (url: string) => void;
}

function registerSetup(): void {
  const theme = initTheme();
  Alpine.data(
    "setup",
    (): SetupState => ({
      theme,
      file: null,
      error: "",
      loading: false,
      networkUrl: null,

      toggleTheme(): void {
        this.theme = this.theme === "dark" ? "light" : "dark";
        setStoredTheme(this.theme);
        applyTheme(this.theme);
      },

      onFileChange(e: Event): void {
        const input = e.target as HTMLInputElement;
        this.file = input.files?.[0] ?? null;
        this.error = "";
      },

      async confirm(): Promise<void> {
        if (!this.file) {
          this.error = t("setup.selectFile");
          return;
        }
        this.loading = true;
        this.error = "";
        try {
          const html = await this.file.text();
          await importHistory(html);
          window.location.href = "/dashboard";
        } catch (err) {
          this.error = err instanceof Error ? err.message : t("setup.importFailed");
        } finally {
          this.loading = false;
        }
      },

      dismissToast(): void {
        this.networkUrl = null;
      },

      openInSystemBrowser,

      async init(): Promise<void> {
        try {
          const status = await getImportStatus();
          if (status.hasData) {
            window.location.href = "/dashboard";
          }
        } catch {
          void 0;
        }
        if (isElectron()) {
          try {
            const info = await getServerInfo();
            if (info.baseUrl) {
              this.networkUrl = info.baseUrl;
            }
          } catch {
            void 0;
          }
        }
      },
    })
  );
}

document.addEventListener("alpine:init", () => registerSetup());
