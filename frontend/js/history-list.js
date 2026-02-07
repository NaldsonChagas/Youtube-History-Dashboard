import { getHistory, getStatsChannels } from './api.js';

const PAGE_SIZE = 50;
let currentPage = 1;
let totalItems = 0;
let channels = [];

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function videoUrl(item) {
  if (item.video_id) {
    return `https://www.youtube.com/watch?v=${item.video_id}`;
  }
  return item.source_url || '#';
}

function renderRows(items) {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = items
    .map(
      (item) => `
    <tr class="bg-gray-800/50 hover:bg-gray-800">
      <td class="px-4 py-3 text-gray-300 whitespace-nowrap">${formatDate(item.watched_at)}</td>
      <td class="px-4 py-3 text-white max-w-md truncate" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</td>
      <td class="px-4 py-3 text-gray-300">${escapeHtml(item.channel_name)}</td>
      <td class="px-4 py-3"><a href="${videoUrl(item)}" target="_blank" rel="noopener" class="text-indigo-400 hover:underline">Abrir</a></td>
    </tr>
  `
    )
    .join('');
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const div = document.getElementById('pagination');
  if (totalPages <= 1) {
    div.innerHTML = '';
    return;
  }
  let html = '';
  if (currentPage > 1) {
    html += `<button data-page="${currentPage - 1}" class="pagination-btn bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">Anterior</button>`;
  }
  html += `<span class="text-gray-400 px-2">Página ${currentPage} de ${totalPages}</span>`;
  if (currentPage < totalPages) {
    html += `<button data-page="${currentPage + 1}" class="pagination-btn bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">Próxima</button>`;
  }
  div.innerHTML = html;
  div.querySelectorAll('.pagination-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page, 10);
      loadPage();
    });
  });
}

function getFilters() {
  const from = document.getElementById('filter-from').value || undefined;
  const to = document.getElementById('filter-to').value || undefined;
  const channelId = document.getElementById('filter-channel').value || undefined;
  return { from, to, channel_id: channelId };
}

async function loadPage() {
  document.getElementById('loading').classList.remove('hidden');
  try {
    const filters = getFilters();
    const result = await getHistory({
      page: currentPage,
      limit: PAGE_SIZE,
      ...filters,
    });
    totalItems = result.total;
    renderRows(result.items);
    renderPagination();
  } catch (err) {
    console.error(err);
    document.getElementById('table-body').innerHTML =
      '<tr><td colspan="4" class="px-4 py-8 text-center text-red-400">Erro ao carregar.</td></tr>';
  } finally {
    document.getElementById('loading').classList.add('hidden');
  }
}

async function loadChannelsFilter() {
  try {
    channels = await getStatsChannels({ limit: 500 });
    const select = document.getElementById('filter-channel');
    channels.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.channel_id;
      opt.textContent = c.channel_name;
      select.appendChild(opt);
    });
  } catch (_) {
    // keep "Todos" only
  }
}

document.getElementById('btn-apply').addEventListener('click', () => {
  currentPage = 1;
  loadPage();
});

loadChannelsFilter().then(() => loadPage());
