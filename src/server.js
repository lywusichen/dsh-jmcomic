/**
 * dsh-jmcomic — host half.
 *
 * Registers webServer routes under `/jmcomic/*`:
 *   GET  /jmcomic/api/env        — 环境检测(是否需首次安装提示)
 *   GET  /jmcomic/api/status     — 运行状态(内置源码/依赖)
 *   GET  /jmcomic/api/settings   — 读取插件设置(默认目录/最近阅读/提示标记)
 *   POST /jmcomic/api/settings   — 写入插件设置
 *   GET  /jmcomic/api/library    — 列出本地库(漫画目录 + 封面首图)
 *   GET  /jmcomic/api/album?path=… — 列出某漫画(目录)下的章节
 *   GET  /jmcomic/api/chapter?path=… — 列出某章节下的图片
 *   GET  /jmcomic/api/img?path=… — 流式返回本地图片文件
 *   GET  /jmcomic/api/search?q=… — 搜索漫画(桥接 python)
 *   POST /jmcomic/api/download   — 下载漫画(桥接 python,长任务)
 *
 * Python 侧:内置 jmcomic 源码在 vendor/python,未安装 jmcomic 库也能运行;
 * 所有 python 调用经 vendor/scripts/bridge.py 子进程,输出为纯 JSON。
 */

import { spawn } from 'node:child_process'
import { readFile, writeFile, stat, readdir } from 'node:fs/promises'
import { dirname, join, resolve, extname, basename, normalize } from 'node:path'

// 本文件被 esbuild 打包为 CJS(lib/server.cjs),__dirname 由 Node 提供,
// 指向 lib/ 目录,因此插件根 = lib/.. = 插件根目录。
const PLUGIN_ROOT = resolve(__dirname, '..')
const VENDOR_PY = join(PLUGIN_ROOT, 'vendor', 'python')
const BRIDGE = join(PLUGIN_ROOT, 'vendor', 'scripts', 'bridge.py')
/** jm-view-server 阅读器静态资源(vendor/viewer/static) */
const VIEWER_STATIC = join(PLUGIN_ROOT, 'vendor', 'viewer', 'static')
/** 设置持久化目录:DSH home 下(Windows: %USERPROFILE%\.dsh\plugins\dsh-jmcomic) */
const SETTINGS_DIR = process.env.DSH_HOME
  ? join(process.env.DSH_HOME, 'plugins', 'dsh-jmcomic')
  : join(process.env.USERPROFILE || process.env.HOME || '.', '.dsh', 'plugins', 'dsh-jmcomic')
const SETTINGS_FILE = join(SETTINGS_DIR, 'settings.json')

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'])

const DEFAULT_SETTINGS = {
  /** 默认本地漫画目录。 */
  baseDir: '',
  /** 已提示过安装推荐(首次提示后置 true,不再提示)。 */
  installPromptShown: false,
  /** 最近阅读记录:[{ path, albumTitle, chapterTitle, at }] 新的在前。 */
  recent: [],
  /** Python 可执行文件路径(空 = 自动探测)。 */
  pythonPath: '',
  /** 阅读器窗口尺寸/位置持久化:{ left, top, width, height } | null。 */
  readerRect: null,
  /** 阅读进度:albumPath -> { chapter, page(1-based), at }。 */
  readProgress: {},
}

/** 当前内存中的设置(进程生命周期内缓存)。 */
let settingsCache = null

async function loadSettings() {
  if (settingsCache !== null) return settingsCache
  try {
    const raw = await readFile(SETTINGS_FILE, 'utf8')
    settingsCache = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    settingsCache = { ...DEFAULT_SETTINGS }
  }
  return settingsCache
}

async function saveSettings(next) {
  settingsCache = next
  await writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), 'utf8')
}

// --- python 探测 -------------------------------------------------------------

