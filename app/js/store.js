// Progress store: earned trophies, filters and the spoiler setting live in
// localStorage on this device only. Export writes a JSON file; import reads it back.
export const STORE_KEY = 'vice-platinum-atlas-v1';

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { earned: [], spoiler: false };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => typeof n === 'number') : [],
      spoiler: parsed.spoiler === true,
    };
  } catch {
    return { earned: [], spoiler: false };
  }
}

export function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: store.earned, spoiler: store.spoiler }));
}

export function isEarned(store, id) {
  return store.earned.includes(id);
}

export function toggleEarned(store, id) {
  const at = store.earned.indexOf(id);
  if (at >= 0) store.earned.splice(at, 1);
  else store.earned.push(id);
  saveStore(store);
  return store;
}

export function setSpoiler(store, on) {
  store.spoiler = on;
  saveStore(store);
  return store;
}

export function exportProgress(store) {
  const blob = new Blob([JSON.stringify({ app: 'vice-platinum-atlas', version: 1, earned: store.earned, spoiler: store.spoiler }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vice-platinum-atlas-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importProgressFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.earned)) throw new Error('That file is not a Vice Platinum Atlas progress export.');
  return { earned: parsed.earned.filter((n) => typeof n === 'number'), spoiler: parsed.spoiler === true };
}
