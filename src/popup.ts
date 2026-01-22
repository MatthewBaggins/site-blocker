const siteInput = document.getElementById("site") as HTMLInputElement;
const addBtn = document.getElementById("add") as HTMLButtonElement;
const list = document.getElementById("list") as HTMLUListElement;

function norm(s: string): string {
  return s.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

async function load(): Promise<void> {
  const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
  render(blocked);
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
      await chrome.browsingData.removeCache({
        origins: [`https://${d}`, `http://${d}`]
      });
    };
    li.appendChild(clearCache);

    const rm = document.createElement("button");
    rm.textContent = "×";
    rm.title = "Remove";
    rm.onclick = async () => {
      blocked.splice(i, 1);
      await chrome.storage.sync.set({ blocked });
      render(blocked);
    };
    li.appendChild(rm);
    list.appendChild(li);
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

load();
