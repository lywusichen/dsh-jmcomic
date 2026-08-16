var module = { exports: {} }; var exports = module.exports;
window.__ModuleLoader__.load({ id: "dsh-jmcomic", factory: (require) => {
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var NS = "dsh-jmcomic";
var zh = {
  "comic.trigger": "comic",
  "comic.searchPlaceholder": "\u641C\u7D22\u4EE5\u4E0B\u8F7D",
  "comic.importFolder": "\u5BFC\u5165\u672C\u5730\u6587\u4EF6\u5939",
  "comic.imported": "\u672C\u5730\u6587\u4EF6\u5939\u5DF2\u7ED1\u5B9A: {dir}",
  "comic.importHint": "\u5982\u9700\u66F4\u6362\u6587\u4EF6\u5939\u8BF7\u5728\u63D2\u4EF6\u8BBE\u7F6E\u91CC\u8FDB\u884C\u64CD\u4F5C",
  "comic.more": "\u66F4\u591A",
  "comic.noBaseDir": "\u8BF7\u5148\u5BFC\u5165\u672C\u5730\u6587\u4EF6\u5939",
  "comic.library": "\u672C\u5730\u6F2B\u753B\u5E93",
  "comic.empty": "\u6587\u4EF6\u5939\u4E2D\u6CA1\u6709\u6F2B\u753B",
  "comic.changeDir": "\u66F4\u6539\u6587\u4EF6\u76EE\u5F55",
  "comic.close": "\u5173\u95ED",
  "comic.back": "\u8FD4\u56DE",
  "comic.chapters": "\u7AE0\u8282",
  "comic.pages": "\u9875",
  "comic.searching": "\u641C\u7D22\u4E2D\u2026",
  "comic.searchEmpty": "\u6CA1\u6709\u627E\u5230\u76F8\u5173\u6F2B\u753B",
  "comic.downloading": "\u4E0B\u8F7D\u4E2D\u2026",
  "comic.downloadDone": "\u4E0B\u8F7D\u5B8C\u6210",
  "comic.downloadFailed": "\u4E0B\u8F7D\u5931\u8D25",
  "comic.installTitle": "\u63A8\u8350\u5B89\u88C5 jmcomic",
  "comic.installBody": "\u672A\u68C0\u6D4B\u5230\u5B8C\u6574\u7684 jmcomic \u8FD0\u884C\u73AF\u5883\u3002\u5B89\u88C5 JMComic-Crawler-Python \u540E\u53EF\u83B7\u5F97\u5B8C\u6574\u7684\u641C\u7D22\u4E0E\u4E0B\u8F7D\u529F\u80FD:",
  "comic.installLink": "https://github.com/hect0x7/JMComic-Crawler-Python",
  "comic.gotIt": "\u77E5\u9053\u4E86",
  "comic.openGithub": "\u6253\u5F00 GitHub",
  "comic.settingsTitle": "jmcomic \u63D2\u4EF6\u8BBE\u7F6E",
  "comic.settingsBaseDir": "\u9ED8\u8BA4\u672C\u5730\u6587\u4EF6\u5939",
  "comic.settingsBaseDirPlaceholder": "\u7559\u7A7A\u4F7F\u7528\u5F53\u524D\u7ED1\u5B9A\u76EE\u5F55",
  "comic.settingsPick": "\u9009\u62E9\u6587\u4EF6\u5939",
  "comic.settingsPython": "Python \u53EF\u6267\u884C\u6587\u4EF6(\u53EF\u9009)"
};
var en = {
  "comic.trigger": "comic",
  "comic.searchPlaceholder": "Search to download",
  "comic.importFolder": "Import local folder",
  "comic.imported": "Local folder bound: {dir}",
  "comic.importHint": "To change the folder, use the plugin settings",
  "comic.more": "More",
  "comic.noBaseDir": "Please import a local folder first",
  "comic.library": "Local Library",
  "comic.empty": "No comics in this folder",
  "comic.changeDir": "Change folder",
  "comic.close": "Close",
  "comic.back": "Back",
  "comic.chapters": "Chapters",
  "comic.pages": "pages",
  "comic.searching": "Searching\u2026",
  "comic.searchEmpty": "No comics found",
  "comic.downloading": "Downloading\u2026",
  "comic.downloadDone": "Download complete",
  "comic.downloadFailed": "Download failed",
  "comic.installTitle": "jmcomic is recommended",
  "comic.installBody": "A complete jmcomic runtime was not detected. Install JMComic-Crawler-Python for full search & download:",
  "comic.installLink": "https://github.com/hect0x7/JMComic-Crawler-Python",
  "comic.gotIt": "Got it",
  "comic.openGithub": "Open GitHub",
  "comic.settingsTitle": "jmcomic Plugin Settings",
  "comic.settingsBaseDir": "Default local folder",
  "comic.settingsBaseDirPlaceholder": "Leave empty to keep current binding",
  "comic.settingsPick": "Pick folder",
  "comic.settingsPython": "Python executable (optional)"
};
var STYLE_ID = "dsh-jmcomic-styles";
var STYLES = `
#${STYLE_ID}{}
.dsh-jmcomic__trigger{flex:1 0 100%;display:flex;align-items:center;gap:6px;width:100%;height:28px;margin:2px 0;padding:4px 2px 4px 10px;box-sizing:border-box;border:none;border-radius:10px;background:transparent;cursor:pointer;overflow:hidden;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:20px}
.dsh-jmcomic__trigger:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-jmcomic__trigger.rail{flex:0 0 auto;width:30px;height:30px;margin:4px auto 6px;justify-content:center;gap:0;padding:0;border-radius:50%}
.dsh-jmcomic__triggerIcon{flex:none;display:inline-flex;align-items:center;justify-content:center}
.dsh-jmcomic__triggerLabel{overflow:hidden;white-space:nowrap}
.dsh-jmcomic__pop{position:fixed;z-index:900;display:flex;flex-direction:column;width:320px;max-width:calc(100vw - 24px);border-radius:16px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv3);border:1px solid var(--dsw-alias-border-l2);font-family:inherit}
.dsh-jmcomic__popBody{padding:12px;display:flex;flex-direction:column;gap:10px}
.dsh-jmcomic__search{display:flex;gap:6px}
.dsh-jmcomic__input{flex:1;min-width:0;height:34px;padding:0 12px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-input);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;outline:none}
.dsh-jmcomic__input:focus{border-color:var(--dsw-alias-accent-1)}
.dsh-jmcomic__btn{flex:none;display:inline-flex;align-items:center;justify-content:center;height:34px;padding:0 14px;box-sizing:border-box;border:none;border-radius:10px;background:var(--dsw-alias-accent-1);color:#fff;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap}
.dsh-jmcomic__btn:hover{filter:brightness(1.08)}
.dsh-jmcomic__btn:disabled{opacity:.5;cursor:default}
.dsh-jmcomic__btn.secondary{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}
.dsh-jmcomic__btn.ghost{background:transparent;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l2)}
.dsh-jmcomic__hint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);word-break:break-all}
.dsh-jmcomic__recent{display:flex;align-items:center;gap:8px}
.dsh-jmcomic__covers{display:flex;gap:8px;flex:1;min-width:0;overflow:hidden}
.dsh-jmcomic__cover{flex:none;width:72px;height:96px;border-radius:8px;overflow:hidden;cursor:pointer;position:relative;background:var(--dsw-alias-interactive-bg-hover);border:1px solid var(--dsw-alias-border-l2)}
.dsh-jmcomic__cover img{width:100%;height:100%;object-fit:cover;display:block}
.dsh-jmcomic__moreBtn{flex:none;align-self:center;height:30px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12px;cursor:pointer}
.dsh-jmcomic__moreBtn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-jmcomic__overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center}
.dsh-jmcomic__mask{position:absolute;inset:0;background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur)}
.dsh-jmcomic__modal{position:relative;z-index:1;display:flex;flex-direction:column;width:880px;max-width:calc(100vw - 48px);height:min(640px,calc(100vh - 48px));border-radius:24px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv3);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}
.dsh-jmcomic__modalHeader{flex:none;display:flex;align-items:center;gap:8px;height:54px;padding:0 14px 0 20px;box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2)}
.dsh-jmcomic__modalTitle{flex:1;min-width:0;font-size:16px;font-weight:500;color:var(--dsw-alias-label-primary);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.dsh-jmcomic__close{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:none;border-radius:28px;background:transparent;cursor:pointer;color:var(--dsw-alias-label-primary)}
.dsh-jmcomic__close:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-jmcomic__grid{flex:1;min-height:0;overflow-y:auto;padding:16px 20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px}
.dsh-jmcomic__cardWrap{position:relative;min-width:0}
.dsh-jmcomic__card{min-width:0;width:100%;cursor:pointer;border:none;background:transparent;padding:0;text-align:left;font-family:inherit;display:flex;flex-direction:column;gap:6px}
.dsh-jmcomic__cardDelete{position:absolute;top:6px;right:6px;width:26px;height:26px;padding:0;border:none;border-radius:8px;background:rgba(0,0,0,.55);color:#fff;font-size:13px;cursor:pointer;display:none;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
.dsh-jmcomic__cardWrap:hover .dsh-jmcomic__cardDelete,.dsh-jmcomic__cardDelete:focus-visible{display:flex}
.dsh-jmcomic__cardDelete:hover{background:rgba(200,40,40,.85)}
.dsh-jmcomic__cardCover{width:100%;aspect-ratio:3/4;border-radius:10px;overflow:hidden;background:var(--dsw-alias-interactive-bg-hover);border:1px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dsh-jmcomic__cardCover img{width:100%;height:100%;object-fit:cover;display:block}
.dsh-jmcomic__cardTitle{font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.dsh-jmcomic__cardMeta{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.dsh-jmcomic__state{padding:20px;text-align:center;font-size:13px;color:var(--dsw-alias-label-tertiary)}
.dsh-jmcomic__reader{flex:1;min-height:0;display:flex;flex-direction:column}
.dsh-jmcomic__readerTop{flex:none;display:flex;align-items:center;gap:8px;height:44px;padding:0 12px;border-bottom:1px solid var(--dsw-alias-border-l2)}
.dsh-jmcomic__readerChapters{display:flex;gap:6px;flex:1;min-width:0;overflow-x:auto}
.dsh-jmcomic__chip{flex:none;height:28px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:transparent;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:12px;cursor:pointer;white-space:nowrap}
.dsh-jmcomic__chip.active{background:var(--dsw-alias-accent-1);color:#fff;border-color:transparent}
.dsh-jmcomic__readerView{flex:1;min-height:0;overflow-y:auto;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:4px}
.dsh-jmcomic__readerView img{max-width:100%;display:block;height:auto}
.dsh-jmcomic__toast{position:fixed;left:50%;bottom:48px;transform:translateX(-50%);z-index:1100;max-width:calc(100vw - 48px);padding:10px 18px;border-radius:12px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-shadow-lv3);font-family:inherit;font-size:13px;border:1px solid var(--dsw-alias-border-l2)}
.dsh-jmcomic__searchResults{display:flex;flex-direction:column;gap:8px;max-height:320px;overflow-y:auto}
.dsh-jmcomic__resultRow{display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;cursor:pointer}
.dsh-jmcomic__resultRow:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-jmcomic__resultCover{flex:none;width:40px;height:54px;border-radius:6px;object-fit:cover;background:var(--dsw-alias-interactive-bg-hover)}
.dsh-jmcomic__resultInfo{flex:1;min-width:0}
.dsh-jmcomic__resultTitle{font-size:13px;line-height:18px;color:var(--dsw-alias-label-primary);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.dsh-jmcomic__resultMeta{font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dsh-jmcomic__resultActions{flex:none;display:flex;gap:6px}
.dsh-jmcomic__downloadState{font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dsh-jmcomic__dlBanner{flex:none;display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-accent-1) 10%, transparent);color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;overflow:hidden}
.dsh-jmcomic__dlBannerText{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.dsh-jmcomic__dlBannerSpinner{flex:none;width:12px;height:12px;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-accent-1);border-radius:50%;animation:dsh-jmcomic-spin 0.8s linear infinite}
@keyframes dsh-jmcomic-spin{to{transform:rotate(360deg)}}
/* \u4FA7\u680F footer \u64CD\u4F5C\u533A\u6539\u4E3A\u7EB5\u5411\u5806\u53E0:comic \u5728\u6280\u80FD\u4E0A\u65B9\u3002
   CSS Modules \u7C7B\u540D\u5F62\u5982 [hash]_footerActions,footArea \u53EA\u5728\u4FA7\u680F\u5B58\u5728,
   \u7528 [class*="footArea"] [class*="footerActions"] \u9650\u5B9A\u4E0D\u8BEF\u4F24\u5176\u4ED6\u754C\u9762\u3002 */
[class*="footArea"] [class*="footerActions"]{flex-direction:column !important;align-items:stretch !important;flex-wrap:wrap !important}
.dsh-jmcomic__trigger{flex:0 0 auto !important;width:100% !important}
`;
function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID) !== null) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES;
  document.head.appendChild(style);
}
async function apiGet(path) {
  const r = await fetch(path, { headers: { accept: "application/json" } });
  const data = await r.json().catch(() => ({ ok: false, error: "bad json" }));
  return data;
}
async function apiPost(path, body) {
  const r = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return r.json().catch(() => ({ ok: false, error: "bad json" }));
}
var DRAG_EDGE_PAD = 12;
function useDraggable(initialPos) {
  const [pos, setPos] = (0, import_react.useState)(initialPos);
  const drag = (0, import_react.useRef)(null);
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    const target = e.target;
    if (target && (target.closest("input") || target.closest("button") || target.closest("select") || target.closest("a") || target.closest("textarea"))) {
      return;
    }
    e.preventDefault();
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = pos ? pos.left : rect.left;
    const startTop = pos ? pos.top : rect.top;
    drag.current = { startX, startY, startLeft, startTop };
    const onMove = (ev) => {
      if (!drag.current) return;
      const dx = ev.clientX - drag.current.startX;
      const dy = ev.clientY - drag.current.startY;
      let nextLeft = drag.current.startLeft + dx;
      let nextTop = drag.current.startTop + dy;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const elW = el.offsetWidth || 320;
      const elH = el.offsetHeight || 400;
      nextLeft = Math.max(DRAG_EDGE_PAD, Math.min(nextLeft, w - elW - DRAG_EDGE_PAD));
      nextTop = Math.max(DRAG_EDGE_PAD, Math.min(nextTop, h - elH - DRAG_EDGE_PAD));
      setPos({ left: nextLeft, top: nextTop });
    };
    const onUp = () => {
      drag.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  return { pos, onMouseDown };
}
function Toast({ message, onDone }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__toast", role: "status", children: [
    message,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__close", style: { marginLeft: 10 }, onClick: onDone, "aria-label": "close", children: "\u2715" })
  ] });
}
function InstallPrompt({ t, onClose, onOpenGitHub }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__overlay", role: "presentation", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__mask", "aria-hidden": "true", onClick: onClose }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__modal", role: "dialog", "aria-modal": "true", style: { width: 520, height: "auto" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__modalHeader", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__modalTitle", children: t("comic.installTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__close", onClick: onClose, "aria-label": t("comic.close"), children: "\u2715" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: 20, display: "flex", flexDirection: "column", gap: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13, lineHeight: 20, color: "var(--dsw-alias-label-primary)" }, children: t("comic.installBody") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "a",
          {
            href: t("comic.installLink"),
            target: "_blank",
            rel: "noreferrer",
            style: { fontSize: 13, color: "var(--dsw-alias-accent-1)", wordBreak: "break-all" },
            children: t("comic.installLink")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__btn ghost", onClick: onOpenGitHub, children: t("comic.openGithub") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__btn", onClick: onClose, children: t("comic.gotIt") })
        ] })
      ] })
    ] })
  ] });
}
function Reader({ album, chapters, initialChapter, onBack, t }) {
  const [chapter, setChapter] = (0, import_react.useState)(initialChapter || (chapters.length > 0 ? chapters[0].path : null));
  const [images, setImages] = (0, import_react.useState)(null);
  const [title, setTitle] = (0, import_react.useState)("");
  (0, import_react.useEffect)(() => {
    if (!chapter) {
      setImages([]);
      return;
    }
    setImages(null);
    let cancelled = false;
    apiGet(`/jmcomic/api/chapter?path=${encodeURIComponent(chapter)}`).then((r) => {
      if (cancelled) return;
      if (r.ok) {
        setImages(r.data.images);
        setTitle(r.data.title);
      } else {
        setImages([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [chapter]);
  const active = chapters.findIndex((c) => c.path === chapter);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__reader", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__readerTop", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__btn ghost", onClick: onBack, children: t("comic.back") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__readerChapters", children: chapters.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          className: `dsh-jmcomic__chip${c.path === chapter ? " active" : ""}`,
          onClick: () => setChapter(c.path),
          children: c.title || `#${i + 1}`
        },
        c.path
      )) }),
      active >= 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          className: "dsh-jmcomic__chip",
          onClick: () => {
            const next = chapters[Math.min(chapters.length - 1, active + 1)];
            if (next) setChapter(next.path);
          },
          children: "\u2193"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__readerView", style: { scrollBehavior: "auto" }, children: [
      images === null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__state", children: "\u2026" }),
      images !== null && images.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__state", children: t("comic.empty") }),
      images !== null && images.map((img) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          src: `/jmcomic/api/img?path=${encodeURIComponent(img.path)}`,
          alt: img.name,
          loading: "lazy"
        },
        img.path
      ))
    ] })
  ] });
}
function DlBanner({ downloads, t }) {
  if (!downloads || downloads.length === 0) return null;
  const first = downloads[0];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__dlBanner", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-jmcomic__dlBannerSpinner" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-jmcomic__dlBannerText", children: [
      "downloading ",
      first.title,
      downloads.length > 1 ? ` (+${downloads.length - 1} more)` : ""
    ] })
  ] });
}
function LibraryModal({ baseDir, albums, initialAlbumPath, activeDownloads, onRefresh, onClose, onOpenDir, t }) {
  const [view, setView] = (0, import_react.useState)({ mode: "library" });
  const [chapterData, setChapterData] = (0, import_react.useState)(null);
  const [loadingChapters, setLoadingChapters] = (0, import_react.useState)(false);
  const { pos, onMouseDown } = useDraggable(null);
  const modalStyle = pos ? {
    position: "fixed",
    left: pos.left,
    top: pos.top,
    margin: 0,
    transform: "none"
  } : {};
  const modalDragProps = {
    onMouseDown,
    style: modalStyle
  };
  (0, import_react.useEffect)(() => {
    if (!initialAlbumPath) return;
    const album = (albums || []).find((a) => a.path === initialAlbumPath);
    if (album) void openAlbum(album);
  }, [initialAlbumPath]);
  const openAlbum = async (album) => {
    setLoadingChapters(true);
    const r = await apiGet(`/jmcomic/api/album?path=${encodeURIComponent(album.path)}`);
    setLoadingChapters(false);
    if (r.ok) {
      setChapterData(r.data);
      setView({ mode: "album", album, data: r.data });
    } else {
      setView({ mode: "library" });
    }
  };
  const recordRecent = (albumPath, chapterPath) => {
    void apiGet("/jmcomic/api/settings").then((r) => {
      if (!r.ok) return;
      const recent = [
        { path: albumPath, chapter: chapterPath, at: Date.now() },
        ...r.data.recent.filter((x) => x.path !== albumPath)
      ].slice(0, 10);
      void apiPost("/jmcomic/api/settings", { recent });
    });
  };
  const openChapter = (albumPath, chapterPath) => {
    recordRecent(albumPath, chapterPath);
    setView({ mode: "reader", albumPath, chapters: chapterData.chapters, initialChapter: chapterPath });
  };
  const deleteAlbum = async (album, e) => {
    e.stopPropagation();
    if (!window.confirm(`\u786E\u5B9A\u5220\u9664\u300C${album.title}\u300D\uFF1F\u8BE5\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\u3002`)) return;
    const r = await apiPost(`/jmcomic/api/delete?path=${encodeURIComponent(album.path)}`, {});
    if (r.ok) {
      if (onRefresh) await onRefresh();
    } else {
      window.alert(`\u5220\u9664\u5931\u8D25: ${r.error || ""}`);
    }
  };
  if (view.mode === "reader") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__overlay", role: "presentation", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__mask", "aria-hidden": "true", onClick: () => setView({ mode: "library" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__modal", role: "dialog", "aria-modal": "true", ...modalDragProps, style: { ...modalDragProps.style, width: "min(1100px, calc(100vw - 32px))", height: "min(92vh, 92vh)" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DlBanner, { downloads: activeDownloads, t }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Reader,
          {
            album: view.albumPath,
            chapters: view.chapters,
            initialChapter: view.initialChapter,
            onBack: () => setView({ mode: "library" }),
            t
          }
        )
      ] })
    ] });
  }
  if (view.mode === "album") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__overlay", role: "presentation", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__mask", "aria-hidden": "true", onClick: () => setView({ mode: "library" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__modal", role: "dialog", "aria-modal": "true", ...modalDragProps, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DlBanner, { downloads: activeDownloads, t }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__modalHeader", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__btn ghost", onClick: () => setView({ mode: "library" }), children: t("comic.back") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__modalTitle", children: view.data.albumTitle }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__close", onClick: onClose, "aria-label": t("comic.close"), children: "\u2715" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: 1, minHeight: 0, overflowY: "auto", padding: 16 }, children: [
          view.data.chapters.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__state", children: t("comic.empty") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: view.data.chapters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              className: "dsh-jmcomic__resultRow",
              style: { width: "100%", textAlign: "left", border: "none", background: "transparent", fontFamily: "inherit" },
              onClick: () => openChapter(view.album.path, c.path),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { className: "dsh-jmcomic__resultCover", src: c.cover ? `/jmcomic/api/img?path=${encodeURIComponent(c.cover)}` : "", alt: "" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__resultInfo", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__resultTitle", children: c.title }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__resultMeta", children: [
                    c.imageCount,
                    " ",
                    t("comic.pages")
                  ] })
                ] })
              ]
            },
            c.path
          )) })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__overlay", role: "presentation", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__mask", "aria-hidden": "true", onClick: onClose }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__modal", role: "dialog", "aria-modal": "true", ...modalDragProps, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DlBanner, { downloads: activeDownloads, t }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__modalHeader", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__modalTitle", children: t("comic.library") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__btn secondary", onClick: onOpenDir, children: t("comic.changeDir") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__close", onClick: onClose, "aria-label": t("comic.close"), children: "\u2715" })
      ] }),
      !baseDir && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__state", children: t("comic.noBaseDir") }),
      baseDir && albums.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__state", children: t("comic.empty") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__grid", children: albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__cardWrap", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            className: "dsh-jmcomic__card",
            onClick: () => openAlbum(album),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__cardCover", children: album.cover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: `/jmcomic/api/img?path=${encodeURIComponent(album.cover)}`, alt: "", loading: "lazy" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4D5}" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__cardTitle", children: album.title }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__cardMeta", children: album.chapterCount > 0 ? `${album.chapterCount} ${t("comic.chapters")}` : "" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "dsh-jmcomic__cardDelete",
            title: "\u5220\u9664\u6F2B\u753B",
            onClick: (e) => deleteAlbum(album, e),
            children: "\u{1F5D1}"
          }
        )
      ] }, album.path)) }),
      loadingChapters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__state", children: "\u2026" })
    ] })
  ] });
}
function ComicPop({ position, baseDir, albums, recent, activeDownloads, t, onImport, onOpenLibrary, onSearchResult, onPick, toast, beginDownload, endDownload }) {
  const [q, setQ] = (0, import_react.useState)("");
  const [searching, setSearching] = (0, import_react.useState)(false);
  const [results, setResults] = (0, import_react.useState)(null);
  const [downloading, setDownloading] = (0, import_react.useState)(null);
  const { pos, onMouseDown } = useDraggable(position);
  const stopProp = (e) => {
    e.stopPropagation();
  };
  const doSearch = async () => {
    const keyword = q.trim();
    if (!keyword) return;
    if (!baseDir) {
      toast(t("comic.noBaseDir"));
      return;
    }
    setSearching(true);
    setResults(null);
    const r = await apiGet(`/jmcomic/api/search?q=${encodeURIComponent(keyword)}&page=1`);
    setSearching(false);
    if (r.ok) setResults(r.data.albums || []);
    else setResults([]);
  };
  const download = async (album) => {
    if (!baseDir) {
      toast(t("comic.noBaseDir"));
      return;
    }
    setDownloading(album.id);
    beginDownload && beginDownload(album.id, album.title);
    try {
      const resp = await fetch("/jmcomic/api/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ albumId: album.id })
      });
      if (!resp.ok || !resp.headers.get("content-type")?.includes("text/event-stream")) {
        const j = await resp.json().catch(() => null);
        throw new Error(j?.error || `HTTP ${resp.status}`);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          if (chunk.includes("event: done")) {
          }
          if (chunk.includes("event: error")) {
            throw new Error("download failed");
          }
        }
      }
      toast(t("comic.downloadDone"));
      onSearchResult && onSearchResult();
    } catch (e) {
      toast(`${t("comic.downloadFailed")}: ${e.message || ""}`);
    } finally {
      setDownloading(null);
      endDownload && endDownload(album.id);
    }
  };
  let covers = (recent || []).slice(0, 3).map((item) => {
    const album = (albums || []).find((a) => a.path === item.path);
    return album ? { ...item, cover: album.cover, title: album.title } : null;
  }).filter(Boolean);
  if (covers.length === 0 && baseDir && albums.length > 0) {
    covers = (albums || []).slice(0, 3).map((a) => ({
      path: a.path,
      cover: a.cover,
      title: a.title
    }));
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      id: "dsh-jmcomic-pop",
      className: "dsh-jmcomic__pop",
      style: { top: pos.top, left: pos.left, cursor: "move" },
      onClick: stopProp,
      onMouseDown,
      children: [
        (activeDownloads || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__dlBanner", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-jmcomic__dlBannerSpinner" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-jmcomic__dlBannerText", children: [
            "downloading ",
            activeDownloads[0].title,
            (activeDownloads || []).length > 1 ? ` (+${activeDownloads.length - 1} more)` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__popBody", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__search", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                className: "dsh-jmcomic__input",
                placeholder: t("comic.searchPlaceholder"),
                value: q,
                onChange: (e) => setQ(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") doSearch();
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__btn", disabled: searching, onClick: doSearch, children: searching ? "\u2026" : "\u{1F50D}" })
          ] }),
          searching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__state", children: t("comic.searching") }),
          !searching && results !== null && results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__state", children: t("comic.searchEmpty") }),
          !searching && results !== null && results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__searchResults", children: results.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__resultRow", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { className: "dsh-jmcomic__resultCover", src: r.cover, alt: "", loading: "lazy" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__resultInfo", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__resultTitle", children: r.title }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__resultMeta", children: [
                "#",
                r.id
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__resultActions", children: downloading === r.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-jmcomic__downloadState", children: t("comic.downloading") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__btn", onClick: () => download(r), children: "\u2193" }) })
          ] }, r.id)) }),
          baseDir ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-jmcomic__recent", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__covers", children: covers.length > 0 ? covers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__cover", onClick: () => onPick(c.path), title: c.title, children: c.cover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: `/jmcomic/api/img?path=${encodeURIComponent(c.cover)}`, alt: "" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4D5}" }) }, c.path)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-jmcomic__hint", style: { padding: "8px 4px", flex: 1, textAlign: "center" }, children: t("comic.empty") }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__moreBtn", onClick: onOpenLibrary, children: t("comic.more") })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__btn secondary", style: { width: "100%" }, onClick: onImport, children: t("comic.importFolder") })
        ] })
      ]
    }
  );
}
function ComicTrigger(props) {
  const { t, pickDirectory } = props;
  const [pop, setPop] = (0, import_react.useState)(null);
  const [libraryOpen, setLibraryOpen] = (0, import_react.useState)(false);
  const [showPrompt, setShowPrompt] = (0, import_react.useState)(false);
  const [toastMsg, setToastMsg] = (0, import_react.useState)(null);
  const [settings, setSettings] = (0, import_react.useState)(null);
  const [albums, setAlbums] = (0, import_react.useState)([]);
  const [triggerRef, setTriggerRef] = (0, import_react.useState)(null);
  const [initialAlbumPath, setInitialAlbumPath] = (0, import_react.useState)(null);
  const pendingAlbum = (0, import_react.useRef)(null);
  const [activeDownloads, setActiveDownloads] = (0, import_react.useState)([]);
  const beginDownload = (id, title) => {
    setActiveDownloads((prev) => prev.some((d) => d.id === id) ? prev : [...prev, { id, title }]);
  };
  const endDownload = (id) => {
    setActiveDownloads((prev) => prev.filter((d) => d.id !== id));
  };
  const toast = (msg) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 3500);
  };
  const loadSettings = async () => {
    const r = await apiGet("/jmcomic/api/settings");
    if (r.ok) setSettings(r.data);
    return r.ok ? r.data : null;
  };
  const loadLibrary = async () => {
    const s = await loadSettings();
    const r = await apiGet(`/jmcomic/api/library${s && s.baseDir ? `?dir=${encodeURIComponent(s.baseDir)}` : ""}`);
    if (r.ok) setAlbums(r.data.albums || []);
  };
  (0, import_react.useEffect)(() => {
    let cancelled = false;
    apiGet("/jmcomic/api/env").then((r) => {
      if (cancelled || !r.needsPrompt) return;
      setShowPrompt(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  (0, import_react.useEffect)(() => {
    if (!pop) return;
    const onDocClick = (e) => {
      const popEl = document.getElementById("dsh-jmcomic-pop");
      if (popEl && popEl.contains(e.target)) return;
      setPop(null);
    };
    const timer = window.setTimeout(() => {
      document.addEventListener("click", onDocClick);
    }, 50);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", onDocClick);
    };
  }, [pop]);
  (0, import_react.useEffect)(() => {
    void loadLibrary();
    let lastSig = "";
    const timer = window.setInterval(async () => {
      const s = await loadSettings();
      if (!s || !s.baseDir) return;
      const r = await apiGet(`/jmcomic/api/library?dir=${encodeURIComponent(s.baseDir)}&sig=1`);
      if (r.ok && r.data && r.data.sig && r.data.sig !== lastSig) {
        lastSig = r.data.sig;
        setAlbums(r.data.albums || []);
      }
    }, 5e3);
    return () => {
      window.clearInterval(timer);
    };
  }, []);
  const togglePop = () => {
    if (pop) {
      setPop(null);
      return;
    }
    const rect = triggerRef?.getBoundingClientRect();
    const popWidth = 320;
    const left = Math.max(8, (rect ? rect.left : 220) - popWidth + (rect ? rect.width : 0) - 8);
    setPop({
      top: Math.max(8, (rect ? rect.top : 80) - 8),
      left
    });
    void loadLibrary();
  };
  const onImport = async () => {
    const dir = await pickDirectory();
    if (!dir) return;
    await apiPost("/jmcomic/api/settings", { baseDir: dir });
    await loadLibrary();
    toast(`${t("comic.imported").replace("{dir}", dir)}`);
    window.setTimeout(() => toast(t("comic.importHint")), 1200);
  };
  const openLibrary = () => {
    setPop(null);
    setLibraryOpen(true);
    void loadLibrary();
  };
  const pickAndRefresh = async () => {
    const dir = await pickDirectory();
    if (!dir) return;
    await apiPost("/jmcomic/api/settings", { baseDir: dir });
    await loadLibrary();
    toast(t("comic.importHint"));
  };
  const closeLibrary = () => {
    setLibraryOpen(false);
    pendingAlbum.current = null;
    setInitialAlbumPath(null);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        ref: setTriggerRef,
        type: "button",
        className: props.wide ? "dsh-jmcomic__trigger" : "dsh-jmcomic__trigger rail",
        "aria-haspopup": "dialog",
        "aria-expanded": Boolean(pop) || libraryOpen,
        "aria-label": t("comic.trigger"),
        onClick: togglePop,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-jmcomic__triggerIcon", style: { fontSize: props.wide ? 15 : 16, lineHeight: 1 }, children: "\u{1F4DA}" }),
          props.wide && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-jmcomic__triggerLabel", children: t("comic.trigger") })
        ]
      }
    ),
    pop && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ComicPop,
      {
        position: pop,
        baseDir: settings?.baseDir || "",
        albums,
        recent: settings?.recent || [],
        activeDownloads,
        t,
        onImport,
        onOpenLibrary: openLibrary,
        onSearchResult: loadLibrary,
        onPick: (p) => {
          pendingAlbum.current = p;
          openLibrary();
        },
        toast,
        beginDownload,
        endDownload
      }
    ),
    libraryOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      LibraryModal,
      {
        baseDir: settings?.baseDir || "",
        albums,
        initialAlbumPath,
        activeDownloads,
        onRefresh: loadLibrary,
        onClose: closeLibrary,
        onOpenDir: pickAndRefresh,
        t
      },
      initialAlbumPath ? `${initialAlbumPath}:${Date.now()}` : "library"
    ),
    showPrompt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      InstallPrompt,
      {
        t,
        onClose: async () => {
          setShowPrompt(false);
          await apiPost("/jmcomic/api/settings", { installPromptShown: true });
        },
        onOpenGitHub: () => window.open(t("comic.installLink"), "_blank")
      }
    ),
    toastMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toast, { message: toastMsg, onDone: () => setToastMsg(null) })
  ] });
}
function SettingsCard(props) {
  const { t, pickDirectory } = props;
  const [settings, setSettings] = (0, import_react.useState)(null);
  const [saving, setSaving] = (0, import_react.useState)(false);
  const load = async () => {
    const r = await apiGet("/jmcomic/api/settings");
    if (r.ok) setSettings(r.data);
  };
  (0, import_react.useEffect)(() => {
    void load();
  }, []);
  const save = async (patch) => {
    setSaving(true);
    const r = await apiPost("/jmcomic/api/settings", patch);
    setSaving(false);
    if (r.ok) setSettings(r.data);
    return r.ok;
  };
  const pickAndSave = async () => {
    const dir = await pickDirectory();
    if (!dir) return;
    await save({ baseDir: dir });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "4px 2px" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 14, fontWeight: 500, marginBottom: 10, color: "var(--dsw-alias-label-primary)" }, children: t("comic.settingsTitle") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: "none", fontSize: 13, color: "var(--dsw-alias-label-secondary)" }, children: t("comic.settingsBaseDir") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          className: "dsh-jmcomic__input",
          style: { flex: 1, minWidth: 0 },
          value: settings?.baseDir || "",
          placeholder: t("comic.settingsBaseDirPlaceholder"),
          onChange: (e) => setSettings({ ...settings || {}, baseDir: e.target.value }),
          onBlur: () => {
            if (settings?.baseDir !== void 0) void save({ baseDir: settings.baseDir });
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsh-jmcomic__btn secondary", onClick: pickAndSave, children: t("comic.settingsPick") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: "none", fontSize: 13, color: "var(--dsw-alias-label-secondary)" }, children: t("comic.settingsPython") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          className: "dsh-jmcomic__input",
          style: { flex: 1, minWidth: 0 },
          value: settings?.pythonPath || "",
          placeholder: "python",
          onChange: (e) => setSettings({ ...settings || {}, pythonPath: e.target.value }),
          onBlur: () => {
            if (settings?.pythonPath !== void 0) void save({ pythonPath: settings.pythonPath });
          }
        }
      ),
      saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" }, children: "\u2026" })
    ] })
  ] });
}
var inject = ["slots", "locale", "workspaces"];
function apply(ctx) {
  ensureStyles();
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-jmcomic: dictionaries");
  const workspaces = ctx.workspaces;
  const pickDirectory = () => workspaces.pickDirectory();
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "dsh-jmcomic",
    order: -10,
    locale: NS,
    inject: () => ({
      pickDirectory
    })
  }, ComicTrigger));
  ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
    name: "settings.plugin.item",
    id: "dsh-jmcomic",
    order: 30,
    locale: NS,
    inject: () => ({ pickDirectory })
  }, SettingsCard));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
