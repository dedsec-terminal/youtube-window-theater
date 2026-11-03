const api = globalThis.browser ?? chrome;
const defaults = { autoEnable: true, nonStopEnabled: true, showButton: true, fullscreenShortcut: 'd' };
const input = document.getElementById('fullscreenShortcut');
const editor = document.querySelector('.ytif-swap');
const label = document.getElementById('displayFullscreenShortcut');
const controls = [...document.querySelectorAll('input,button')];
const status = document.createElement('p');
status.setAttribute('role', 'status');
status.className = 'text-sm text-error';
document.querySelector('form').append(status);
let settings = { ...defaults };
let revision = 0;
function render() {
  for (const key of Object.keys(defaults)) {
    const el = document.getElementById(key);
    if (el.type === 'checkbox') el.checked = settings[key]; else el.value = settings[key];
  }
  label.textContent = settings.fullscreenShortcut || 'Disabled';
}
async function save(patch) {
  const current = ++revision;
  settings = { ...settings, ...patch };
  render();
  status.textContent = 'Saving…';
  try {
    const result = await api.runtime.sendMessage({ type: 'save-settings', patch });
    if (!result || result.error) throw new Error(result?.error || 'Please reload the extension.');
    if (current === revision) { settings = result.settings; render(); status.textContent = ''; }
  } catch (error) {
    status.textContent = 'Not saved: ' + error.message + '. Try again.';
  }
}
controls.forEach(el => el.disabled = true);
api.storage.sync.get('settings').then(result => {
  settings = { ...defaults, ...result.settings }; render();
  controls.forEach(el => el.disabled = false);
}).catch(error => { status.textContent = 'Could not load settings: ' + error.message + '. Reopen this popup.'; });
for (const key of ['autoEnable','nonStopEnabled','showButton']) document.getElementById(key).addEventListener('change', e => save({ [key]: e.target.checked }));
document.querySelector('form').addEventListener('submit', e => e.preventDefault());
document.getElementById('editFullscreenShortcut').onclick = () => { editor.classList.add('ytif-active'); input.focus(); };
input.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
  if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); input.value = e.key.toLowerCase(); }
});
input.addEventListener('input', () => { input.value = input.value.replace(/[^a-z]/gi,'').slice(-1).toLowerCase(); });
async function commitShortcut(value) { await save({ fullscreenShortcut: value }); editor.classList.remove('ytif-active'); }
document.getElementById('saveShortcut').onclick = () => commitShortcut(input.value);
document.getElementById('cancelShortcut').onclick = () => commitShortcut('d');
document.getElementById('disableShortcut').onclick = () => commitShortcut('');
