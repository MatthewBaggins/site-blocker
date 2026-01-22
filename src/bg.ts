async function updateRules(blocked: string[]): Promise<void> {
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

chrome.runtime.onInstalled.addListener(async () => {
  const { blocked = [] } = await chrome.storage.sync.get("blocked") as { blocked?: string[] };
  await updateRules(blocked);
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "sync" && changes.blocked) {
    await updateRules(changes.blocked.newValue || []);
  }
});
