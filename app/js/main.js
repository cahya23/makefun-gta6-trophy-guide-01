// Vice Platinum Atlas — boot. Loads the trophy data, wires the tabs, filters,
// spoiler setting, checklist, detail pane and export/import.
import { loadStore, saveStore, toggleEarned, setSpoiler, exportProgress, importProgressFile, isEarned } from './store.js';
import { renderChecklist, renderDetail, renderRoadmap, renderMissables } from './views.js';

const TROPHY_DATA_URL = 'data/trophies.json';

const state = {
  trophies: [],
  store: loadStore(),
  filters: { search: '', kind: 'all', grade: 'all', status: 'all' },
  selectedId: null,
  tab: 'tracker',
};

const $ = (id) => document.getElementById(id);

function updateProgress() {
  const earned = state.store.earned.length;
  $('earned-count').textContent = String(earned);
  $('progress-fill').style.width = `${(earned / 55) * 100}%`;
  $('progress-bar').setAttribute('aria-valuenow', String(earned));
  $('progress-note').textContent =
    earned >= 55
      ? 'Platinum: Vice Got a Price! — earned.'
      : `Platinum: Vice Got a Price! — ${55 - earned} to go.`;
  const missables = state.trophies.filter((t) => t.missable);
  const missableDone = missables.filter((t) => isEarned(state.store, t.id)).length;
  $('missable-count').textContent = `${missableDone}/${missables.length}`;
}

function renderAll() {
  renderChecklist($('trophy-list'), $('list-meta'), state.trophies, state.store, state.filters, state.selectedId);
  const selected = state.trophies.find((t) => t.id === state.selectedId) || null;
  renderDetail($('detail'), selected, state.store);
  renderRoadmap($('roadmap-list'), state.trophies, state.store);
  renderMissables($('missable-list'), state.trophies, state.store, state.selectedId);
  updateProgress();
}

function selectTrophy(id) {
  state.selectedId = id;
  const selected = state.trophies.find((t) => t.id === id) || null;
  renderDetail($('detail'), selected, state.store);
  document.querySelectorAll('.trophy-row').forEach((row) => {
    row.classList.toggle('selected', Number(row.dataset.id) === id);
  });
}

function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${tab}`));
}

async function boot() {
  const res = await fetch(TROPHY_DATA_URL);
  const data = await res.json();
  state.trophies = data.trophies;

  $('spoiler-toggle').checked = state.store.spoiler;

  document.querySelectorAll('.tab').forEach((b) => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });

  $('search').addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    renderAll();
  });
  $('filter-kind').addEventListener('change', (e) => {
    state.filters.kind = e.target.value;
    renderAll();
  });
  $('filter-grade').addEventListener('change', (e) => {
    state.filters.grade = e.target.value;
    renderAll();
  });
  $('filter-status').addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    renderAll();
  });
  $('spoiler-toggle').addEventListener('change', (e) => {
    setSpoiler(state.store, e.target.checked);
    renderAll();
  });
  $('export-btn').addEventListener('click', () => exportProgress(state.store));
  $('import-file').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      state.store = await importProgressFile(file);
      saveStore(state.store);
      $('spoiler-toggle').checked = state.store.spoiler;
      renderAll();
    } catch (err) {
      alert(`Could not import that file: ${err.message}`);
    }
    e.target.value = '';
  });

  document.querySelector('main').addEventListener('click', (e) => {
    const row = e.target.closest('.trophy-row');
    if (!row) return;
    const id = Number(row.dataset.id);
    if (e.target.matches('input[type="checkbox"]')) {
      toggleEarned(state.store, id);
      renderAll();
      return;
    }
    selectTrophy(id);
  });

  renderAll();
}

boot();
