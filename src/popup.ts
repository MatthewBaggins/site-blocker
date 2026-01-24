import { DEFAULT_BLOCKED } from "./config";

const siteInput = document.getElementById("site") as HTMLInputElement;
const addBtn = document.getElementById("add") as HTMLButtonElement;
const blockCurrentBtn = document.getElementById("blockCurrent") as HTMLButtonElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;
const list = document.getElementById("list") as HTMLUListElement;

const defaultSiteInput = document.getElementById("defaultSite") as HTMLInputElement;
const addDefaultBtn = document.getElementById("addDefault") as HTMLButtonElement;
const addCurrentToDefaultsBtn = document.getElementById("addCurrentToDefaults") as HTMLButtonElement;
const defaultList = document.getElementById("defaultList") as HTMLUListElement;

function norm(s: string): string {
  return s.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

async function getDefaults(): Promise<string[]> {
  const { defaults } = await chrome.storage.sync.get("defaults") as { defaults?: string[] };
  return defaults || DEFAULT_BLOCKED;
}

async function load(): Promise<void> {
  const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
  render(blocked);
  const defaults = await getDefaults();
  renderDefaults(defaults);
}

function render(blocked: string[]): void {
  list.innerHTML = "";
  blocked.forEach((d, i) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = d;
    li.appendChild(span);

    const clearCache = document.createElement("button");
    clearCache.textContent = "🗑";
    clearCache.title = "Clear cache";
    clearCache.onclick = async () => {
      try {
        // Build list of common origin variations for this domain
        const origins = [
          `https://${d}`,
          `http://${d}`,
          `https://www.${d}`,
          `http://www.${d}`,
          `https://m.${d}`,
          `http://m.${d}`
        ];
        
        await chrome.browsingData.remove(
          { origins },
          { cache: true, cacheStorage: true, serviceWorkers: true }
        );
        alert(`Cache cleared for ${d}`);
      } catch (e) {
        console.error('Cache clear failed:', e);
        alert(`Failed to clear cache: ${e}`);
      }
    };
    li.appendChild(clearCache);

    const rm = document.createElement("button");
    rm.textContent = "×";
    rm.title = "Remove";
    rm.onclick = async () => {
      const input = prompt(`Type "${d}" to confirm removal:`);
      if (input !== d) {
        if (input !== null) alert("Incorrect. Site not removed.");
        return;
      }
      const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
      const updated = blocked.filter(site => site !== d);
      await chrome.storage.sync.set({ blocked: updated });
      render(updated);
    };
    li.appendChild(rm);
    list.appendChild(li);
  });
}

function renderDefaults(defaults: string[]): void {
  defaultList.innerHTML = "";
  defaults.forEach((d) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = d;
    li.appendChild(span);

    const rm = document.createElement("button");
    rm.textContent = "×";
    rm.title = "Remove";
    rm.onclick = async () => {
      const input = prompt(`Type "${d}" to confirm removal:`);
      if (input !== d) {
        if (input !== null) alert("Incorrect. Site not removed.");
        return;
      }
      const current = await getDefaults();
      const updated = current.filter(site => site !== d);
      await chrome.storage.sync.set({ defaults: updated });
      renderDefaults(updated);
    };
    li.appendChild(rm);
    defaultList.appendChild(li);
  });
}

addBtn.onclick = async () => {
  const d = norm(siteInput.value);
  if (!d) return;
  const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
  if (!blocked.includes(d)) blocked.push(d);
  await chrome.storage.sync.set({ blocked });
  siteInput.value = "";
  render(blocked);
};

blockCurrentBtn.onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url) return;
  const d = norm(tab.url);
  if (!d) return;
  const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
  if (!blocked.includes(d)) blocked.push(d);
  await chrome.storage.sync.set({ blocked });
  render(blocked);
};

resetBtn.onclick = async () => {
  if (confirm("Reset to default blocked sites?")) {
    const defaults = await getDefaults();
    await chrome.storage.sync.set({ blocked: defaults });
    render(defaults);
  }
};

addDefaultBtn.onclick = async () => {
  const d = norm(defaultSiteInput.value);
  if (!d) return;
  const current = await getDefaults();
  if (!current.includes(d)) current.push(d);
  await chrome.storage.sync.set({ defaults: current });
  defaultSiteInput.value = "";
  renderDefaults(current);
};

addCurrentToDefaultsBtn.onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url) return;
  const d = norm(tab.url);
  if (!d) return;
  const current = await getDefaults();
  if (!current.includes(d)) current.push(d);
  await chrome.storage.sync.set({ defaults: current });
  renderDefaults(current);
};

load();
