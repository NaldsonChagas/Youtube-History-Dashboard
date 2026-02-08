import flatpickr from "flatpickr";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import {
  getStatsByHour,
  getStatsByMonth,
  getStatsByWeekday,
  getStatsChannels,
  getStatsOverview,
} from "../lib/api.js";
import { formatDate } from "../lib/format.js";
import { requireImportData } from "../lib/guards.js";
import { applyTheme, initTheme, setStoredTheme } from "../lib/theme.js";
import type { ChannelCount, HourCount, MonthCount, WeekdayCount } from "../types.js";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CHART_COLOR = {
  backgroundColor: "rgba(204, 0, 0, 0.7)",
  borderColor: "rgb(204, 0, 0)",
  fillBackground: "rgba(204, 0, 0, 0.1)",
};

function getChartThemeColors(): { tickColor: string; gridColor: string } {
  const isDark = document.documentElement.classList.contains("dark");
  return isDark
    ? { tickColor: "#9ca3af", gridColor: "#374151" }
    : { tickColor: "#6b7280", gridColor: "#e5e7eb" };
}

function destroyChart(canvasId: string): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const chart = Chart.getChart(canvas);
  if (chart) chart.destroy();
}

function renderChannelsChart(data: ChannelCount[]): void {
  destroyChart("chart-channels");
  const canvas = document.getElementById("chart-channels") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const slice = data.slice(0, 15);
  const { tickColor, gridColor } = getChartThemeColors();
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: slice.map((d) => d.channelName),
      datasets: [
        {
          label: "Visualizações",
          data: slice.map((d) => d.count),
          backgroundColor: CHART_COLOR.backgroundColor,
          borderColor: CHART_COLOR.borderColor,
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: tickColor }, grid: { color: gridColor } },
        y: { ticks: { color: tickColor }, grid: { color: gridColor } },
      },
    },
  });
}

function renderByHourChart(data: HourCount[]): void {
  destroyChart("chart-by-hour");
  const canvas = document.getElementById("chart-by-hour") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const byHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: data.find((d) => d.hour === i)?.count ?? 0,
  }));
  const { tickColor, gridColor } = getChartThemeColors();
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: byHour.map((d) => `${d.hour}h`),
      datasets: [
        {
          label: "Visualizações",
          data: byHour.map((d) => d.count),
          backgroundColor: CHART_COLOR.backgroundColor,
          borderColor: CHART_COLOR.borderColor,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: tickColor }, grid: { color: gridColor } },
        y: { ticks: { color: tickColor }, grid: { color: gridColor } },
      },
    },
  });
}

function renderByWeekdayChart(data: WeekdayCount[]): void {
  destroyChart("chart-by-weekday");
  const canvas = document.getElementById("chart-by-weekday") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const byDay = WEEKDAY_LABELS.map((_, i) => ({
    weekday: i,
    count: data.find((d) => d.weekday === i)?.count ?? 0,
  }));
  const { tickColor, gridColor } = getChartThemeColors();
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: WEEKDAY_LABELS,
      datasets: [
        {
          label: "Visualizações",
          data: byDay.map((d) => d.count),
          backgroundColor: CHART_COLOR.backgroundColor,
          borderColor: CHART_COLOR.borderColor,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: tickColor }, grid: { color: gridColor } },
        y: { ticks: { color: tickColor }, grid: { color: gridColor } },
      },
    },
  });
}

function renderByMonthChart(data: MonthCount[]): void {
  destroyChart("chart-by-month");
  const canvas = document.getElementById("chart-by-month") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const labels = data.map((d) => `${String(d.month).padStart(2, "0")}/${d.year}`);
  const { tickColor, gridColor } = getChartThemeColors();
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Visualizações",
          data: data.map((d) => d.count),
          borderColor: CHART_COLOR.borderColor,
          backgroundColor: CHART_COLOR.fillBackground,
          fill: true,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: tickColor }, grid: { color: gridColor } },
        y: { ticks: { color: tickColor }, grid: { color: gridColor } },
      },
    },
  });
}

interface DashboardState {
  filterFrom: string;
  filterTo: string;
  theme: "dark" | "light";
  totalViews: number | null;
  uniqueChannels: number | null;
  firstWatched: string | null;
  lastWatched: string | null;
  loadError: boolean;
  dateRangeError: boolean;
  dateFutureError: boolean;
  getFilters(): { from?: string; to?: string };
  toggleTheme(): void;
  displayOverview(): void;
  loadDashboard(): Promise<void>;
  init(): Promise<void>;
}

export function registerDashboard(): void {
  Alpine.data("dashboard", (): DashboardState => ({
    filterFrom: "",
    filterTo: "",
    theme: initTheme(),
    totalViews: null,
    uniqueChannels: null,
    firstWatched: null,
    lastWatched: null,
    loadError: false,
    dateRangeError: false,
    dateFutureError: false,

    getFilters(): { from?: string; to?: string } {
      const params: { from?: string; to?: string } = {};
      if (this.filterFrom) params.from = this.filterFrom;
      if (this.filterTo) params.to = this.filterTo;
      return params;
    },

    toggleTheme(): void {
      this.theme = this.theme === "dark" ? "light" : "dark";
      setStoredTheme(this.theme);
      applyTheme(this.theme);
      this.loadDashboard();
    },

    displayOverview(): void {
      const elTotal = document.getElementById("stat-total-views");
      const elChannels = document.getElementById("stat-unique-channels");
      const elFirst = document.getElementById("stat-first-watched");
      const elLast = document.getElementById("stat-last-watched");
      if (this.loadError && elTotal) {
        elTotal.textContent = "Erro ao carregar";
        return;
      }
      if (elTotal) elTotal.textContent = this.totalViews != null ? this.totalViews.toLocaleString("pt-BR") : "–";
      if (elChannels) elChannels.textContent = this.uniqueChannels != null ? this.uniqueChannels.toLocaleString("pt-BR") : "–";
      if (elFirst) elFirst.textContent = formatDate(this.firstWatched);
      if (elLast) elLast.textContent = formatDate(this.lastWatched);
    },

    async loadDashboard(): Promise<void> {
      this.loadError = false;
      this.dateRangeError = false;
      this.dateFutureError = false;
      const today = new Date().toISOString().slice(0, 10);
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
      const params = this.getFilters();
      try {
        const overview = await getStatsOverview(params);
        this.totalViews = overview.totalViews;
        this.uniqueChannels = overview.uniqueChannels;
        this.firstWatched = overview.firstWatched;
        this.lastWatched = overview.lastWatched;
        this.displayOverview();

        const [channels, byHour, byWeekday, byMonth] = await Promise.all([
          getStatsChannels({ ...params, limit: 15 }),
          getStatsByHour(params),
          getStatsByWeekday(params),
          getStatsByMonth(params),
        ]);
        renderChannelsChart(channels);
        renderByHourChart(byHour);
        renderByWeekdayChart(byWeekday);
        renderByMonthChart(byMonth);
      } catch (err) {
        console.error(err);
        this.loadError = true;
        this.displayOverview();
      }
    },

    async init(): Promise<void> {
      if (!(await requireImportData())) return;
      this.loadDashboard();
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
  } as DashboardState));
}

document.addEventListener("alpine:init", () => registerDashboard());
