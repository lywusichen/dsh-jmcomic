# dsh-jmcomic

English · [日本語](./README.ja.md) · [简体中文](./README.zh.md)

A DeepSeek Harness plugin. Adds a comic button in the sidebar to search & download manga from JMComic (18comic), browse your local library, and read inside a window.

## Features

- Sidebar comic button (above the skills button)
- Small panel: search by ID or title and download; once a local folder is bound, shows the 2–3 most recent covers, click one to start reading
- Large modal: grid of every comic in the local folder, click in to see the chapter list
- Reader window: drag any edge/corner to resize, drag the top bar to move; size and position are remembered
- Reopening a comic jumps back to the chapter and page you last read
- Reader footer shows current page / total, with an input to jump to any page
- Hover a card to reveal a delete button (only albums inside the base folder; root and system directories are protected)
- "downloading …" banner while downloads run
- Settings → Plugins → Plugin Configuration → jmcomic card to change the default folder and Python path
- One-time hint on first run if the environment is incomplete, with a link to the upstream project

## Screenshots

![Sidebar comic trigger](assets/comic-trigger.png)

![Small panel: search + local covers](assets/comic-pop.png)

![Large modal: local library grid](assets/comic-library.png)

## Offline

The plugin bundles jmcomic 2.7.3 source, commonX, the jmcomic-ai package and the reader frontend (in `vendor/`), so it works without installing the jmcomic PyPI package. Missing binary deps degrade automatically:

| Missing | Behavior |
|---|---|
| curl_cffi | falls back to requests |
| Pillow | no image decode; files download but can't be previewed |
| pycryptodome | prompts to install |

## Install

```bash
dsh plugin --profile web add github:lywusichen/dsh-jmcomic
```

## Build

```bash
npm install   # esbuild
npm run build # generates lib/client.js and lib/server.cjs
```

## Configuration

- Settings file: `~/.dsh/plugins/dsh-jmcomic/settings.json` (Windows)
- Downloads use the api client directly, directory rule `Bd/{Atitle}/第{Pindex}話`, low concurrency (image 3 / photo 1)

## Disclaimer

The download engine, reader frontend and some helper scripts come from hect0x7's projects, vendored under `vendor/`:

- [JMComic-Crawler-Python](https://github.com/hect0x7/JMComic-Crawler-Python) — download engine
- [jm-view-server](https://github.com/hect0x7/jm-view-server) — reader frontend
- [jmcomic-ai](https://github.com/hect0x7/jmcomic-ai) — helper scripts

Copyright belongs to their respective authors.