function candidatePythons() {
  const list = []
  const explicit = process.platform === 'win32' ? 'python.exe' : 'python3'
  const explicitPath = process.env.DSH_JMCOMIC_PYTHON
  if (explicitPath) list.push(explicitPath)
  list.push(explicit, 'python')
  // 常见 Windows 安装位置
  if (process.platform === 'win32') {
    list.push(
      join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'python.exe'),
      join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python311', 'python.exe'),
      join('D:', 'Programs', 'Python', 'Python312', 'python.exe'),
      join('D:', 'Programs', 'Python', 'Python311', 'python.exe'),
    )
  }
  return [...new Set(list)]
}

/** 找到可用的 python(能 import 内置 jmcomic 的)。 */
async function findPython() {
  const settings = await loadSettings()
  const ordered = settings.pythonPath ? [settings.pythonPath, ...candidatePythons()] : candidatePythons()
  for (const py of ordered) {
    if (!py) continue
    if (await testPython(py)) return py
  }
  return null
}

function testPython(py) {
  return new Promise((resolvePromise) => {
    const child = spawn(py, ['-c', 'import sys; print(sys.version.split()[0])'], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let out = ''
    let err = ''
    const timer = setTimeout(() => { child.kill() }, 8000)
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { err += d })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolvePromise(code === 0 && out.trim().length > 0)
    })
    child.on('error', () => {
      clearTimeout(timer)
      resolvePromise(false)
    })
  })
}

/** 调用 bridge.py,返回解析后的 JSON。 */
function runBridge(py, args, timeoutMs = 120000) {
  return new Promise((resolvePromise) => {
    const child = spawn(py, [BRIDGE, ...args], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1',
        PYTHONPATH: VENDOR_PY,
      },
    })
    let out = ''
    let err = ''
    let settled = false
    const timer = setTimeout(() => {
      if (!settled) { settled = true; child.kill(); resolvePromise({ ok: false, error: 'timeout' }) }
    }, timeoutMs)
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { err += d })
    child.on('close', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      const trimmed = out.trim()
      const lastLine = trimmed.split('\n').filter(Boolean).pop() || ''
      try {
        resolvePromise(JSON.parse(lastLine))
      } catch {
        resolvePromise({ ok: false, error: `bad bridge output (code ${code}): ${err || out}`.slice(0, 500) })
      }
    })
    child.on('error', (e) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolvePromise({ ok: false, error: `spawn failed: ${e.message}` })
    })
  })
}

// --- HTTP 工具 ---------------------------------------------------------------

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  })
  res.end(payload)
}

function sendText(res, status, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': contentType, 'cache-control': 'no-store' })
  res.end(text)
}

