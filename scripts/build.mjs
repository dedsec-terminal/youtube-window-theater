import fs from 'node:fs/promises';
import path from 'node:path';
import AdmZip from 'adm-zip';
import { transform } from 'esbuild';
const browserTarget = process.argv.includes('--firefox') ? 'firefox' : 'chrome';
const dest = path.resolve('dist/'+browserTarget);
await fs.mkdir(dest, { recursive: true });
await fs.mkdir('dist/artifacts',{recursive:true});
await fs.cp('vendor/inline/app', dest, { recursive: true, filter: source => !source.split(path.sep).includes('settings') });
await fs.copyFile('vendor/nonstop/autoconfirm.js', path.join(dest, 'nonstop.js'));
await fs.copyFile('vendor/inline/LICENSE', path.join(dest, 'LICENSE'));
await fs.copyFile('vendor/nonstop/LICENSE', path.join(dest, 'LICENSE-NonStop'));
const manifest = JSON.parse(await fs.readFile(path.join(dest, 'manifest.json'), 'utf8'));
manifest.name = 'YouTube Window Theater';
manifest.version = '1.5.0';
manifest.action.default_popup = 'popup.html';
manifest.options_ui = {page:'popup.html',open_in_tab:true};
if(browserTarget==='firefox'){manifest.background={scripts:['background.js']};manifest.browser_specific_settings={gecko:{id:'youtube-window-theater@antigravity.addon',strict_min_version:'142.0',data_collection_permissions:{required:['none']}}};}
manifest.content_scripts[0].js.unshift('bridge.js');
manifest.description = 'Inline fullscreen and uninterrupted YouTube playback.';
delete manifest.action.default_name;
manifest.action.default_title = manifest.name;
manifest.content_scripts.push({ matches: ['https://www.youtube.com/*', 'https://music.youtube.com/*'], js: ['nonstop.js'], world: 'MAIN', run_at: 'document_idle' });
for(const file of ['popup.html','popup.js','popup.css','bridge.js']) await fs.copyFile('port/'+file,path.join(dest,file));
let nonstop=await fs.readFile(path.join(dest,'nonstop.js'),'utf8');
nonstop=nonstop.replace('function isIdle() {', 'function isIdle() { if (!nonstopEnabled) return false;');
nonstop='let nonstopEnabled=true; document.addEventListener("ywt-nonstop-setting",e=>{nonstopEnabled=e.detail!=="off";}); document.dispatchEvent(new Event("ywt-nonstop-ready"));\n'+nonstop;
nonstop=nonstop.replaceAll('[Youtube NonStop]','[YouTube Window Theater]');
await fs.writeFile(path.join(dest,'nonstop.js'),nonstop);
await fs.writeFile(path.join(dest, 'manifest.json'), JSON.stringify(manifest, null, 2)+'\n');
await fs.copyFile('port/background.js', path.join(dest,'background.js'));
await fs.writeFile(path.join(dest, 'PORT-NOTES.md'), `# YouTube Window Theater\n\nFullscreen source: https://github.com/doubleyoustew/youtube-inline-fullscreen at dc35c57e227d59f57c0b08786c0b0d964efc63bd (GPL-3.0-only).\nNonStop source: https://github.com/lawfx/YoutubeNonStop at f584e909dedb2514225b1aec6ad14c15bb60e337 (MIT).\n\nFullscreen JavaScript and CSS use the original upstream implementation with production minification. No custom fullscreen layout overrides are included. NonStop autoconfirm.js is copied unchanged as nonstop.js and runs in Chrome MAIN world. No script-tag injection is needed. Original settings remain available. NonStop can be toggled in the popup. The upstream uninstall survey is removed. Distributed JavaScript and CSS are minified with comments removed; original source and build script remain in the project.\n\nInstall: chrome://extensions > Developer mode > Load unpacked > select this folder. Disable previous versions and refresh YouTube. Press D or the player button.\n`);
await fs.rm(path.join(dest, 'compat.css'), { force: true });
async function optimize(dir) {
  for (const item of await fs.readdir(dir, { withFileTypes:true })) {
    const file = path.join(dir,item.name);
    if(item.isDirectory()) { await optimize(file); continue; }
    if(/\.(js|css)$/.test(item.name)) {
      const result = await transform(await fs.readFile(file,'utf8'), { loader:item.name.endsWith('.css')?'css':'js', minify:true, legalComments:'none', target:'chrome111' });
      await fs.writeFile(file,result.code);
    } else if(item.name.endsWith('.html')) {
      const html = await fs.readFile(file,'utf8');
      await fs.writeFile(file,html.replace(/<!--[\s\S]*?-->/g,'').replace(/>\s+</g,'><').trim());
    }
  }
}
await optimize(dest);
// Exclude development-only files from the installable package.
for (const relative of ['manifest.firefox.json','ytif_style.scss','ytif_style.css.map','settings/style/src/style.css']) {
  await fs.rm(path.join(dest, relative), {force:true});
}
const sourceZip = new AdmZip();
sourceZip.addLocalFolder('vendor/inline/app', 'vendor/inline/app');
sourceZip.addLocalFolder('port','port');
sourceZip.addLocalFile('vendor/inline/LICENSE', 'vendor/inline');
sourceZip.addLocalFile('vendor/nonstop/autoconfirm.js', 'vendor/nonstop');
sourceZip.addLocalFile('vendor/nonstop/LICENSE', 'vendor/nonstop');

sourceZip.addLocalFile('README.md');
sourceZip.addLocalFile('LICENSE');
sourceZip.addLocalFile('THIRD-PARTY.md');
sourceZip.addLocalFolder('scripts','scripts');
sourceZip.addLocalFile('package.json');
sourceZip.addLocalFile('package-lock.json');
sourceZip.writeZip('dist/artifacts/youtube-window-theater-1.5.0-source.zip');
const zip = new AdmZip();
zip.addLocalFolder(dest);
zip.writeZip('dist/artifacts/youtube-window-theater-1.5.0-'+browserTarget+'.zip');
console.log(dest);

