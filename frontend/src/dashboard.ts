import {
  getStatsByHour,
  getStatsByMonth,
  getStatsByWeekday,
  getStatsChannels,
  getStatsOverview,
} from "./api.js";
import { formatDate } from "./format.js";
import type { ChannelCount, HourCount, MonthCount, WeekdayCount } from "./types.js";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: slice.map((d) => d.channel_name),
      datasets: [
        {
          label: "Visualizações",
          data: slice.map((d) => d.count),
          backgroundColor: "rgba(99, 102, 241, 0.7)",
          borderColor: "rgb(99, 102, 241)",
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
        x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
        y: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
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
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: byHour.map((d) => `${d.hour}h`),
      datasets: [
        {
          label: "Visualizações",
          data: byHour.map((d) => d.count),
          backgroundColor: "rgba(99, 102, 241, 0.7)",
          borderColor: "rgb(99, 102, 241)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
        y: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
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
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: WEEKDAY_LABELS,
      datasets: [
        {
          label: "Visualizações",
          data: byDay.map((d) => d.count),
          backgroundColor: "rgba(99, 102, 241, 0.7)",
          borderColor: "rgb(99, 102, 241)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
        y: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
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
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Visualizações",
          data: data.map((d) => d.count),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
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
        x: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
        y: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
      },
    },
  });
}

interface DashboardState {
  filterFrom: string;
  filterTo: string;
  totalViews: number | null;
  uniqueChannels: number | null;
  firstWatched: string | null;
  lastWatched: string | null;
  loadError: boolean;
  getFilters(): { from?: string; to?: string };
  displayOverview(): void;
  loadDashboard(): Promise<void>;
  init(): void;
}

export function registerDashboard(): void {
  Alpine.data("dashboard", (): DashboardState => ({
    filterFrom: "",
    filterTo: "",
    totalViews: null,
    uniqueChannels: null,
    firstWatched: null,
    lastWatched: null,
    loadError: false,

    getFilters(): { from?: string; to?: string } {
      const params: { from?: string; to?: string } = {};
      if (this.filterFrom) params.from = this.filterFrom;
      if (this.filterTo) params.to = this.filterTo;
      return params;
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

    init(): void {
      this.loadDashboard();
    },
  } as DashboardState));
}

document.addEventListener("alpine:init", () => registerDashboard());