function readBody(req) {
  return new Promise((resolvePromise, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolvePromise(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function parsePath(value) {
  if (!value) return null
  try { return normalize(value) } catch { return null }
}

/** 确保路径是本地目录并返回其绝对路径。 */
async function resolveDir(raw) {
  if (!raw) return null
  const p = resolve(raw)
  try {
    const s = await stat(p)
    return s.isDirectory() ? p : null
  } catch { return null }
}

async function listImagesInDir(dir) {
  const items = await readdir(dir, { withFileTypes: true })
  const images = []
  for (const item of items) {
    if (!item.isFile()) continue
    if (!IMAGE_EXT.has(extname(item.name).toLowerCase())) continue
    images.push({ name: item.name, path: join(dir, item.name) })
  }
  // 数字前缀优先排序(章节图片 001,002...)
  const num = (n) => {
    const m = /^(\d+)/.exec(n)
    return m ? Number(m[1]) : Infinity
  }
  images.sort((a, b) => (num(a.name) - num(b.name)) || a.name.localeCompare(b.name))
  return images
}

// --- 路由实现 ----------------------------------------------------------------

async function handleEnv(req, res) {
  const py = await findPython()
  if (!py) {
    return sendJson(res, 200, {
      ok: false,
      pythonFound: false,
      needsPrompt: true,
      detail: '未找到可用的 Python 环境',
    })
  }
  const r = await runBridge(py, ['env'])
  const settings = await loadSettings()
  sendJson(res, 200, {
    ok: r.ok,
    pythonFound: true,
    python: py,
    ...(r.data || {}),
    needsPrompt: !settings.installPromptShown && Boolean(r.data && r.data.needs_install_prompt),
  })
}

async function handleStatus(req, res) {
  const py = await findPython()
  if (!py) return sendJson(res, 200, { ok: false, pythonFound: false, error: 'no python' })
  const r = await runBridge(py, ['status'])
  sendJson(res, 200, { ok: r.ok, pythonFound: true, ...(r.data || {}), error: r.error || undefined })
}

async function handleGetSettings(req, res) {
  const settings = await loadSettings()
  sendJson(res, 200, { ok: true, data: settings })
}

async function handleSetSettings(req, res) {
  try {
    const body = JSON.parse(await readBody(req))
    const current = await loadSettings()
    const next = { ...current }
    if (typeof body.baseDir === 'string') next.baseDir = body.baseDir
    if (typeof body.installPromptShown === 'boolean') next.installPromptShown = body.installPromptShown
    if (typeof body.pythonPath === 'string') next.pythonPath = body.pythonPath
    if (Array.isArray(body.recent)) next.recent = body.recent
    // 阅读器窗口尺寸/位置:接受 { left, top, width, height } 或 null(恢复默认)
    if (body.readerRect === null || (body.readerRect && typeof body.readerRect === 'object' && !Array.isArray(body.readerRect))) {
      next.readerRect = body.readerRect
    }
    // 阅读进度:albumPath -> { chapter, page, at },与现有进度深合并
    if (body.readProgress && typeof body.readProgress === 'object' && !Array.isArray(body.readProgress)) {
      next.readProgress = { ...(next.readProgress || {}), ...body.readProgress }
    }
    await saveSettings(next)
    sendJson(res, 200, { ok: true, data: next })
  } catch (e) {
    sendJson(res, 400, { ok: false, error: String(e) })
  }
}

async function handleLibrary(req, res) {
  const settings = await loadSettings()
  const url = new URL(req.url, 'http://x')
  const baseDir = url.searchParams.get('dir') || settings.baseDir
  const dir = await resolveDir(baseDir)
  if (!dir) {
    return sendJson(res, 200, { ok: true, data: { baseDir: '', albums: [] } })
  }
  const entries = await readdir(dir, { withFileTypes: true })
  const albums = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const albumDir = join(dir, entry.name)
    // 跳过封面目录等辅助目录
    if (/^(covers|cover)$/i.test(entry.name)) continue
    let coverPath = ''
    let chapterCount = 0
    try {
      const chapterEntries = await readdir(albumDir, { withFileTypes: true })
      const chapterDirs = chapterEntries.filter((c) => c.isDirectory())
      chapterCount = chapterDirs.length
      // 单章节漫画(图片在根目录):章节数记为 1
      if (chapterDirs.length === 0) {
        const directImages = await listImagesInDir(albumDir)
        if (directImages.length > 0) {
          chapterCount = 1
          coverPath = directImages[0].path
        }
      }
      // 封面:优先取第一个章节的第一张图
      if (chapterDirs.length > 0) {
        const images = await listImagesInDir(join(albumDir, chapterDirs[0].name))
        if (images.length > 0) coverPath = images[0].path
      }
      if (!coverPath) {
        const directImages = await listImagesInDir(albumDir)
        if (directImages.length > 0) coverPath = directImages[0].path
      }
    } catch { /* 目录读取失败跳过 */ }
    let mtime = 0
    try { mtime = (await stat(albumDir)).mtimeMs } catch { /* ignore */ }
    albums.push({
      title: entry.name,
      path: albumDir,
      cover: coverPath,
      chapterCount,
      mtime,
    })
  }
  // 按修改时间倒序
  albums.sort((a, b) => b.mtime - a.mtime)
  // sig:目录内容指纹(专辑数 + 最新 mtime),client 轮询用它检测变动
  const sig = `${albums.length}:${albums.length > 0 ? Math.round(albums[0].mtime) : 0}`
  sendJson(res, 200, { ok: true, data: { baseDir: dir, albums, sig } })
}

async function handleAlbum(req, res) {
  const url = new URL(req.url, 'http://x')
  const raw = url.searchParams.get('path')
  const dir = await resolveDir(raw)
  if (!dir) return sendJson(res, 404, { ok: false, error: '目录不存在' })
  const entries = await readdir(dir, { withFileTypes: true })
  const chapters = []
  const subDirs = entries.filter((e) => e.isDirectory())
  // 单章节漫画:图片直接放在专辑根目录(无章节子目录),把根目录本身作为一个章节
  if (subDirs.length === 0) {
    let images = []
    try { images = await listImagesInDir(dir) } catch { /* ignore */ }
    chapters.push({
      title: basename(dir),
      path: dir,
      imageCount: images.length,
      cover: images[0] ? images[0].path : '',
    })
  } else {
    for (const entry of subDirs) {
      const chapterDir = join(dir, entry.name)
      let images = []
      try { images = await listImagesInDir(chapterDir) } catch { /* ignore */ }
      chapters.push({
        title: entry.name,
        path: chapterDir,
        imageCount: images.length,
        cover: images[0] ? images[0].path : '',
      })
    }
    chapters.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN', { numeric: true }))
  }
  sendJson(res, 200, { ok: true, data: { albumTitle: basename(dir), chapters } })
}

async function handleChapter(req, res) {
  const url = new URL(req.url, 'http://x')
  const raw = url.searchParams.get('path')
  const dir = await resolveDir(raw)
  if (!dir) return sendJson(res, 404, { ok: false, error: '目录不存在' })
  const images = await listImagesInDir(dir)
  sendJson(res, 200, {
    ok: true,
    data: {
      title: basename(dir),
      images: images.map((i) => ({ name: i.name, path: i.path })),
    },
  })
}

async function handleImage(req, res) {
  const url = new URL(req.url, 'http://x')
  const raw = url.searchParams.get('path')
  if (!raw) return sendJson(res, 400, { ok: false, error: 'path required' })
  const p = resolve(raw)
  try {
    const s = await stat(p)
    if (!s.isFile()) throw new Error('not a file')
    const mime = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp',
    }[extname(p).toLowerCase()] || 'application/octet-stream'
    const data = await readFile(p)
    res.writeHead(200, { 'content-type': mime, 'cache-control': 'private, max-age=3600' })
    res.end(data)
  } catch {
    sendText(res, 404, 'not found')
  }
}

/** 删除本地漫画目录(安全护栏:只能删 baseDir 下的专辑,禁删根/系统目录)。 */
async function handleDeleteAlbum(req, res) {
  const url = new URL(req.url, 'http://x')
  const raw = url.searchParams.get('path')
  if (!raw) return sendJson(res, 400, { ok: false, error: 'path required' })
  const settings = await loadSettings()
  const baseDir = settings.baseDir
  if (!baseDir) return sendJson(res, 400, { ok: false, error: '请先导入本地文件夹' })

  const target = resolve(raw)
  const base = resolve(baseDir)
  // 目标必须在 baseDir 之内,且不等于 baseDir 本身(防止删整个库)
  if (target !== base && !target.startsWith(base + normalize('\\'))) {
    return sendJson(res, 403, { ok: false, error: '路径不在库目录内' })
  }
  if (target === base) {
    return sendJson(res, 403, { ok: false, error: '不能删除库根目录' })
  }
  try {
    const s = await stat(target)
    if (!s.isDirectory()) return sendJson(res, 400, { ok: false, error: '目标不是目录' })
    // 系统目录保护
    const sysRoots = [normalize('C:\\Windows'), normalize('C:\\Program Files'), normalize('C:\\Users')]
    const norm = normalize(target).toLowerCase()
    if (sysRoots.some((r) => norm.startsWith(r.toLowerCase()))) {
      return sendJson(res, 403, { ok: false, error: '禁止删除系统目录' })
    }
  } catch {
    return sendJson(res, 404, { ok: false, error: '目录不存在' })
  }
  try {
    const { rm } = await import('node:fs/promises')
    await rm(target, { recursive: true, force: true })
    sendJson(res, 200, { ok: true, data: { path: target } })
  } catch (e) {
    sendJson(res, 500, { ok: false, error: `删除失败: ${e.message}` })
  }
}

// --- viewer(阅读器)------------------------------------------------------------

/** 服务 jm-view-server 静态资源(js/css/webfonts),映射到 /jmcomic/viewer/static/* */
async function handleViewerStatic(req, res) {
  const url = new URL(req.url, 'http://x')
  const rel = decodeURIComponent(url.pathname.replace(/^\/jmcomic\/viewer\/static\//, ''))
  if (!rel || rel.includes('..')) return sendText(res, 403, 'forbidden')
  const p = resolve(VIEWER_STATIC, rel)
  if (!p.startsWith(VIEWER_STATIC)) return sendText(res, 403, 'forbidden')
  try {
    const s = await stat(p)
    if (!s.isFile()) throw new Error('not a file')
    const mime = {
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json',
      '.woff2': 'font/woff2',
      '.woff': 'font/woff',
      '.ttf': 'font/ttf',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.webmanifest': 'application/manifest+json',
    }[extname(p).toLowerCase()] || 'application/octet-stream'
    const body = await readFile(p)
    res.writeHead(200, { 'content-type': mime, 'cache-control': 'private, max-age=86400' })
    res.end(body)
  } catch {
    sendText(res, 404, 'not found')
  }
}

/** 渲染 jm_view 阅读页(参考 jm-view-server jm_view.html,数据源换成本地目录)。 */
async function handleViewerPage(req, res) {
  const url = new URL(req.url, 'http://x')
  const raw = url.searchParams.get('path')
  const dir = await resolveDir(raw)
  if (!dir) return sendText(res, 404, '目录不存在')
  const images = await listImagesInDir(dir)
  const title = basename(dir)
  const chapterTitle = title
  const imgRows = images.map((img, i) => `
    <div class="center scramble-page" id="page_${i}" data-page="${i}">
      <img class="lazyload page-img"
           src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
           data-src="/jmcomic/api/img?path=${encodeURIComponent(img.path)}"
           data-original="/jmcomic/api/img?path=${encodeURIComponent(img.path)}"
           alt="第 ${i + 1} 页">
    </div>`).join('\n')
  const options = images.map((img, i) => `<option value="${i}">${i + 1}/${images.length}</option>`).join('')
  const jumpOptions = images.map((img, i) => `<option value="${i}">第 ${i + 1} / ${images.length} 页</option>`).join('')
  const readerConfig = JSON.stringify({ albumId: title, nextDirPath: '', openFromDir: dir }).replace(/</g, '\\u003c')
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<title>看本 · ${title}</title>
<script>(function(){var s=localStorage.getItem('jmv-theme'),p=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',s||(p?'dark':'light'));})();</script>
<link rel="stylesheet" href="/jmcomic/viewer/static/css/app.css">
<link rel="stylesheet" href="/jmcomic/viewer/static/css/reader.css">
<style>
  /* 大悬浮窗内嵌适配:阅读器填满宿主,隐藏浏览器全屏与站外跳转 */
  .r-tools a[href^="http"], .r-tools a[title="原路返回"]{display:none}
</style>
</head>
<body>
<div id="Comic_Top_Nav" style="display:none"></div>
<div class="reader-top">
  <a href="javascript:history.back()" class="r-btn" title="返回" id="backBtn"></a>
  <div class="reader-title"><b title="${chapterTitle}">${chapterTitle}</b></div>
  <span class="r-progress" id="topProg">-- / --</span>
</div>
<div class="stream" id="stream">${imgRows}</div>
<div class="r-tools" aria-label="阅读工具栏">
  <button class="reader-tools-handle" id="toolsHandle" type="button" aria-label="展开阅读工具栏" aria-expanded="false" aria-pressed="false"><i></i><i></i><i></i></button>
  <div class="jump-pop" id="jumpPop"><select id="jumpSelect">${jumpOptions}</select></div>
  <div class="more-pop" id="morePop">
    <div class="more-pop-head"><b>阅读设置</b><span>Reader controls</span></div>
    <div class="reader-mode-control" aria-label="阅读模式">
      <button id="modeScroll" type="button">下拉</button>
      <button id="modeSingle" type="button">单页</button>
      <button id="modeDouble" type="button">双页</button>
    </div>
    <button id="tHead" title="顶部栏开关" data-tip="顶部栏"></button>
    <button id="tProg" title="进度条开关" data-tip="进度条"></button>
    <button id="tEye" title="护眼滤镜" data-tip="护眼模式"></button>
    <button id="tSize" title="图片大小" data-tip="图片大小"></button>
    <button id="tAutoNext" title="自动连播下本" data-tip="自动连播"></button>
    <button id="tFull" title="全屏阅读" data-tip="全屏阅读"></button>
    <button id="tHelp" title="快捷键帮助" data-tip="快捷键帮助">?</button>
  </div>
  <div class="reader-tools-main">
    <a id="gotop" href="javascript:void(0)" title="回到顶部" data-tip="回到顶部"></a>
    <a id="gobottom" href="javascript:void(0)" title="跳到最后" data-tip="跳到最后"></a>
    <a id="tJump" href="javascript:void(0)" title="跳转页码" data-tip="跳转页码"></a>
    <button id="tGrid" type="button" title="缩略图总览" data-tip="缩略图总览" aria-label="打开缩略图总览" aria-haspopup="dialog" aria-controls="readerGridOverlay">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="6.5" height="7" rx="1"/><rect x="14" y="3.5" width="6.5" height="7" rx="1"/><rect x="3.5" y="13.5" width="6.5" height="7" rx="1"/><rect x="14" y="13.5" width="6.5" height="7" rx="1"/></svg>
    </button>
    <span class="reader-tool-divider"></span>
    <a id="loadAll" href="javascript:void(0)" title="加载全部" data-tip="加载全部"></a>
    <button id="tMore" title="更多功能" data-tip="阅读设置"></button>
  </div>
</div>
<output class="reader-scroll-progress" id="readerScrollProgress" aria-hidden="true">0%</output>
<div class="reader-grid-overlay" id="readerGridOverlay" role="dialog" aria-modal="true" aria-labelledby="readerGridTitle" aria-hidden="true">
  <section class="reader-grid-sheet" aria-label="漫画缩略图总览">
    <header class="reader-grid-head">
      <div class="reader-grid-heading"><span class="reader-grid-kicker">Contact sheet</span><h2 id="readerGridTitle">缩略图总览</h2><p id="readerGridDescription">可拖拽卡片调整页面顺序,悬停可插入空白页对齐双页。</p></div>
      <div class="reader-grid-toolbar">
        <span class="reader-grid-stats" id="readerGridStats">共 ${images.length} 页</span>
        <div class="reader-grid-dir-control" id="readerGridDirControl" aria-label="双页排版方向">
          <button type="button" id="dirLtr" class="reader-grid-dir-btn active" title="常规排版(从左向右)">从左向右</button>
          <button type="button" id="dirRtl" class="reader-grid-dir-btn" title="日漫标准排版(从右向左)">从右向左</button>
        </div>
        <button type="button" id="readerGridDoublePreview" class="reader-grid-toolbar-btn" title="切换缩略图双页对开排版预览">双页预览</button>
        <button type="button" id="readerGridReverse" class="reader-grid-toolbar-btn" title="反转整本页面排列顺序">整本倒序</button>
        <button type="button" id="readerGridReset" class="reader-grid-toolbar-btn" title="恢复原始相册顺序并清空插页">恢复默认</button>
        <label class="reader-grid-persist-toggle" title="开启后将拖拽排序与插页保存至本地">
          <input type="checkbox" id="readerGridPersist"><span class="reader-grid-persist-slider"></span><span class="reader-grid-persist-text">记住排序</span>
        </label>
        <button class="reader-grid-close" id="readerGridClose" type="button" aria-label="关闭缩略图总览">×</button>
      </div>
    </header>
    <div class="reader-grid" id="readerGrid" role="group" aria-label="漫画页面缩略图"></div>
  </section>
</div>
<div class="reader-help-overlay" id="readerHelp" role="dialog" aria-modal="true" aria-labelledby="readerHelpTitle">
  <div class="reader-help-card">
    <div class="reader-help-head"><div><h2 id="readerHelpTitle">阅读快捷键</h2></div><button class="reader-help-close" id="readerHelpClose" aria-label="关闭快捷键帮助">×</button></div>
    <div class="reader-shortcut-list" id="readerShortcutList"></div>
  </div>
</div>
<div class="rotate-radial" id="rotateRadial" role="menu" aria-label="图片旋转方向" aria-hidden="true" inert>
  <button class="rotate-sector rotate-sector-top" type="button" data-rotate="0" aria-label="恢复原始方向" tabindex="-1"><span>0°</span></button>
  <button class="rotate-sector rotate-sector-right" type="button" data-rotate="90" aria-label="向右旋转 90 度" tabindex="-1"><span>90°</span></button>
  <button class="rotate-sector rotate-sector-bottom" type="button" data-rotate="180" aria-label="旋转 180 度" tabindex="-1"><span>180°</span></button>
  <button class="rotate-sector rotate-sector-left" type="button" data-rotate="270" aria-label="向左旋转 90 度" tabindex="-1"><span>270°</span></button>
  <span class="rotate-radial-center" aria-hidden="true">旋转</span>
</div>
<div class="r-bottom" id="rBottom">
  <span class="r-count" id="curPage">第 1 页</span>
  <div class="r-track" id="track"><div class="r-fill" id="fill"></div></div>
  <select class="r-jump" id="pageselect">${options}</select>
</div>
<script src="/jmcomic/viewer/static/js/app.js"></script>
<script src="/jmcomic/viewer/static/js/common.js"></script>
<script id="readerConfig" type="application/json">${readerConfig}</script>
<script src="/jmcomic/viewer/static/js/reader.js"></script>
</body>
</html>`
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
  res.end(html)
}

async function handleSearch(req, res) {
  const py = await findPython()
  if (!py) return sendJson(res, 500, { ok: false, error: '未找到 Python 环境' })
  const url = new URL(req.url, 'http://x')
  const q = (url.searchParams.get('q') || '').trim()
  if (!q) return sendJson(res, 400, { ok: false, error: 'q required' })
  const page = Number(url.searchParams.get('page') || 1)
  const settings = await loadSettings()
  const r = await runBridge(py, ['search', q, '--page', String(page), '--base-dir', settings.baseDir])
  sendJson(res, r.ok ? 200 : 500, r)
}

async function handleDownload(req, res) {
  const py = await findPython()
  if (!py) return sendJson(res, 500, { ok: false, error: '未找到 Python 环境' })
  const body = JSON.parse(await readBody(req))
  const albumId = String(body.albumId || '').trim()
  if (!albumId) return sendJson(res, 400, { ok: false, error: 'albumId required' })
  const settings = await loadSettings()
  if (!settings.baseDir) {
    return sendJson(res, 400, { ok: false, error: '请先导入本地文件夹', code: 'NO_BASE_DIR' })
  }
  // 长任务:SSE 流式返回进度
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  })
  const child = spawn(py, [BRIDGE, 'download', albumId, '--base-dir', settings.baseDir], {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', PYTHONPATH: VENDOR_PY },
  })
  let stderrBuf = ''
  child.stdout.on('data', (d) => { res.write(`data: ${String(d).replace(/\n/g, '\\n')}\n\n`) })
  child.stderr.on('data', (d) => { stderrBuf += d })
  child.on('close', (code) => {
    if (code === 0) {
      res.write(`event: done\ndata: ${JSON.stringify({ ok: true, albumId })}\n\n`)
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ ok: false, error: stderrBuf.slice(0, 800) })}\n\n`)
    }
    res.end()
  })
  child.on('error', (e) => {
    res.write(`event: error\ndata: ${JSON.stringify({ ok: false, error: e.message })}\n\n`)
    res.end()
  })
}

// --- 插件安装 ----------------------------------------------------------------

export function apply(ctx) {
  const routes = [
    ['/jmcomic/api/env', handleEnv],
    ['/jmcomic/api/status', handleStatus],
    ['/jmcomic/api/library', handleLibrary],
    ['/jmcomic/api/album', handleAlbum],
    ['/jmcomic/api/chapter', handleChapter],
    ['/jmcomic/api/img', handleImage],
    ['/jmcomic/api/search', handleSearch],
    ['/jmcomic/viewer/jm_view', handleViewerPage],
  ]
  // 静态资源用 prefix 路由
  const prefixRoutes = [
    ['/jmcomic/viewer/static', handleViewerStatic],
  ]
  const register = (path, handler) => {
    const dispose = ctx.webServer.register({
      kind: 'exact',
      path,
      handler: (req, res) => {
        handler(req, res).catch((e) => {
          try { sendJson(res, 500, { ok: false, error: String(e) }) } catch { /* ignore */ }
        })
      },
    })
    return dispose
  }
  ctx.effect(() => {
    const disposers = routes.map(([path, handler]) => register(path, handler))
    const prefixDisposers = prefixRoutes.map(([path, handler]) => ctx.webServer.register({
      kind: 'prefix',
      path,
      handler: (req, res) => {
        handler(req, res).catch((e) => {
          try { sendText(res, 500, String(e)) } catch { /* ignore */ }
        })
      },
    }))
    return () => { for (const d of [...disposers, ...prefixDisposers]) d() }
  }, 'dsh-jmcomic: routes')

  // settings 方法分发与 download(长连接 SSE)单独注册
  ctx.effect(() => {
    const d1 = ctx.webServer.register({
      kind: 'exact',
      path: '/jmcomic/api/settings',
      handler: (req, res) => {
        if (req.method === 'POST') handleSetSettings(req, res).catch(() => sendJson(res, 500, { ok: false, error: 'settings write failed' }))
        else handleGetSettings(req, res).catch(() => sendJson(res, 500, { ok: false, error: 'settings read failed' }))
      },
    })
    const d2 = ctx.webServer.register({
      kind: 'exact',
      path: '/jmcomic/api/download',
      handler: (req, res) => {
        if (req.method !== 'POST') { sendJson(res, 405, { ok: false, error: 'POST only' }); return }
        handleDownload(req, res).catch((e) => { try { sendJson(res, 500, { ok: false, error: String(e) }) } catch { /* ignore */ } })
      },
    })
    const d3 = ctx.webServer.register({
      kind: 'exact',
      path: '/jmcomic/api/delete',
      handler: (req, res) => {
        if (req.method !== 'POST') { sendJson(res, 405, { ok: false, error: 'POST only' }); return }
        handleDeleteAlbum(req, res).catch((e) => { try { sendJson(res, 500, { ok: false, error: String(e) }) } catch { /* ignore */ } })
      },
    })
    return () => { d1(); d2(); d3() }
  }, 'dsh-jmcomic: settings+download routes')

  // 确保设置目录存在
  ctx.effect(() => {
    import('node:fs').then((fs) => fs.mkdirSync(SETTINGS_DIR, { recursive: true }))
  }, 'dsh-jmcomic: settings dir')
}

/**
 * 供 index.js 调用的注册入口(server.cjs 被打包进 lib/,非独立 cordis 插件)。
 * 路径常量基于打包后 __dirname(lib/)推导,root 参数仅为兼容保留。
 * @param ctx - host plugin context(需含 webServer 服务)。
 */
export function registerJmcomicRoutes(ctx) {
  apply(ctx)
}
