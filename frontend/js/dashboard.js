import {
  getStatsOverview,
  getStatsChannels,
  getStatsByHour,
  getStatsByWeekday,
  getStatsByMonth,
} from './api.js';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDate(iso) {
  if (!iso) return '–';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFilters() {
  const from = document.getElementById('filter-from').value || undefined;
  const to = document.getElementById('filter-to').value || undefined;
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  return params;
}

function destroyChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  const chart = Chart.getChart(canvas);
  if (chart) chart.destroy();
}

async function loadOverview(params) {
  const data = await getStatsOverview(params);
  document.getElementById('stat-total-views').textContent = data.totalViews.toLocaleString('pt-BR');
  document.getElementById('stat-unique-channels').textContent = data.uniqueChannels.toLocaleString('pt-BR');
  document.getElementById('stat-first-watched').textContent = formatDate(data.firstWatched);
  document.getElementById('stat-last-watched').textContent = formatDate(data.lastWatched);
}

function renderChannelsChart(data) {
  destroyChart('chart-channels');
  const ctx = document.getElementById('chart-channels').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.slice(0, 15).map((d) => d.channel_name),
      datasets: [
        {
          label: 'Visualizações',
          data: data.slice(0, 15).map((d) => d.count),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
        y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
      },
    },
  });
}

function renderByHourChart(data) {
  destroyChart('chart-by-hour');
  const byHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: data.find((d) => d.hour === i)?.count ?? 0,
  }));
  const ctx = document.getElementById('chart-by-hour').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: byHour.map((d) => `${d.hour}h`),
      datasets: [
        {
          label: 'Visualizações',
          data: byHour.map((d) => d.count),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
        y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
      },
    },
  });
}

function renderByWeekdayChart(data) {
  destroyChart('chart-by-weekday');
  const byDay = WEEKDAY_LABELS.map((label, i) => ({
    weekday: i,
    count: data.find((d) => d.weekday === i)?.count ?? 0,
  }));
  const ctx = document.getElementById('chart-by-weekday').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: WEEKDAY_LABELS,
      datasets: [
        {
          label: 'Visualizações',
          data: byDay.map((d) => d.count),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
        y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
      },
    },
  });
}

function renderByMonthChart(data) {
  destroyChart('chart-by-month');
  const labels = data.map((d) => `${String(d.month).padStart(2, '0')}/${d.year}`);
  const ctx = document.getElementById('chart-by-month').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Visualizações',
          data: data.map((d) => d.count),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
        y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
      },
    },
  });
}

async function loadDashboard() {
  const params = getFilters();
  try {
    await loadOverview(params);
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
    document.getElementById('stat-total-views').textContent = 'Erro ao carregar';
  }
}

document.getElementById('btn-apply').addEventListener('click', loadDashboard);

loadDashboard();
