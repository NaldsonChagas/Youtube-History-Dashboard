import { getHistory, getStatsChannels } from "./api.js";
import { formatDate } from "./format.js";
import type { ChannelCount, HistoryItem } from "./types.js";

const PAGE_SIZE = 50;

function videoUrlForItem(item: HistoryItem): string {
  if (item.video_id) {
    return `https://www.youtube.com/watch?v=${item.video_id}`;
  }
  return item.source_url ?? "#";
}

interface HistoryListState {
  filterChannel: string;
  filterFrom: string;
  filterTo: string;
  currentPage: number;
  totalItems: number;
  items: HistoryItem[];
  channels: ChannelCount[];
  loading: boolean;
  loadError: boolean;
  pageSize: number;
  get totalPages(): number;
  getFilters(): { from?: string; to?: string; channel_id?: string };
  videoUrl(item: HistoryItem): string;
  formattedDate(iso: string | null | undefined): string;
  loadChannels(): Promise<void>;
  loadPage(): Promise<void>;
  applyFilters(): void;
  goToPage(page: number): void;
  init(): Promise<void>;
}

export function registerHistoryList(): void {
  Alpine.data("historyList", (): HistoryListState => ({
    filterChannel: "",
    filterFrom: "",
    filterTo: "",
    currentPage: 1,
    totalItems: 0,
    items: [],
    channels: [],
    loading: false,
    loadError: false,
    pageSize: PAGE_SIZE,

    get totalPages(): number {
      return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    },

    getFilters(): { from?: string; to?: string; channel_id?: string } {
      const params: { from?: string; to?: string; channel_id?: string } = {};
      if (this.filterFrom) params.from = this.filterFrom;
      if (this.filterTo) params.to = this.filterTo;
      if (this.filterChannel) params.channel_id = this.filterChannel;
      return params;
    },

    videoUrl(item: HistoryItem): string {
      return videoUrlForItem(item);
    },

    formattedDate(iso: string | null | undefined): string {
      return formatDate(iso);
    },

    async loadChannels(): Promise<void> {
      try {
        this.channels = await getStatsChannels({ limit: 500 });
      } catch {
        this.channels = [];
      }
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
      this.currentPage = 1;
      this.loadPage();
    },

    goToPage(page: number): void {
      this.currentPage = page;
      this.loadPage();
    },

    async init(): Promise<void> {
      await this.loadChannels();
      await this.loadPage();
    },
  } as HistoryListState));
}

document.addEventListener("alpine:init", () => registerHistoryList());
