const api=globalThis.browser??chrome;
let enabled=true;
function publish(){document.dispatchEvent(new CustomEvent('ywt-nonstop-setting',{detail:enabled?'on':'off'}));}
document.addEventListener('ywt-nonstop-ready',publish);
api.storage.sync.get('settings').then(result=>{enabled=result.settings?.nonStopEnabled!==false;publish();});
api.storage.onChanged.addListener((changes,area)=>{if(area==='sync'&&changes.settings){enabled=changes.settings.newValue?.nonStopEnabled!==false;publish();}});
