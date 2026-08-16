# dsh-jmcomic

**English** · [日本語](./README.ja.md) · [简体中文](./README.zh.md)

A DeepSeek Harness plugin: a **comic** trigger in the sidebar footer that adds search & download, an importable local library, and an in-modal manga reader for JMComic (18comic).

## Features

- **Sidebar button**: "comic" trigger in the sidebar footer (above the skills button).
- **Small panel**: search box (album ID / title) + "Import local folder" button; once a folder is bound, shows 2–3 recent covers + a "More" button.
- **Large modal**: centered blurred-background grid of every comic in the local folder; click any comic to list chapters, then read **inside the modal** (reuses the jm-view-server reader: scroll / single / double page, thumbnail overview, rotate, hotkeys).
- **Settings**: Settings → Plugins → Plugin Configuration → jmcomic card to change the default folder and Python path; the large modal also has a "Change folder" button.
- **First-run hint**: when a complete jmcomic environment is not detected, a one-time dialog recommends installing it (with the GitHub link).
- **Draggable**: both the small panel and the large modal can be dragged around.
- **Delete**: hover a library card to reveal a delete button (guarded: only albums under the base dir, never the root or system directories).
- **Download banner**: while downloads run, "downloading …" is shown at the top of both the small panel and the large modal.

## Offline-first

The plugin bundles:

- `vendor/python/jmcomic` — JMComic-Crawler-Python 2.7.3 source
- `vendor/python/common` — commonX pure-Python source
- `vendor/python/jmcomic_ai` — jmcomic-ai package (for bundled helper scripts)
- `vendor/scripts/*.py` — download / search / convert scripts
- `vendor/viewer/static` — jm-view-server reader frontend

It therefore works **even without the jmcomic PyPI package installed**. Missing binary deps degrade automatically:

| Missing | Fallback |
|---|---|
| curl_cffi | postman uses requests |
| Pillow | image decode disabled (files download but cannot be previewed) |
| pycryptodome | prompts for install |

## Install

```bash
dsh plugin --profile web add <package-path-or-git-url>
```

## Build

```bash
npm install   # devDependency: esbuild
npm run build # -> lib/client.js + lib/server.cjs (committed)
```

## Self-check

```bash
node selfcheck.cjs   # verifies all /jmcomic/* routes against a stub ctx
```

## Configuration

- Settings file: `~/.dsh/plugins/dsh-jmcomic/settings.json` (Windows)
- Download strategy (battle-tested): `client.impl: api` direct connection, `Bd/{Atitle}/第{Pindex}話` directory rule, low concurrency (image 3 / photo 1).

## Credits

- [JMComic-Crawler-Python](https://github.com/hect0x7/JMComic-Crawler-Python) — download engine
- [jm-view-server](https://github.com/hect0x7/jm-view-server) — reader frontend
- [jmcomic-ai](https://github.com/hect0x7/jmcomic-ai) — helper scripts
