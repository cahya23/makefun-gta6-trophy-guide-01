// Rendering: the checklist, the trophy detail pane, the roadmap and the
// missables page. The spoiler setting hides the name and description of a
// story trophy until it is earned.
import { isEarned } from './store.js';
import { ROADMAP_STAGES } from './roadmap.js';

export const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  combat: 'Combat & robberies',
  exploration: 'Exploration',
  money: 'Money & property',
  misc: 'Other',
};

const EXOPHASE_URL = 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/';
const PSNPROFILES_URL = 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi';

export function spoilerHides(store, trophy) {
  return store.spoiler && trophy.kind === 'story' && !isEarned(store, trophy.id);
}

export function filterTrophies(trophies, store, filters) {
  const q = filters.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.kind === 'missable' && !t.missable) return false;
    if (filters.kind === 'online') return false;
    if (filters.kind !== 'all' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !isEarned(store, t.id)) return false;
    if (filters.status === 'todo' && isEarned(store, t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

export function trophyRow(trophy, store, selectedId) {
  const li = document.createElement('li');
  const earned = isEarned(store, trophy.id);
  const hidden = spoilerHides(store, trophy);
  li.className = 'trophy-row' + (earned ? ' earned' : '') + (selectedId === trophy.id ? ' selected' : '');
  li.dataset.id = String(trophy.id);

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = earned;
  check.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  li.appendChild(check);

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${trophy.grade}`;
  badge.textContent = trophy.grade;
  li.appendChild(badge);

  const body = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'trophy-name' + (hidden ? ' spoiler-name' : '');
  name.textContent = hidden ? 'Hidden trophy — earn it to reveal' : trophy.name;
  body.appendChild(name);
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'A story trophy. Its name and description stay hidden until you earn it.' : trophy.description;
  body.appendChild(desc);
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  tags.appendChild(kindTag);
  if (trophy.missable) {
    const m = document.createElement('span');
    m.className = 'tag missable';
    m.textContent = 'Missable';
    tags.appendChild(m);
  }
  if (trophy.hidden) {
    const h = document.createElement('span');
    h.className = 'tag hidden-flag';
    h.textContent = 'Hidden on PSN';
    tags.appendChild(h);
  }
  if (trophy.count) {
    const c = document.createElement('span');
    c.className = 'tag count';
    c.textContent = `PSN target ${trophy.count.toLocaleString('en-US')}`;
    tags.appendChild(c);
  }
  body.appendChild(tags);
  li.appendChild(body);

  const count = document.createElement('div');
  count.className = 'trophy-count';
  count.textContent = trophy.count ? `0 / ${trophy.count.toLocaleString('en-US')}` : '';
  li.appendChild(count);
  return li;
}

export function renderChecklist(listEl, metaEl, trophies, store, filters, selectedId) {
  listEl.innerHTML = '';
  const shown = filterTrophies(trophies, store, filters);
  if (filters.kind === 'online') {
    const note = document.createElement('li');
    note.className = 'empty-note';
    note.textContent = 'No online trophies: the official 55-trophy list has no online-only trophy. Everything on this list is earned in single-player.';
    listEl.appendChild(note);
  } else if (shown.length === 0) {
    const note = document.createElement('li');
    note.className = 'empty-note';
    note.textContent = 'No trophies match these filters.';
    listEl.appendChild(note);
  } else {
    for (const t of shown) listEl.appendChild(trophyRow(t, store, selectedId));
  }
  const earned = store.earned.length;
  metaEl.textContent = `Showing ${shown.length} of 55 trophies · ${earned} earned · ${55 - earned} to go`;
}

export function renderDetail(detailEl, trophy, store) {
  detailEl.innerHTML = '';
  if (!trophy) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Select a trophy to read its guide and sources.';
    detailEl.appendChild(p);
    return;
  }
  const hidden = spoilerHides(store, trophy);
  const h = document.createElement('h3');
  h.textContent = hidden ? 'Hidden trophy' : trophy.name;
  detailEl.appendChild(h);

  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${trophy.grade}`;
  badge.textContent = trophy.grade;
  meta.appendChild(badge);
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  meta.appendChild(kind);
  if (trophy.missable) {
    const m = document.createElement('span');
    m.className = 'tag missable';
    m.textContent = 'Missable — do it on your first playthrough';
    meta.appendChild(m);
  }
  if (trophy.count) {
    const c = document.createElement('span');
    c.className = 'tag count';
    c.textContent = `PSN progress target: 0 / ${trophy.count.toLocaleString('en-US')}`;
    meta.appendChild(c);
  }
  detailEl.appendChild(meta);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'Hidden until earned.' : trophy.description;
  detailEl.appendChild(desc);

  const guideLabel = document.createElement('p');
  guideLabel.className = 'detail-label';
  guideLabel.textContent = 'Guide';
  detailEl.appendChild(guideLabel);
  const guide = document.createElement('div');
  guide.className = 'detail-guide';
  const gp = document.createElement('p');
  gp.textContent = hidden ? 'Earn this story trophy to reveal its guide.' : trophy.guide;
  guide.appendChild(gp);
  detailEl.appendChild(guide);

  if (!hidden) {
    const warn = document.createElement('p');
    warn.className = 'unverified';
    warn.textContent = 'Honest note: GTA 6 released 19 November 2026. Any place or step in this guide that has not been verified in the game yet is labelled as such in the guide text — this guide does not invent locations.';
    detailEl.appendChild(warn);
  }

  const srcLabel = document.createElement('p');
  srcLabel.className = 'detail-label';
  srcLabel.textContent = 'Sources';
  detailEl.appendChild(srcLabel);
  const ul = document.createElement('ul');
  ul.className = 'detail-sources';
  for (const s of trophy.sources) {
    const li = document.createElement('li');
    li.textContent = s;
    ul.appendChild(li);
  }
  const ex = document.createElement('li');
  const exA = document.createElement('a');
  exA.href = EXOPHASE_URL;
  exA.target = '_blank';
  exA.rel = 'noopener';
  exA.textContent = 'Exophase — official trophy list';
  ex.appendChild(exA);
  ul.appendChild(ex);
  const pp = document.createElement('li');
  const ppA = document.createElement('a');
  ppA.href = PSNPROFILES_URL;
  ppA.target = '_blank';
  ppA.rel = 'noopener';
  ppA.textContent = 'PSNProfiles — trophy list & PSN progress targets';
  pp.appendChild(ppA);
  ul.appendChild(pp);
  detailEl.appendChild(ul);

  const stage = ROADMAP_STAGES.find((s) => s.stage === trophy.roadmap);
  if (stage) {
    const rLabel = document.createElement('p');
    rLabel.className = 'detail-label';
    rLabel.textContent = 'Roadmap';
    detailEl.appendChild(rLabel);
    const r = document.createElement('p');
    r.textContent = `Stage ${stage.stage}: ${stage.title}.`;
    detailEl.appendChild(r);
  }
}

export function renderRoadmap(listEl, trophies, store) {
  listEl.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const num = document.createElement('div');
    num.className = 'stage-num';
    num.textContent = String(stage.stage);
    li.appendChild(num);
    const body = document.createElement('div');
    const h = document.createElement('h3');
    h.textContent = stage.title;
    body.appendChild(h);
    const p = document.createElement('p');
    p.textContent = stage.text;
    body.appendChild(p);
    const names = stage.trophyIds.map((id) => {
      const t = trophies.find((x) => x.id === id);
      return t ? t.name : '';
    }).filter(Boolean);
    const st = document.createElement('p');
    st.className = 'stage-trophies';
    st.textContent = `Trophies: ${names.join(' · ')}`;
    body.appendChild(st);
    li.appendChild(body);
    const done = stage.trophyIds.filter((id) => isEarned(store, id)).length;
    const prog = document.createElement('div');
    prog.className = 'stage-progress';
    const b = document.createElement('b');
    b.textContent = `${done}/${stage.trophyIds.length}`;
    prog.appendChild(b);
    prog.appendChild(document.createTextNode(' earned'));
    li.appendChild(prog);
    listEl.appendChild(li);
  }
}

export function renderMissables(listEl, trophies, store, selectedId) {
  listEl.innerHTML = '';
  const missables = trophies.filter((t) => t.missable);
  for (const t of missables) listEl.appendChild(trophyRow(t, store, selectedId));
}
