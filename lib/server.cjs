var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.js
var server_exports = {};
__export(server_exports, {
  apply: () => apply,
  registerJmcomicRoutes: () => registerJmcomicRoutes
});
module.exports = __toCommonJS(server_exports);
var import_node_child_process = require("node:child_process");
var import_promises = require("node:fs/promises");
var import_node_path = require("node:path");
var PLUGIN_ROOT = (0, import_node_path.resolve)(__dirname, "..");
var VENDOR_PY = (0, import_node_path.join)(PLUGIN_ROOT, "vendor", "python");
var BRIDGE = (0, import_node_path.join)(PLUGIN_ROOT, "vendor", "scripts", "bridge.py");
var VIEWER_STATIC = (0, import_node_path.join)(PLUGIN_ROOT, "vendor", "viewer", "static");
var SETTINGS_DIR = process.env.DSH_HOME ? (0, import_node_path.join)(process.env.DSH_HOME, "plugins", "dsh-jmcomic") : (0, import_node_path.join)(process.env.USERPROFILE || process.env.HOME || ".", ".dsh", "plugins", "dsh-jmcomic");
var SETTINGS_FILE = (0, import_node_path.join)(SETTINGS_DIR, "settings.json");
var IMAGE_EXT = /* @__PURE__ */ new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff"]);
var DEFAULT_SETTINGS = {
  /** 默认本地漫画目录。 */
  baseDir: "",
  /** 已提示过安装推荐(首次提示后置 true,不再提示)。 */
  installPromptShown: false,
  /** 最近阅读记录:[{ path, albumTitle, chapterTitle, at }] 新的在前。 */
  recent: [],
  /** Python 可执行文件路径(空 = 自动探测)。 */
  pythonPath: "",
  /** 阅读器窗口尺寸/位置持久化:{ left, top, width, height } | null。 */
  readerRect: null,
  /** 阅读进度:albumPath -> { chapter, page(1-based), at }。 */
  readProgress: {}
};
var settingsCache = null;
async function loadSettings() {
  if (settingsCache !== null) return settingsCache;
  try {
    const raw = await (0, import_promises.readFile)(SETTINGS_FILE, "utf8");
    settingsCache = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    settingsCache = { ...DEFAULT_SETTINGS };
  }
  return settingsCache;
}
async function saveSettings(next) {
  settingsCache = next;
  await (0, import_promises.writeFile)(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf8");
}
function candidatePythons() {
  const list = [];
  const explicit = process.platform === "win32" ? "python.exe" : "python3";
  const explicitPath = process.env.DSH_JMCOMIC_PYTHON;
  if (explicitPath) list.push(explicitPath);
  list.push(explicit, "python");
  if (process.platform === "win32") {
    list.push(
      (0, import_node_path.join)(process.env.LOCALAPPDATA || "", "Programs", "Python", "Python312", "python.exe"),
      (0, import_node_path.join)(process.env.LOCALAPPDATA || "", "Programs", "Python", "Python311", "python.exe"),
      (0, import_node_path.join)("D:", "Programs", "Python", "Python312", "python.exe"),
      (0, import_node_path.join)("D:", "Programs", "Python", "Python311", "python.exe")
    );
  }
  return [...new Set(list)];
}
async function findPython() {
  const settings = await loadSettings();
  const ordered = settings.pythonPath ? [settings.pythonPath, ...candidatePythons()] : candidatePythons();
  for (const py of ordered) {
    if (!py) continue;
    if (await testPython(py)) return py;
  }
  return null;
}
function testPython(py) {
  return new Promise((resolvePromise) => {
    const child = (0, import_node_child_process.spawn)(py, ["-c", "import sys; print(sys.version.split()[0])"], {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill();
    }, 8e3);
    child.stdout.on("data", (d) => {
      out += d;
    });
    child.stderr.on("data", (d) => {
      err += d;
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolvePromise(code === 0 && out.trim().length > 0);
    });
    child.on("error", () => {
      clearTimeout(timer);
      resolvePromise(false);
    });
  });
}
function runBridge(py, args, timeoutMs = 12e4) {
  return new Promise((resolvePromise) => {
    const child = (0, import_node_child_process.spawn)(py, [BRIDGE, ...args], {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1",
        PYTHONPATH: VENDOR_PY
      }
    });
    let out = "";
    let err = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        child.kill();
        resolvePromise({ ok: false, error: "timeout" });
      }
    }, timeoutMs);
    child.stdout.on("data", (d) => {
      out += d;
    });
    child.stderr.on("data", (d) => {
      err += d;
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const trimmed = out.trim();
      const lastLine = trimmed.split("\n").filter(Boolean).pop() || "";
      try {
        resolvePromise(JSON.parse(lastLine));
      } catch {
        resolvePromise({ ok: false, error: `bad bridge output (code ${code}): ${err || out}`.slice(0, 500) });
      }
    });
    child.on("error", (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolvePromise({ ok: false, error: `spawn failed: ${e.message}` });
    });
  });
}
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store"
  });
  res.end(payload);
}
function sendText(res, status, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, { "content-type": contentType, "cache-control": "no-store" });
  res.end(text);
}
function readBody(req) {
  return new Promise((resolvePromise, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolvePromise(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
async function resolveDir(raw) {
  if (!raw) return null;
  const p = (0, import_node_path.resolve)(raw);
  try {
    const s = await (0, import_promises.stat)(p);
    return s.isDirectory() ? p : null;
  } catch {
    return null;
  }
}
async function listImagesInDir(dir) {
  const items = await (0, import_promises.readdir)(dir, { withFileTypes: true });
  const images = [];
  for (const item of items) {
    if (!item.isFile()) continue;
    if (!IMAGE_EXT.has((0, import_node_path.extname)(item.name).toLowerCase())) continue;
    images.push({ name: item.name, path: (0, import_node_path.join)(dir, item.name) });
  }
  const num = (n) => {
    const m = /^(\d+)/.exec(n);
    return m ? Number(m[1]) : Infinity;
  };
  images.sort((a, b) => num(a.name) - num(b.name) || a.name.localeCompare(b.name));
  return images;
}
async function handleEnv(req, res) {
  const py = await findPython();
  if (!py) {
    return sendJson(res, 200, {
      ok: false,
      pythonFound: false,
      needsPrompt: true,
      detail: "\u672A\u627E\u5230\u53EF\u7528\u7684 Python \u73AF\u5883"
    });
  }
  const r = await runBridge(py, ["env"]);
  const settings = await loadSettings();
  sendJson(res, 200, {
    ok: r.ok,
    pythonFound: true,
    python: py,
    ...r.data || {},
    needsPrompt: !settings.installPromptShown && Boolean(r.data && r.data.needs_install_prompt)
  });
}
async function handleStatus(req, res) {
  const py = await findPython();
  if (!py) return sendJson(res, 200, { ok: false, pythonFound: false, error: "no python" });
  const r = await runBridge(py, ["status"]);
  sendJson(res, 200, { ok: r.ok, pythonFound: true, ...r.data || {}, error: r.error || void 0 });
}
async function handleGetSettings(req, res) {
  const settings = await loadSettings();
  sendJson(res, 200, { ok: true, data: settings });
}
async function handleSetSettings(req, res) {
  try {
    const body = JSON.parse(await readBody(req));
    const current = await loadSettings();
    const next = { ...current };
    if (typeof body.baseDir === "string") next.baseDir = body.baseDir;
    if (typeof body.installPromptShown === "boolean") next.installPromptShown = body.installPromptShown;
    if (typeof body.pythonPath === "string") next.pythonPath = body.pythonPath;
    if (Array.isArray(body.recent)) next.recent = body.recent;
    if (body.readerRect === null || body.readerRect && typeof body.readerRect === "object" && !Array.isArray(body.readerRect)) {
      next.readerRect = body.readerRect;
    }
    if (body.readProgress && typeof body.readProgress === "object" && !Array.isArray(body.readProgress)) {
      next.readProgress = { ...next.readProgress || {}, ...body.readProgress };
    }
    await saveSettings(next);
    sendJson(res, 200, { ok: true, data: next });
  } catch (e) {
    sendJson(res, 400, { ok: false, error: String(e) });
  }
}
async function handleLibrary(req, res) {
  const settings = await loadSettings();
  const url = new URL(req.url, "http://x");
  const baseDir = url.searchParams.get("dir") || settings.baseDir;
  const dir = await resolveDir(baseDir);
  if (!dir) {
    return sendJson(res, 200, { ok: true, data: { baseDir: "", albums: [] } });
  }
  const entries = await (0, import_promises.readdir)(dir, { withFileTypes: true });
  const albums = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const albumDir = (0, import_node_path.join)(dir, entry.name);
    if (/^(covers|cover)$/i.test(entry.name)) continue;
    let coverPath = "";
    let chapterCount = 0;
    try {
      const chapterEntries = await (0, import_promises.readdir)(albumDir, { withFileTypes: true });
      const chapterDirs = chapterEntries.filter((c) => c.isDirectory());
      chapterCount = chapterDirs.length;
      if (chapterDirs.length === 0) {
        const directImages = await listImagesInDir(albumDir);
        if (directImages.length > 0) {
          chapterCount = 1;
          coverPath = directImages[0].path;
        }
      }
      if (chapterDirs.length > 0) {
        const images = await listImagesInDir((0, import_node_path.join)(albumDir, chapterDirs[0].name));
        if (images.length > 0) coverPath = images[0].path;
      }
      if (!coverPath) {
        const directImages = await listImagesInDir(albumDir);
        if (directImages.length > 0) coverPath = directImages[0].path;
      }
    } catch {
    }
    let mtime = 0;
    try {
      mtime = (await (0, import_promises.stat)(albumDir)).mtimeMs;
    } catch {
    }
    albums.push({
      title: entry.name,
      path: albumDir,
      cover: coverPath,
      chapterCount,
      mtime
    });
  }
  albums.sort((a, b) => b.mtime - a.mtime);
  const sig = `${albums.length}:${albums.length > 0 ? Math.round(albums[0].mtime) : 0}`;
  sendJson(res, 200, { ok: true, data: { baseDir: dir, albums, sig } });
}
async function handleAlbum(req, res) {
  const url = new URL(req.url, "http://x");
  const raw = url.searchParams.get("path");
  const dir = await resolveDir(raw);
  if (!dir) return sendJson(res, 404, { ok: false, error: "\u76EE\u5F55\u4E0D\u5B58\u5728" });
  const entries = await (0, import_promises.readdir)(dir, { withFileTypes: true });
  const chapters = [];
  const subDirs = entries.filter((e) => e.isDirectory());
  if (subDirs.length === 0) {
    let images = [];
    try {
      images = await listImagesInDir(dir);
    } catch {
    }
    chapters.push({
      title: (0, import_node_path.basename)(dir),
      path: dir,
      imageCount: images.length,
      cover: images[0] ? images[0].path : ""
    });
  } else {
    for (const entry of subDirs) {
      const chapterDir = (0, import_node_path.join)(dir, entry.name);
      let images = [];
      try {
        images = await listImagesInDir(chapterDir);
      } catch {
      }
      chapters.push({
        title: entry.name,
        path: chapterDir,
        imageCount: images.length,
        cover: images[0] ? images[0].path : ""
      });
    }
    chapters.sort((a, b) => a.title.localeCompare(b.title, "zh-CN", { numeric: true }));
  }
  sendJson(res, 200, { ok: true, data: { albumTitle: (0, import_node_path.basename)(dir), chapters } });
}
async function handleChapter(req, res) {
  const url = new URL(req.url, "http://x");
  const raw = url.searchParams.get("path");
  const dir = await resolveDir(raw);
  if (!dir) return sendJson(res, 404, { ok: false, error: "\u76EE\u5F55\u4E0D\u5B58\u5728" });
  const images = await listImagesInDir(dir);
  sendJson(res, 200, {
    ok: true,
    data: {
      title: (0, import_node_path.basename)(dir),
      images: images.map((i) => ({ name: i.name, path: i.path }))
    }
  });
}
async function handleImage(req, res) {
  const url = new URL(req.url, "http://x");
  const raw = url.searchParams.get("path");
  if (!raw) return sendJson(res, 400, { ok: false, error: "path required" });
  const p = (0, import_node_path.resolve)(raw);
  try {
    const s = await (0, import_promises.stat)(p);
    if (!s.isFile()) throw new Error("not a file");
    const mime = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp"
    }[(0, import_node_path.extname)(p).toLowerCase()] || "application/octet-stream";
    const data = await (0, import_promises.readFile)(p);
    res.writeHead(200, { "content-type": mime, "cache-control": "private, max-age=3600" });
    res.end(data);
  } catch {
    sendText(res, 404, "not found");
  }
}
async function handleDeleteAlbum(req, res) {
  const url = new URL(req.url, "http://x");
  const raw = url.searchParams.get("path");
  if (!raw) return sendJson(res, 400, { ok: false, error: "path required" });
  const settings = await loadSettings();
  const baseDir = settings.baseDir;
  if (!baseDir) return sendJson(res, 400, { ok: false, error: "\u8BF7\u5148\u5BFC\u5165\u672C\u5730\u6587\u4EF6\u5939" });
  const target = (0, import_node_path.resolve)(raw);
  const base = (0, import_node_path.resolve)(baseDir);
  if (target !== base && !target.startsWith(base + (0, import_node_path.normalize)("\\"))) {
    return sendJson(res, 403, { ok: false, error: "\u8DEF\u5F84\u4E0D\u5728\u5E93\u76EE\u5F55\u5185" });
  }
  if (target === base) {
    return sendJson(res, 403, { ok: false, error: "\u4E0D\u80FD\u5220\u9664\u5E93\u6839\u76EE\u5F55" });
  }
  try {
    const s = await (0, import_promises.stat)(target);
    if (!s.isDirectory()) return sendJson(res, 400, { ok: false, error: "\u76EE\u6807\u4E0D\u662F\u76EE\u5F55" });
    const sysRoots = [(0, import_node_path.normalize)("C:\\Windows"), (0, import_node_path.normalize)("C:\\Program Files"), (0, import_node_path.normalize)("C:\\Users")];
    const norm = (0, import_node_path.normalize)(target).toLowerCase();
    if (sysRoots.some((r) => norm.startsWith(r.toLowerCase()))) {
      return sendJson(res, 403, { ok: false, error: "\u7981\u6B62\u5220\u9664\u7CFB\u7EDF\u76EE\u5F55" });
    }
  } catch {
    return sendJson(res, 404, { ok: false, error: "\u76EE\u5F55\u4E0D\u5B58\u5728" });
  }
  try {
    const { rm } = await import("node:fs/promises");
    await rm(target, { recursive: true, force: true });
    sendJson(res, 200, { ok: true, data: { path: target } });
  } catch (e) {
    sendJson(res, 500, { ok: false, error: `\u5220\u9664\u5931\u8D25: ${e.message}` });
  }
}
async function handleViewerStatic(req, res) {
  const url = new URL(req.url, "http://x");
  const rel = decodeURIComponent(url.pathname.replace(/^\/jmcomic\/viewer\/static\//, ""));
  if (!rel || rel.includes("..")) return sendText(res, 403, "forbidden");
  const p = (0, import_node_path.resolve)(VIEWER_STATIC, rel);
  if (!p.startsWith(VIEWER_STATIC)) return sendText(res, 403, "forbidden");
  try {
    const s = await (0, import_promises.stat)(p);
    if (!s.isFile()) throw new Error("not a file");
    const mime = {
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json",
      ".woff2": "font/woff2",
      ".woff": "font/woff",
      ".ttf": "font/ttf",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".webmanifest": "application/manifest+json"
    }[(0, import_node_path.extname)(p).toLowerCase()] || "application/octet-stream";
    const body = await (0, import_promises.readFile)(p);
    res.writeHead(200, { "content-type": mime, "cache-control": "private, max-age=86400" });
    res.end(body);
  } catch {
    sendText(res, 404, "not found");
  }
}
async function handleViewerPage(req, res) {
  const url = new URL(req.url, "http://x");
  const raw = url.searchParams.get("path");
  const dir = await resolveDir(raw);
  if (!dir) return sendText(res, 404, "\u76EE\u5F55\u4E0D\u5B58\u5728");
  const images = await listImagesInDir(dir);
  const title = (0, import_node_path.basename)(dir);
  const chapterTitle = title;
  const imgRows = images.map((img, i) => `
    <div class="center scramble-page" id="page_${i}" data-page="${i}">
      <img class="lazyload page-img"
           src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
           data-src="/jmcomic/api/img?path=${encodeURIComponent(img.path)}"
           data-original="/jmcomic/api/img?path=${encodeURIComponent(img.path)}"
           alt="\u7B2C ${i + 1} \u9875">
    </div>`).join("\n");
  const options = images.map((img, i) => `<option value="${i}">${i + 1}/${images.length}</option>`).join("");
  const jumpOptions = images.map((img, i) => `<option value="${i}">\u7B2C ${i + 1} / ${images.length} \u9875</option>`).join("");
  const readerConfig = JSON.stringify({ albumId: title, nextDirPath: "", openFromDir: dir }).replace(/</g, "\\u003c");
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<title>\u770B\u672C \xB7 ${title}</title>
<script>(function(){var s=localStorage.getItem('jmv-theme'),p=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',s||(p?'dark':'light'));})();</script>
<link rel="stylesheet" href="/jmcomic/viewer/static/css/app.css">
<link rel="stylesheet" href="/jmcomic/viewer/static/css/reader.css">
<style>
  /* \u5927\u60AC\u6D6E\u7A97\u5185\u5D4C\u9002\u914D:\u9605\u8BFB\u5668\u586B\u6EE1\u5BBF\u4E3B,\u9690\u85CF\u6D4F\u89C8\u5668\u5168\u5C4F\u4E0E\u7AD9\u5916\u8DF3\u8F6C */
  .r-tools a[href^="http"], .r-tools a[title="\u539F\u8DEF\u8FD4\u56DE"]{display:none}
</style>
</head>
<body>
<div id="Comic_Top_Nav" style="display:none"></div>
<div class="reader-top">
  <a href="javascript:history.back()" class="r-btn" title="\u8FD4\u56DE" id="backBtn"></a>
  <div class="reader-title"><b title="${chapterTitle}">${chapterTitle}</b></div>
  <span class="r-progress" id="topProg">-- / --</span>
</div>
<div class="stream" id="stream">${imgRows}</div>
<div class="r-tools" aria-label="\u9605\u8BFB\u5DE5\u5177\u680F">
  <button class="reader-tools-handle" id="toolsHandle" type="button" aria-label="\u5C55\u5F00\u9605\u8BFB\u5DE5\u5177\u680F" aria-expanded="false" aria-pressed="false"><i></i><i></i><i></i></button>
  <div class="jump-pop" id="jumpPop"><select id="jumpSelect">${jumpOptions}</select></div>
  <div class="more-pop" id="morePop">
    <div class="more-pop-head"><b>\u9605\u8BFB\u8BBE\u7F6E</b><span>Reader controls</span></div>
    <div class="reader-mode-control" aria-label="\u9605\u8BFB\u6A21\u5F0F">
      <button id="modeScroll" type="button">\u4E0B\u62C9</button>
      <button id="modeSingle" type="button">\u5355\u9875</button>
      <button id="modeDouble" type="button">\u53CC\u9875</button>
    </div>
    <button id="tHead" title="\u9876\u90E8\u680F\u5F00\u5173" data-tip="\u9876\u90E8\u680F"></button>
    <button id="tProg" title="\u8FDB\u5EA6\u6761\u5F00\u5173" data-tip="\u8FDB\u5EA6\u6761"></button>
    <button id="tEye" title="\u62A4\u773C\u6EE4\u955C" data-tip="\u62A4\u773C\u6A21\u5F0F"></button>
    <button id="tSize" title="\u56FE\u7247\u5927\u5C0F" data-tip="\u56FE\u7247\u5927\u5C0F"></button>
    <button id="tAutoNext" title="\u81EA\u52A8\u8FDE\u64AD\u4E0B\u672C" data-tip="\u81EA\u52A8\u8FDE\u64AD"></button>
    <button id="tFull" title="\u5168\u5C4F\u9605\u8BFB" data-tip="\u5168\u5C4F\u9605\u8BFB"></button>
    <button id="tHelp" title="\u5FEB\u6377\u952E\u5E2E\u52A9" data-tip="\u5FEB\u6377\u952E\u5E2E\u52A9">?</button>
  </div>
  <div class="reader-tools-main">
    <a id="gotop" href="javascript:void(0)" title="\u56DE\u5230\u9876\u90E8" data-tip="\u56DE\u5230\u9876\u90E8"></a>
    <a id="gobottom" href="javascript:void(0)" title="\u8DF3\u5230\u6700\u540E" data-tip="\u8DF3\u5230\u6700\u540E"></a>
    <a id="tJump" href="javascript:void(0)" title="\u8DF3\u8F6C\u9875\u7801" data-tip="\u8DF3\u8F6C\u9875\u7801"></a>
    <button id="tGrid" type="button" title="\u7F29\u7565\u56FE\u603B\u89C8" data-tip="\u7F29\u7565\u56FE\u603B\u89C8" aria-label="\u6253\u5F00\u7F29\u7565\u56FE\u603B\u89C8" aria-haspopup="dialog" aria-controls="readerGridOverlay">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="6.5" height="7" rx="1"/><rect x="14" y="3.5" width="6.5" height="7" rx="1"/><rect x="3.5" y="13.5" width="6.5" height="7" rx="1"/><rect x="14" y="13.5" width="6.5" height="7" rx="1"/></svg>
    </button>
    <span class="reader-tool-divider"></span>
    <a id="loadAll" href="javascript:void(0)" title="\u52A0\u8F7D\u5168\u90E8" data-tip="\u52A0\u8F7D\u5168\u90E8"></a>
    <button id="tMore" title="\u66F4\u591A\u529F\u80FD" data-tip="\u9605\u8BFB\u8BBE\u7F6E"></button>
  </div>
</div>
<output class="reader-scroll-progress" id="readerScrollProgress" aria-hidden="true">0%</output>
<div class="reader-grid-overlay" id="readerGridOverlay" role="dialog" aria-modal="true" aria-labelledby="readerGridTitle" aria-hidden="true">
  <section class="reader-grid-sheet" aria-label="\u6F2B\u753B\u7F29\u7565\u56FE\u603B\u89C8">
    <header class="reader-grid-head">
      <div class="reader-grid-heading"><span class="reader-grid-kicker">Contact sheet</span><h2 id="readerGridTitle">\u7F29\u7565\u56FE\u603B\u89C8</h2><p id="readerGridDescription">\u53EF\u62D6\u62FD\u5361\u7247\u8C03\u6574\u9875\u9762\u987A\u5E8F,\u60AC\u505C\u53EF\u63D2\u5165\u7A7A\u767D\u9875\u5BF9\u9F50\u53CC\u9875\u3002</p></div>
      <div class="reader-grid-toolbar">
        <span class="reader-grid-stats" id="readerGridStats">\u5171 ${images.length} \u9875</span>
        <div class="reader-grid-dir-control" id="readerGridDirControl" aria-label="\u53CC\u9875\u6392\u7248\u65B9\u5411">
          <button type="button" id="dirLtr" class="reader-grid-dir-btn active" title="\u5E38\u89C4\u6392\u7248(\u4ECE\u5DE6\u5411\u53F3)">\u4ECE\u5DE6\u5411\u53F3</button>
          <button type="button" id="dirRtl" class="reader-grid-dir-btn" title="\u65E5\u6F2B\u6807\u51C6\u6392\u7248(\u4ECE\u53F3\u5411\u5DE6)">\u4ECE\u53F3\u5411\u5DE6</button>
        </div>
        <button type="button" id="readerGridDoublePreview" class="reader-grid-toolbar-btn" title="\u5207\u6362\u7F29\u7565\u56FE\u53CC\u9875\u5BF9\u5F00\u6392\u7248\u9884\u89C8">\u53CC\u9875\u9884\u89C8</button>
        <button type="button" id="readerGridReverse" class="reader-grid-toolbar-btn" title="\u53CD\u8F6C\u6574\u672C\u9875\u9762\u6392\u5217\u987A\u5E8F">\u6574\u672C\u5012\u5E8F</button>
        <button type="button" id="readerGridReset" class="reader-grid-toolbar-btn" title="\u6062\u590D\u539F\u59CB\u76F8\u518C\u987A\u5E8F\u5E76\u6E05\u7A7A\u63D2\u9875">\u6062\u590D\u9ED8\u8BA4</button>
        <label class="reader-grid-persist-toggle" title="\u5F00\u542F\u540E\u5C06\u62D6\u62FD\u6392\u5E8F\u4E0E\u63D2\u9875\u4FDD\u5B58\u81F3\u672C\u5730">
          <input type="checkbox" id="readerGridPersist"><span class="reader-grid-persist-slider"></span><span class="reader-grid-persist-text">\u8BB0\u4F4F\u6392\u5E8F</span>
        </label>
        <button class="reader-grid-close" id="readerGridClose" type="button" aria-label="\u5173\u95ED\u7F29\u7565\u56FE\u603B\u89C8">\xD7</button>
      </div>
    </header>
    <div class="reader-grid" id="readerGrid" role="group" aria-label="\u6F2B\u753B\u9875\u9762\u7F29\u7565\u56FE"></div>
  </section>
</div>
<div class="reader-help-overlay" id="readerHelp" role="dialog" aria-modal="true" aria-labelledby="readerHelpTitle">
  <div class="reader-help-card">
    <div class="reader-help-head"><div><h2 id="readerHelpTitle">\u9605\u8BFB\u5FEB\u6377\u952E</h2></div><button class="reader-help-close" id="readerHelpClose" aria-label="\u5173\u95ED\u5FEB\u6377\u952E\u5E2E\u52A9">\xD7</button></div>
    <div class="reader-shortcut-list" id="readerShortcutList"></div>
  </div>
</div>
<div class="rotate-radial" id="rotateRadial" role="menu" aria-label="\u56FE\u7247\u65CB\u8F6C\u65B9\u5411" aria-hidden="true" inert>
  <button class="rotate-sector rotate-sector-top" type="button" data-rotate="0" aria-label="\u6062\u590D\u539F\u59CB\u65B9\u5411" tabindex="-1"><span>0\xB0</span></button>
  <button class="rotate-sector rotate-sector-right" type="button" data-rotate="90" aria-label="\u5411\u53F3\u65CB\u8F6C 90 \u5EA6" tabindex="-1"><span>90\xB0</span></button>
  <button class="rotate-sector rotate-sector-bottom" type="button" data-rotate="180" aria-label="\u65CB\u8F6C 180 \u5EA6" tabindex="-1"><span>180\xB0</span></button>
  <button class="rotate-sector rotate-sector-left" type="button" data-rotate="270" aria-label="\u5411\u5DE6\u65CB\u8F6C 90 \u5EA6" tabindex="-1"><span>270\xB0</span></button>
  <span class="rotate-radial-center" aria-hidden="true">\u65CB\u8F6C</span>
</div>
<div class="r-bottom" id="rBottom">
  <span class="r-count" id="curPage">\u7B2C 1 \u9875</span>
  <div class="r-track" id="track"><div class="r-fill" id="fill"></div></div>
  <select class="r-jump" id="pageselect">${options}</select>
</div>
<script src="/jmcomic/viewer/static/js/app.js"></script>
<script src="/jmcomic/viewer/static/js/common.js"></script>
<script id="readerConfig" type="application/json">${readerConfig}</script>
<script src="/jmcomic/viewer/static/js/reader.js"></script>
</body>
</html>`;
  res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  res.end(html);
}
async function handleSearch(req, res) {
  const py = await findPython();
  if (!py) return sendJson(res, 500, { ok: false, error: "\u672A\u627E\u5230 Python \u73AF\u5883" });
  const url = new URL(req.url, "http://x");
  const q = (url.searchParams.get("q") || "").trim();
  if (!q) return sendJson(res, 400, { ok: false, error: "q required" });
  const page = Number(url.searchParams.get("page") || 1);
  const settings = await loadSettings();
  const r = await runBridge(py, ["search", q, "--page", String(page), "--base-dir", settings.baseDir]);
  sendJson(res, r.ok ? 200 : 500, r);
}
async function handleDownload(req, res) {
  const py = await findPython();
  if (!py) return sendJson(res, 500, { ok: false, error: "\u672A\u627E\u5230 Python \u73AF\u5883" });
  const body = JSON.parse(await readBody(req));
  const albumId = String(body.albumId || "").trim();
  if (!albumId) return sendJson(res, 400, { ok: false, error: "albumId required" });
  const settings = await loadSettings();
  if (!settings.baseDir) {
    return sendJson(res, 400, { ok: false, error: "\u8BF7\u5148\u5BFC\u5165\u672C\u5730\u6587\u4EF6\u5939", code: "NO_BASE_DIR" });
  }
  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
    connection: "keep-alive"
  });
  const child = (0, import_node_child_process.spawn)(py, [BRIDGE, "download", albumId, "--base-dir", settings.baseDir], {
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1", PYTHONPATH: VENDOR_PY }
  });
  let stderrBuf = "";
  child.stdout.on("data", (d) => {
    res.write(`data: ${String(d).replace(/\n/g, "\\n")}

`);
  });
  child.stderr.on("data", (d) => {
    stderrBuf += d;
  });
  child.on("close", (code) => {
    if (code === 0) {
      res.write(`event: done
data: ${JSON.stringify({ ok: true, albumId })}

`);
    } else {
      res.write(`event: error
data: ${JSON.stringify({ ok: false, error: stderrBuf.slice(0, 800) })}

`);
    }
    res.end();
  });
  child.on("error", (e) => {
    res.write(`event: error
data: ${JSON.stringify({ ok: false, error: e.message })}

`);
    res.end();
  });
}
function apply(ctx) {
  const routes = [
    ["/jmcomic/api/env", handleEnv],
    ["/jmcomic/api/status", handleStatus],
    ["/jmcomic/api/library", handleLibrary],
    ["/jmcomic/api/album", handleAlbum],
    ["/jmcomic/api/chapter", handleChapter],
    ["/jmcomic/api/img", handleImage],
    ["/jmcomic/api/search", handleSearch],
    ["/jmcomic/viewer/jm_view", handleViewerPage]
  ];
  const prefixRoutes = [
    ["/jmcomic/viewer/static", handleViewerStatic]
  ];
  const register = (path, handler) => {
    const dispose = ctx.webServer.register({
      kind: "exact",
      path,
      handler: (req, res) => {
        handler(req, res).catch((e) => {
          try {
            sendJson(res, 500, { ok: false, error: String(e) });
          } catch {
          }
        });
      }
    });
    return dispose;
  };
  ctx.effect(() => {
    const disposers = routes.map(([path, handler]) => register(path, handler));
    const prefixDisposers = prefixRoutes.map(([path, handler]) => ctx.webServer.register({
      kind: "prefix",
      path,
      handler: (req, res) => {
        handler(req, res).catch((e) => {
          try {
            sendText(res, 500, String(e));
          } catch {
          }
        });
      }
    }));
    return () => {
      for (const d of [...disposers, ...prefixDisposers]) d();
    };
  }, "dsh-jmcomic: routes");
  ctx.effect(() => {
    const d1 = ctx.webServer.register({
      kind: "exact",
      path: "/jmcomic/api/settings",
      handler: (req, res) => {
        if (req.method === "POST") handleSetSettings(req, res).catch(() => sendJson(res, 500, { ok: false, error: "settings write failed" }));
        else handleGetSettings(req, res).catch(() => sendJson(res, 500, { ok: false, error: "settings read failed" }));
      }
    });
    const d2 = ctx.webServer.register({
      kind: "exact",
      path: "/jmcomic/api/download",
      handler: (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { ok: false, error: "POST only" });
          return;
        }
        handleDownload(req, res).catch((e) => {
          try {
            sendJson(res, 500, { ok: false, error: String(e) });
          } catch {
          }
        });
      }
    });
    const d3 = ctx.webServer.register({
      kind: "exact",
      path: "/jmcomic/api/delete",
      handler: (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { ok: false, error: "POST only" });
          return;
        }
        handleDeleteAlbum(req, res).catch((e) => {
          try {
            sendJson(res, 500, { ok: false, error: String(e) });
          } catch {
          }
        });
      }
    });
    return () => {
      d1();
      d2();
      d3();
    };
  }, "dsh-jmcomic: settings+download routes");
  ctx.effect(() => {
    import("node:fs").then((fs) => fs.mkdirSync(SETTINGS_DIR, { recursive: true }));
  }, "dsh-jmcomic: settings dir");
}
function registerJmcomicRoutes(ctx) {
  apply(ctx);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  apply,
  registerJmcomicRoutes
});
