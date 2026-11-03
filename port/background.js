const api = globalThis.browser ?? chrome;
const defaults = { autoEnable: true, nonStopEnabled: true, showButton: true, fullscreenShortcut: 'd' };
let queue = Promise.resolve();
api.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type !== 'save-settings') return;
  queue = queue.catch(() => {}).then(async () => {
    const result = await api.storage.sync.get('settings');
    const patch = {};
    for (const key of Object.keys(defaults)) {
      const value = message.patch?.[key];
      if (key === 'fullscreenShortcut' ? typeof value === 'string' && /^([a-z])?$/.test(value) : typeof value === 'boolean') patch[key] = value;
    }
    const settings = { ...defaults, ...result.settings, ...patch };
    await api.storage.sync.set({ settings });
    return settings;
  });
  queue.then(settings => respond({ settings }), error => respond({ error: error.message }));
  return true;
});
queue = api.storage.sync.get('settings').then(result => {
  if (!result.settings) return api.storage.sync.set({ settings: defaults });
});
