# Third-party sources

- YouTube Inline Fullscreen: https://github.com/doubleyoustew/youtube-inline-fullscreen commit dc35c57e227d59f57c0b08786c0b0d964efc63bd, GPL-3.0-only. Vendored under vendor/inline; original LICENSE retained. Original popup style sheet is also used in port/popup.css. Fullscreen JavaScript/CSS are minified without behavioral changes.
- YouTube NonStop: https://github.com/lawfx/YoutubeNonStop commit f584e909dedb2514225b1aec6ad14c15bb60e337, MIT. Vendored under vendor/nonstop with original license. Build adds a setting-controlled enable flag and product log prefix; runs in the page MAIN world.
- Modified popup and background code provide the product branding, default settings, shortcut recorder, and queued saves. Distribution does not include the upstream uninstall survey or promotional links.

YouTube and YouTube Music are trademarks of their respective owners. This project is independent and is not endorsed by Google, YouTube, or the upstream authors.
