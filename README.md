# YouTube Window Theater

Inline windowed fullscreen for YouTube, with optional NonStop playback for YouTube and YouTube Music.

## Features

- Original inline fullscreen layout and scrolling behavior.
- Automatic inline fullscreen and NonStop enabled by default.
- D toggles fullscreen; Escape exits. Edit, press a letter, and Save to customize the shortcut.
- Original-style settings popup, including show/hide player button and shortcut disable/reset.
- Serialized settings saves that continue after the popup closes.

NonStop attempts to suppress idle playback interruptions; it cannot guarantee uninterrupted playback through network errors or every future YouTube change. Inline fullscreen targets YouTube watch pages, not the YouTube Music player. No analytics or tracking code is added. Preferences use browser sync storage and may sync through your browser account.

## Install

Chrome: extract the Chrome release ZIP, visit chrome://extensions, enable Developer mode, and choose Load unpacked. Select the folder containing manifest.json. Disable older copies and refresh YouTube.

Firefox: the GitHub package is unsigned. For temporary testing, open about:debugging#/runtime/this-firefox, choose Load Temporary Add-on, and select the Firefox manifest.json. Temporary installation ends when Firefox closes. Regular installation requires Mozilla signing. Minimum Firefox version: 142.

## Reproducible build

Use Node.js 22 and npm. From this directory:

    npm ci
    npm run build

Outputs: dist/chrome, dist/firefox, and browser/source ZIP files in dist/artifacts. All runtime JS/CSS is minified with esbuild. The source ZIP contains the vendored inputs, licenses, package lock, and this build script. For Mozilla submission, provide the Firefox ZIP plus the source ZIP and these instructions.

    npx playwright install chromium
    npm test
    npx --yes web-ext lint --source-dir dist/firefox

Browser tests use an isolated Chromium profile and a public YouTube video. They check 20 popup reopen cycles, concurrent changes, persistence after closing, shortcut editing, automatic fullscreen, and NonStop toggle behavior. Firefox static validation is separate; live Firefox testing has not been performed.

## Source and license

GPL-3.0-only, with the MIT-licensed NonStop component. See LICENSE and THIRD-PARTY.md. Fullscreen behavior is based on the original author's implementation; settings and packaging additions are maintained in port/ and scripts/. No custom viewport overrides are applied.
