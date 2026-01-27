import { DEFAULT_BLOCKED } from "./config";
import { getDomainOrigins } from "./utils";

const getDefaults = async (): Promise<string[]> => {
  const { defaults } = await chrome.storage.sync.get("defaults") as { defaults?: string[] };
  return defaults || DEFAULT_BLOCKED;
};

const updateRules = async (blocked: string[]): Promise<void> => {
  const rules: chrome.declarativeNetRequest.Rule[] = blocked.map((domain, i) => ({
    id: i + 1,
    priority: 1,
    action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
    condition: { 
      requestDomains: [domain],
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
    }
  }));

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map(r => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: rules
  });
}

chrome.runtime.onInstalled.addListener(async (): Promise<void> => {
  const { blocked } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
  
  // Initialize with defaults on first install
  if (!blocked) {
    await chrome.storage.sync.set({ blocked: DEFAULT_BLOCKED });
    await updateRules(DEFAULT_BLOCKED);
  } else {
    await updateRules(blocked);
  }
  
  // Create alarm to reset to defaults every 5 minutes
  chrome.alarms.create("resetToDefaults", { periodInMinutes: 5 });
});

chrome.alarms.onAlarm.addListener(async (alarm): Promise<void> => {
  if (alarm.name === "resetToDefaults") {
    const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
    const defaults = await getDefaults();
    
    // Find newly added domains (in defaults but not in current blocked list)
    const newlyAdded = defaults.filter(d => !blocked.includes(d));
    
    await chrome.storage.sync.set({ blocked: defaults });
    await updateRules(defaults);
    
    // Clear cache only for newly added sites
    for (const domain of newlyAdded) {
      const origins = getDomainOrigins(domain);
      
      try {
        await chrome.browsingData.remove(
          { origins },
          { cache: true, cacheStorage: true, serviceWorkers: true }
        );
      } catch (e) {
        console.error(`Failed to clear cache for ${domain}:`, e);
      }
    }
  }
});

chrome.storage.onChanged.addListener(async (changes, area): Promise<void> => {
  if (area === "sync" && changes.blocked) {
    await updateRules(changes.blocked.newValue || []);
  }
});
