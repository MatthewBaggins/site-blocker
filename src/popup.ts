import { DEFAULT_BLOCKED } from "./config";
import { randInt } from "./utils";

const siteInput = document.getElementById("site") as HTMLInputElement;
const addBtn = document.getElementById("add") as HTMLButtonElement;
const blockCurrentBtn = document.getElementById("blockCurrent") as HTMLButtonElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;
const list = document.getElementById("list") as HTMLUListElement;

const defaultSiteInput = document.getElementById("defaultSite") as HTMLInputElement;
const addDefaultBtn = document.getElementById("addDefault") as HTMLButtonElement;
const addCurrentToDefaultsBtn = document.getElementById("addCurrentToDefaults") as HTMLButtonElement;
const defaultList = document.getElementById("defaultList") as HTMLUListElement;

const confirmRemoval = (domain: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000";
    
    const box = document.createElement("div");
    box.style.cssText = "background:white;padding:12px;border-radius:8px;width:calc(100% - 20px);max-width:240px";
    
    const domain_repeats: number = randInt(1, 6);

    const msg = document.createElement("p");
    msg.textContent = `Type "${domain}" ${domain_repeats} time${domain_repeats === 1 ? "" : "s"} (without whitespace) to confirm removal:`;
    msg.style.cssText = "margin:0 0 8px 0;font-size:12px";
    box.appendChild(msg);
    
    const input = document.createElement("input");
    input.type = "text";
    input.style.cssText = "width:100%;padding:4px;margin:0 0 8px 0;box-sizing:border-box";
    input.onpaste = (e) => e.preventDefault();
    box.appendChild(input);
    
    const btnContainer = document.createElement("div");
    btnContainer.style.cssText = "display:flex;gap:4px";
    
    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Confirm";
    confirmBtn.style.cssText = "flex:1;padding:4px";
    confirmBtn.onclick = () => {
      document.body.removeChild(modal);
      resolve(input.value === domain.repeat(domain_repeats));
    };
    
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = "flex:1;padding:4px";
    cancelBtn.onclick = () => {
      document.body.removeChild(modal);
      resolve(false);
    };
    
    btnContainer.appendChild(confirmBtn);
    btnContainer.appendChild(cancelBtn);
    box.appendChild(btnContainer);
    modal.appendChild(box);
    document.body.appendChild(modal);
    input.focus();
  });
}

const norm = (s: string): string => {
  return s.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

const getDefaults = async (): Promise<string[]> => {
  const { defaults } = await chrome.storage.sync.get("defaults") as { defaults?: string[] };
  return defaults || DEFAULT_BLOCKED;
}

const load = async (): Promise<void> => {
  const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
  render(blocked);
  const defaults = await getDefaults();
  renderDefaults(defaults);
}

const render = (blocked: string[]): void => {
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
      const confirmed = await confirmRemoval(d);
      if (!confirmed) return;
      const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
      const updated = blocked.filter(site => site !== d);
      await chrome.storage.sync.set({ blocked: updated });
      render(updated);
    };
    li.appendChild(rm);
    list.appendChild(li);
  });
}

const renderDefaults = (defaults: string[]): void => {
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
      const confirmed = await confirmRemoval(d);
      if (!confirmed) return;
      const current = await getDefaults();
      const updated = current.filter(site => site !== d);
      await chrome.storage.sync.set({ defaults: updated });
      renderDefaults(updated);
    };
    li.appendChild(rm);
    defaultList.appendChild(li);
  });
}

addBtn.onclick = async (): Promise<void> => {
  const d = norm(siteInput.value);
  if (!d) return;
  const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
  if (!blocked.includes(d)) blocked.push(d);
  await chrome.storage.sync.set({ blocked });
  siteInput.value = "";
  render(blocked);
};

blockCurrentBtn.onclick = async (): Promise<void> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url) return;
  const d = norm(tab.url);
  if (!d) return;
  const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
  if (!blocked.includes(d)) blocked.push(d);
  await chrome.storage.sync.set({ blocked });
  render(blocked);
};

resetBtn.onclick = async (): Promise<void> => {
  const defaults = await getDefaults();
  await chrome.storage.sync.set({ blocked: defaults });
  render(defaults);
};

addDefaultBtn.onclick = async (): Promise<void> => {
  const d = norm(defaultSiteInput.value);
  if (!d) return;
  const current = await getDefaults();
  if (!current.includes(d)) current.push(d);
  await chrome.storage.sync.set({ defaults: current });
  defaultSiteInput.value = "";
  renderDefaults(current);
};

addCurrentToDefaultsBtn.onclick = async (): Promise<void> => {
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
