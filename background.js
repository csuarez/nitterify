async function apply() {
  const { instance = null, enabled = true } = await browser.storage.local.get(["instance", "enabled"]);
  const on = Boolean(instance && enabled);

  const existing = await browser.declarativeNetRequest.getDynamicRules();
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules: on ? buildRules(instance) : [],
  });

  await browser.action.setIcon({ path: on ? "icons/icon.svg" : "icons/icon-off.svg" });
  await browser.action.setTitle({
    title: !instance
      ? "Nitterify — set a Nitter instance"
      : on
        ? `Nitterify — redirecting to ${new URL(instance).host}`
        : "Nitterify — redirects off",
  });
}

browser.runtime.onInstalled.addListener(apply);
browser.runtime.onStartup.addListener(apply);
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && ("instance" in changes || "enabled" in changes)) {
    apply();
  }
});
