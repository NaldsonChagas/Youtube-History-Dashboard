import flatpickr from "flatpickr";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import TomSelect from "tom-select";
import { getHistory, getStatsChannels } from "./api.js";
import { formatDate } from "./format.js";
import { requireImportData } from "./guards.js";
import { applyTheme, initTheme, setStoredTheme } from "./theme.js";
import type { HistoryItem } from "./types.js";

const PAGE_SIZE = 50;

function todayYMD(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function videoUrlForItem(item: HistoryItem): string {
  if (item.videoId) {
    return `https://www.youtube.com/watch?v=${item.videoId}`;
  }
  return item.sourceUrl ?? "#";
}

interface HistoryListState {
  filterChannels: string[];
  filterFrom: string;
  filterTo: string;
  theme: "dark" | "light";
  currentPage: number;
  totalItems: number;
  items: HistoryItem[];
  dateRangeError: boolean;
  dateFutureError: boolean;
  loading: boolean;
  loadError: boolean;
  pageSize: number;
  get totalPages(): number;
  getFilters(): { from?: string; to?: string; channelIds?: string[] };
  videoUrl(item: HistoryItem): string;
  formattedDate(iso: string | null | undefined): string;
  toggleTheme(): void;
  loadPage(): Promise<void>;
  applyFilters(): void;
  goToPage(page: number): void;
  init(): Promise<void>;
}

export function registerHistoryList(): void {
  Alpine.data("historyList", (): HistoryListState => ({
    filterChannels: [],
    filterFrom: "",
    filterTo: "",
    theme: initTheme(),
    currentPage: 1,
    totalItems: 0,
    items: [],
    dateRangeError: false,
    dateFutureError: false,
    loading: false,
    loadError: false,
    pageSize: PAGE_SIZE,

    get totalPages(): number {
      return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    },

    getFilters(): { from?: string; to?: string; channelIds?: string[] } {
      const params: { from?: string; to?: string; channelIds?: string[] } = {};
      if (this.filterFrom) params.from = this.filterFrom;
      if (this.filterTo) params.to = this.filterTo;
      if (this.filterChannels.length) params.channelIds = this.filterChannels;
      return params;
    },

    videoUrl(item: HistoryItem): string {
      return videoUrlForItem(item);
    },

    formattedDate(iso: string | null | undefined): string {
      return formatDate(iso);
    },

    toggleTheme(): void {
      this.theme = this.theme === "dark" ? "light" : "dark";
      setStoredTheme(this.theme);
      applyTheme(this.theme);
    },

    async loadPage(): Promise<void> {
      this.loading = true;
      this.loadError = false;
      try {
        const filters = this.getFilters();
        const result = await getHistory({
          page: this.currentPage,
          limit: this.pageSize,
          ...filters,
        });
        this.items = result.items;
        this.totalItems = result.total;
      } catch (err) {
        console.error(err);
        this.loadError = true;
        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    applyFilters(): void {
      this.dateRangeError = false;
      this.dateFutureError = false;
      const today = todayYMD();
      if (this.filterFrom && this.filterFrom > today) {
        this.dateFutureError = true;
        return;
      }
      if (this.filterTo && this.filterTo > today) {
        this.dateFutureError = true;
        return;
      }
      if (this.filterFrom && this.filterTo && this.filterFrom > this.filterTo) {
        this.dateRangeError = true;
        return;
      }
      this.currentPage = 1;
      this.loadPage();
    },

    goToPage(page: number): void {
      this.currentPage = page;
      this.loadPage();
    },

    async init(): Promise<void> {
      if (!(await requireImportData())) return;
      await this.loadPage();
      this.$nextTick(() => {
        const el = this.$refs.channelSelect as HTMLSelectElement | undefined;
        if (!el) return;
        const self = this;
        new TomSelect(el, {
          valueField: "value",
          labelField: "text",
          searchField: ["text"],
          maxOptions: null,
          maxItems: null,
          placeholder: "Digite para buscar canais",
          load: (query: string, callback: (options?: { value: string; text: string }[]) => void) => {
            getStatsChannels({
              search: query,
              limit: 50,
              from: self.filterFrom || undefined,
              to: self.filterTo || undefined,
            })
              .then((channels) =>
                callback(channels.map((ch) => ({ value: ch.channelId, text: ch.channelName })))
              )
              .catch(() => callback());
          },
          shouldLoad: (query: string) => query.length >= 1,
          onChange: (value: string | string[]) => {
            this.filterChannels = Array.isArray(value) ? value : value ? [value] : [];
          },
        });
      });
      this.$nextTick(() => {
        const fromEl = this.$refs.filterFromInput as HTMLInputElement | undefined;
        const toEl = this.$refs.filterToInput as HTMLInputElement | undefined;
        const fpOptions = {
          locale: Portuguese,
          dateFormat: "Y-m-d",
          altInput: true,
          altFormat: "d/m/Y",
          allowInput: false,
          maxDate: "today",
        };
        if (fromEl) {
          flatpickr(fromEl, {
            ...fpOptions,
            defaultDate: this.filterFrom || undefined,
            onChange: (_selected, dateStr) => {
              this.filterFrom = dateStr || "";
            },
          });
        }
        if (toEl) {
          flatpickr(toEl, {
            ...fpOptions,
            defaultDate: this.filterTo || undefined,
            onChange: (_selected, dateStr) => {
              this.filterTo = dateStr || "";
            },
          });
        }
      });
    },
  } as HistoryListState));
}

document.addEventListener("alpine:init", () => registerHistoryList());
