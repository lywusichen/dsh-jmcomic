/**
 * dsh-jmcomic — client half.
 *
 * Registers a "comic" trigger into the sidebar `sidebar.footer.action` seat.
 * Clicking opens a small floating panel (search + import folder + recent
 * covers), and "More" opens a large centered modal with the full library,
 * an in-modal reader, and a "change folder" action.
 *
 * All data rides the host routes under /jmcomic/api/* registered by the
 * host half (src/server.js) — no core-harness changes required.
 */

// --- UI copy ----------------------------------------------------------------

const NS = 'dsh-jmcomic'

const zh = {
  'comic.trigger': 'comic',
  'comic.searchPlaceholder': '搜索以下载',
  'comic.importFolder': '导入本地文件夹',
  'comic.imported': '本地文件夹已绑定: {dir}',
  'comic.importHint': '如需更换文件夹请在插件设置里进行操作',
  'comic.more': '更多',
  'comic.noBaseDir': '请先导入本地文件夹',
  'comic.library': '本地漫画库',
  'comic.empty': '文件夹中没有漫画',
  'comic.changeDir': '更改文件目录',
  'comic.close': '关闭',
  'comic.back': '返回',
  'comic.chapters': '章节',
  'comic.pages': '页',
  'comic.searching': '搜索中…',
  'comic.searchEmpty': '没有找到相关漫画',
  'comic.downloading': '下载中…',
  'comic.downloadDone': '下载完成',
  'comic.downloadFailed': '下载失败',
  'comic.installTitle': '推荐安装 jmcomic',
  'comic.installBody': '未检测到完整的 jmcomic 运行环境。安装 JMComic-Crawler-Python 后可获得完整的搜索与下载功能:',
  'comic.installLink': 'https://github.com/hect0x7/JMComic-Crawler-Python',
  'comic.gotIt': '知道了',
  'comic.openGithub': '打开 GitHub',
  'comic.settingsTitle': 'jmcomic 插件设置',
  'comic.settingsBaseDir': '默认本地文件夹',
  'comic.settingsBaseDirPlaceholder': '留空使用当前绑定目录',
  'comic.settingsPick': '选择文件夹',
  'comic.settingsPython': 'Python 可执行文件(可选)',
  'comic.pageJump': '页数',
  'comic.go': '跳转',
}

const en = {
  'comic.trigger': 'comic',
  'comic.searchPlaceholder': 'Search to download',
  'comic.importFolder': 'Import local folder',
  'comic.imported': 'Local folder bound: {dir}',
  'comic.importHint': 'To change the folder, use the plugin settings',
  'comic.more': 'More',
  'comic.noBaseDir': 'Please import a local folder first',
  'comic.library': 'Local Library',
  'comic.empty': 'No comics in this folder',
  'comic.changeDir': 'Change folder',
  'comic.close': 'Close',
  'comic.back': 'Back',
  'comic.chapters': 'Chapters',
  'comic.pages': 'pages',
  'comic.searching': 'Searching…',
  'comic.searchEmpty': 'No comics found',
  'comic.downloading': 'Downloading…',
  'comic.downloadDone': 'Download complete',
  'comic.downloadFailed': 'Download failed',
  'comic.installTitle': 'jmcomic is recommended',
  'comic.installBody': 'A complete jmcomic runtime was not detected. Install JMComic-Crawler-Python for full search & download:',
  'comic.installLink': 'https://github.com/hect0x7/JMComic-Crawler-Python',
  'comic.gotIt': 'Got it',
  'comic.openGithub': 'Open GitHub',
  'comic.settingsTitle': 'jmcomic Plugin Settings',
  'comic.settingsBaseDir': 'Default local folder',
  'comic.settingsBaseDirPlaceholder': 'Leave empty to keep current binding',
  'comic.settingsPick': 'Pick folder',
  'comic.settingsPython': 'Python executable (optional)',
  'comic.pageJump': 'page',
  'comic.go': 'Go',
}

// --- Styles (injected once; no CSS pipeline) --------------------------------

const STYLE_ID = 'dsh-jmcomic-styles'
const STYLES = `
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
.dsh-jmcomic__readerView{flex:1;min-height:0;overflow-y:auto;position:relative;background:var(--dsw-alias-bg-layer-1);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:4px}
.dsh-jmcomic__readerView img{max-width:100%;height:auto;display:block}
.dsh-jmcomic__readerFooter{flex:none;display:flex;align-items:center;justify-content:center;gap:10px;height:48px;padding:0 12px;box-sizing:border-box;border-top:1px solid var(--dsw-alias-border-l2)}
.dsh-jmcomic__pageInfo{flex:none;font-size:13px;color:var(--dsw-alias-label-primary);min-width:80px;text-align:center}
.dsh-jmcomic__pageInput{flex:none;width:72px;height:30px;padding:0 10px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-input);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;text-align:center;outline:none}
.dsh-jmcomic__pageInput:focus{border-color:var(--dsw-alias-accent-1)}
/* 阅读器窗口 8 方向拉伸手柄(绝对定位热区) */
.dsh-jmcomic__rsz{position:absolute;z-index:20}
.dsh-jmcomic__rsz-n{top:-3px;left:12px;right:12px;height:8px}
.dsh-jmcomic__rsz-s{bottom:-3px;left:12px;right:12px;height:8px}
.dsh-jmcomic__rsz-e{right:-3px;top:12px;bottom:12px;width:8px}
.dsh-jmcomic__rsz-w{left:-3px;top:12px;bottom:12px;width:8px}
.dsh-jmcomic__rsz-ne{top:-4px;right:-4px;width:16px;height:16px}
.dsh-jmcomic__rsz-nw{top:-4px;left:-4px;width:16px;height:16px}
.dsh-jmcomic__rsz-se{bottom:-4px;right:-4px;width:16px;height:16px}
.dsh-jmcomic__rsz-sw{bottom:-4px;left:-4px;width:16px;height:16px}
/* 阅读器窗口顶部拖拽把手(留白,方便移动窗口) */
.dsh-jmcomic__readerDragBar{flex:none;height:26px;cursor:move;border-bottom:1px solid transparent;display:flex;align-items:center;justify-content:center}
.dsh-jmcomic__readerDragBar:hover{background:var(--dsw-alias-interactive-bg-hover);border-bottom-color:var(--dsw-alias-border-l2)}
.dsh-jmcomic__readerDragBar::after{content:'⠿';color:var(--dsw-alias-label-tertiary);font-size:12px;opacity:.6}
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
/* 侧栏 footer 操作区改为纵向堆叠:comic 在技能上方。
   CSS Modules 类名形如 [hash]_footerActions,footArea 只在侧栏存在,
   用 [class*="footArea"] [class*="footerActions"] 限定不误伤其他界面。 */
[class*="footArea"] [class*="footerActions"]{flex-direction:column !important;align-items:stretch !important;flex-wrap:wrap !important}
.dsh-jmcomic__trigger{flex:0 0 auto !important;width:100% !important}
`

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = STYLES
  document.head.appendChild(style)
}

// --- API helpers ------------------------------------------------------------

async function apiGet(path) {
  const r = await fetch(path, { headers: { accept: 'application/json' } })
  const data = await r.json().catch(() => ({ ok: false, error: 'bad json' }))
  return data
}

async function apiPost(path, body) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return r.json().catch(() => ({ ok: false, error: 'bad json' }))
}

// --- 拖拽 hook --------------------------------------------------------------
// 让小窗/大悬浮窗可拖动:返回 { pos, onMouseDown }。拖动过程中更新 left/top,
// 边界约束在视口内(不拖出屏幕外)。

const DRAG_EDGE_PAD = 12

function useDraggable(initialPos) {
  const [pos, setPos] = useState(initialPos)
  const drag = useRef(null)

  const onMouseDown = (e) => {
    // 只响应左键;输入框/按钮等交互元素不触发拖拽
    if (e.button !== 0) return
    const target = e.target
    if (target && (target.closest('input') || target.closest('button') || target.closest('select') || target.closest('a') || target.closest('textarea'))) {
      return
    }
    e.preventDefault()
    // 从当前 DOM 元素读取实际位置(首次拖动时 modal 可能仍处于 CSS 居中态)
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const startLeft = pos ? pos.left : rect.left
    const startTop = pos ? pos.top : rect.top
    drag.current = { startX, startY, startLeft, startTop }

    const onMove = (ev) => {
      if (!drag.current) return
      const dx = ev.clientX - drag.current.startX
      const dy = ev.clientY - drag.current.startY
      let nextLeft = drag.current.startLeft + dx
      let nextTop = drag.current.startTop + dy
      // 边界约束
      const w = window.innerWidth
      const h = window.innerHeight
      const elW = el.offsetWidth || 320
      const elH = el.offsetHeight || 400
      nextLeft = Math.max(DRAG_EDGE_PAD, Math.min(nextLeft, w - elW - DRAG_EDGE_PAD))
      nextTop = Math.max(DRAG_EDGE_PAD, Math.min(nextTop, h - elH - DRAG_EDGE_PAD))
      setPos({ left: nextLeft, top: nextTop })
    }
    const onUp = () => {
      drag.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return { pos, onMouseDown }
}

// --- Toast ------------------------------------------------------------------

function Toast({ message, onDone }) {
  return (
    <div className="dsh-jmcomic__toast" role="status">
      {message}
      <button className="dsh-jmcomic__close" style={{ marginLeft: 10 }} onClick={onDone} aria-label="close">✕</button>
    </div>
  )
}

// --- Install prompt ---------------------------------------------------------

function InstallPrompt({ t, onClose, onOpenGitHub }) {
  return (
    <div className="dsh-jmcomic__overlay" role="presentation">
      <div className="dsh-jmcomic__mask" aria-hidden="true" onClick={onClose} />
      <div className="dsh-jmcomic__modal" role="dialog" aria-modal="true" style={{ width: 520, height: 'auto' }}>
        <div className="dsh-jmcomic__modalHeader">
          <div className="dsh-jmcomic__modalTitle">{t('comic.installTitle')}</div>
          <button className="dsh-jmcomic__close" onClick={onClose} aria-label={t('comic.close')}>✕</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, lineHeight: 20, color: 'var(--dsw-alias-label-primary)' }}>
            {t('comic.installBody')}
          </div>
          <a
            href={t('comic.installLink')}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: 'var(--dsw-alias-accent-1)', wordBreak: 'break-all' }}
          >
            {t('comic.installLink')}
          </a>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="dsh-jmcomic__btn ghost" onClick={onOpenGitHub}>{t('comic.openGithub')}</button>
            <button className="dsh-jmcomic__btn" onClick={onClose}>{t('comic.gotIt')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Reader -----------------------------------------------------------------

function Reader({ chapters, initialChapter, initialPage, albumPath, onProgress, onBack, t }) {
  const [chapter, setChapter] = useState(initialChapter || (chapters.length > 0 ? chapters[0].path : null))
  const [images, setImages] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageInput, setPageInput] = useState('')
  const viewRef = useRef(null)
  const imgRefs = useRef([])
  const pendingInitialPage = useRef(initialPage || null)
  const progressRef = useRef({ chapter: initialChapter || (chapters.length > 0 ? chapters[0].path : null), page: 0 })

  useEffect(() => {
    if (!chapter) { setImages([]); return }
    setImages(null)
    setCurrentPage(0)
    setPageInput('')
    imgRefs.current = []
    // 恢复上次进度:切章时若该章有保存的页码,用它;否则保留 initialPage(首次进入)
    const restorePage = pendingInitialPage.current
    pendingInitialPage.current = null // 只对首次进入生效,切章后从头开始
    progressRef.current = { chapter, page: 0 }
    let cancelled = false
    apiGet(`/jmcomic/api/chapter?path=${encodeURIComponent(chapter)}`).then((r) => {
      if (cancelled) return
      if (r.ok) {
        setImages(r.data.images)
        if (restorePage && restorePage > 1) {
          // 等图片渲染后滚动到保存的页码
          requestAnimationFrame(() => {
            const img = imgRefs.current[restorePage - 1]
            if (img && viewRef.current) {
              viewRef.current.scrollTop = img.offsetTop
              setCurrentPage(restorePage - 1)
              setPageInput(String(restorePage))
            }
          })
        }
      } else {
        setImages([])
      }
    })
    return () => { cancelled = true }
  }, [chapter])

  // 滚动时更新当前页(rAF 节流 + 页码变化才 setState,避免高频重渲染)
  useEffect(() => {
    const el = viewRef.current
    if (!el) return
    let raf = 0
    let lastPage = 0
    const computePage = () => {
      const containerTop = el.getBoundingClientRect().top
      const containerH = el.clientHeight
      let page = 0
      for (let i = 0; i < imgRefs.current.length; i++) {
        const img = imgRefs.current[i]
        if (!img) continue
        const imgTop = img.getBoundingClientRect().top - containerTop
        if (imgTop <= containerH * 0.35) page = i
        else break
      }
      if (page !== lastPage) {
        lastPage = page
        setCurrentPage(page)
        // 上报阅读进度(1-based 页码),供持久化
        progressRef.current = { chapter, page: page + 1 }
        if (onProgress) onProgress(albumPath, chapter, page + 1)
      }
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        computePage()
      })
    }
    computePage()
    el.addEventListener('scroll', onScroll)
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [images, chapter, onProgress, albumPath])

  // 跳转到指定页(1-based)
  const jumpToPage = (raw) => {
    const total = (images || []).length
    if (!total) return
    let n = parseInt(raw, 10)
    if (isNaN(n)) n = currentPage + 1
    n = Math.max(1, Math.min(total, n))
    const img = imgRefs.current[n - 1]
    if (img && viewRef.current) {
      const containerTop = viewRef.current.getBoundingClientRect().top
      const target = img.getBoundingClientRect().top - containerTop + viewRef.current.scrollTop
      viewRef.current.scrollTo({ top: target, behavior: 'smooth' })
    }
    setCurrentPage(n - 1)
    setPageInput(String(n))
  }

  const total = (images || []).length
  const active = chapters.findIndex((c) => c.path === chapter)

  return (
    <div className="dsh-jmcomic__reader">
      <div className="dsh-jmcomic__readerTop">
        <button className="dsh-jmcomic__btn ghost" onClick={onBack}>{t('comic.back')}</button>
        <div className="dsh-jmcomic__readerChapters">
          {chapters.map((c, i) => (
            <button
              key={c.path}
              className={`dsh-jmcomic__chip${c.path === chapter ? ' active' : ''}`}
              onClick={() => setChapter(c.path)}
            >
              {c.title || `#${i + 1}`}
            </button>
          ))}
        </div>
        {active >= 0 && (
          <button
            className="dsh-jmcomic__chip"
            onClick={() => {
              const next = chapters[Math.min(chapters.length - 1, active + 1)]
              if (next) {
                // 切章前保存当前进度,新章节从第 1 页开始
                if (onProgress) onProgress(albumPath, chapter, (currentPage + 1))
                pendingInitialPage.current = null
                setChapter(next.path)
              }
            }}
          >
            ↓
          </button>
        )}
      </div>
      <div
        ref={viewRef}
        className="dsh-jmcomic__readerView"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {images === null && <div className="dsh-jmcomic__state">…</div>}
        {images !== null && images.length === 0 && <div className="dsh-jmcomic__state">{t('comic.empty')}</div>}
        {images !== null && images.map((img, i) => (
          <img
            key={img.path}
            ref={(el) => { imgRefs.current[i] = el }}
            src={`/jmcomic/api/img?path=${encodeURIComponent(img.path)}`}
            alt={img.name}
            loading="lazy"
          />
        ))}
      </div>
      {total > 0 && (
        <div className="dsh-jmcomic__readerFooter">
          <span className="dsh-jmcomic__pageInfo">
            {currentPage + 1} / {total}
          </span>
          <input
            className="dsh-jmcomic__pageInput"
            value={pageInput}
            placeholder={t('comic.pageJump')}
            onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') jumpToPage(pageInput) }}
          />
          <button className="dsh-jmcomic__btn ghost" onClick={() => jumpToPage(pageInput)}>{t('comic.go')}</button>
        </div>
      )}
    </div>
  )
}

// --- 下载进度条(小窗/大窗共用)------------------------------------------------

function DlBanner({ downloads, t }) {
  if (!downloads || downloads.length === 0) return null
  const first = downloads[0]
  return (
    <div className="dsh-jmcomic__dlBanner">
      <span className="dsh-jmcomic__dlBannerSpinner" />
      <span className="dsh-jmcomic__dlBannerText">
        downloading {first.title}
        {downloads.length > 1 ? ` (+${downloads.length - 1} more)` : ''}
      </span>
    </div>
  )
}

// --- Large modal (library + reader) -----------------------------------------

function LibraryModal({ baseDir, albums, initialAlbumPath, initialReadPath, activeDownloads, onRefresh, onClose, onOpenDir, t }) {
  const [view, setView] = useState({ mode: 'library' })
  const [chapterData, setChapterData] = useState(null)
  const [loadingChapters, setLoadingChapters] = useState(false)
  // 大悬浮窗拖拽:初始 null = 保持 CSS 居中;拖动后转为固定定位
  const { pos, onMouseDown } = useDraggable(null)

  // modal 定位样式:有 pos 时覆盖居中为固定定位
  const modalStyle = pos ? {
    position: 'fixed',
    left: pos.left,
    top: pos.top,
    margin: 0,
    transform: 'none',
  } : {}

  const modalDragProps = {
    onMouseDown,
    style: modalStyle,
  }

  // --- 阅读器视图专属:可移动 + 可拉伸(resize) ---
  // readerRect: { left, top, width, height } | null;null = 默认全屏尺寸(CSS 居中)
  const [readerRect, setReaderRect] = useState(null)
  const resizeRef = useRef(null)

  // 持久化:进入阅读器时恢复上次的窗口尺寸/位置(从插件设置读取)
  useEffect(() => {
    if (view.mode !== 'reader') return
    let cancelled = false
    apiGet('/jmcomic/api/settings').then((r) => {
      if (cancelled || !r.ok) return
      const saved = r.data && r.data.readerRect
      if (saved && saved.left !== undefined && saved.width) {
        setReaderRect(saved)
      }
    })
    return () => { cancelled = true }
  }, [view.mode === 'reader'])

  // 从当前 DOM 读取 modal 实际位置/尺寸(首次操作时从 CSS 居中态取)
  const readRect = () => {
    const el = document.getElementById('dsh-jmcomic-reader-modal')
    if (!el) return { left: 0, top: 0, width: 0, height: 0 }
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top, width: r.width, height: r.height }
  }

  const startReaderMove = (e) => {
    if (e.button !== 0) return
    const target = e.target
    if (target && (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('a'))) return
    e.preventDefault()
    const start = readRect()
    const sx = e.clientX
    const sy = e.clientY
    resizeRef.current = { mode: 'move', start, sx, sy }
    document.addEventListener('mousemove', onReaderDrag)
    document.addEventListener('mouseup', endReaderDrag)
  }

  const startReaderResize = (dir) => (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const start = readRect()
    resizeRef.current = { mode: 'resize', dir, start, sx: e.clientX, sy: e.clientY }
    document.addEventListener('mousemove', onReaderDrag)
    document.addEventListener('mouseup', endReaderDrag)
  }

  const onReaderDrag = (ev) => {
    const r = resizeRef.current
    if (!r) return
    const dx = ev.clientX - r.sx
    const dy = ev.clientY - r.sy
    const vw = window.innerWidth
    const vh = window.innerHeight
    const MIN_W = 360
    const MIN_H = 260
    if (r.mode === 'move') {
      setReaderRect({
        left: Math.max(8, Math.min(r.start.left + dx, vw - 80)),
        top: Math.max(8, Math.min(r.start.top + dy, vh - 60)),
        width: r.start.width,
        height: r.start.height,
      })
    } else {
      // resize:dir 含 n/s/e/w 四个方向,按边/角调整
      let { left, top, width, height } = r.start
      if (r.dir.includes('e')) width = Math.max(MIN_W, r.start.width + dx)
      if (r.dir.includes('s')) height = Math.max(MIN_H, r.start.height + dy)
      if (r.dir.includes('w')) {
        width = Math.max(MIN_W, r.start.width - dx)
        left = r.start.left + (r.start.width - width)
      }
      if (r.dir.includes('n')) {
        height = Math.max(MIN_H, r.start.height - dy)
        top = r.start.top + (r.start.height - height)
      }
      // 不超过视口
      width = Math.min(width, vw - 16)
      height = Math.min(height, vh - 16)
      setReaderRect({ left: Math.max(4, Math.min(left, vw - 16)), top: Math.max(4, Math.min(top, vh - 16)), width, height })
    }
  }

  const endReaderDrag = () => {
    resizeRef.current = null
    document.removeEventListener('mousemove', onReaderDrag)
    document.removeEventListener('mouseup', endReaderDrag)
    // 持久化:拖动/拉伸结束时把最终窗口位置/尺寸存到插件设置
    const el = document.getElementById('dsh-jmcomic-reader-modal')
    if (el) {
      const r = el.getBoundingClientRect()
      void apiPost('/jmcomic/api/settings', {
        readerRect: { left: r.left, top: r.top, width: r.width, height: r.height },
      })
    }
  }

  // 阅读器 modal 的最终样式:有 rect 用固定定位,否则默认全屏居中
  const readerModalStyle = readerRect ? {
    position: 'fixed',
    left: readerRect.left,
    top: readerRect.top,
    width: readerRect.width,
    height: readerRect.height,
    margin: 0,
    transform: 'none',
  } : {
    width: 'calc(100vw - 40px)',
    maxWidth: '1600px',
    height: 'calc(100vh - 40px)',
  }

  // resize 手柄定义(8 方向)
  const resizeHandles = [
    { dir: 'n', cls: 'dsh-jmcomic__rsz dsh-jmcomic__rsz-n', cursor: 'ns-resize' },
    { dir: 's', cls: 'dsh-jmcomic__rsz dsh-jmcomic__rsz-s', cursor: 'ns-resize' },
    { dir: 'e', cls: 'dsh-jmcomic__rsz dsh-jmcomic__rsz-e', cursor: 'ew-resize' },
    { dir: 'w', cls: 'dsh-jmcomic__rsz dsh-jmcomic__rsz-w', cursor: 'ew-resize' },
    { dir: 'ne', cls: 'dsh-jmcomic__rsz dsh-jmcomic__rsz-ne', cursor: 'nesw-resize' },
    { dir: 'nw', cls: 'dsh-jmcomic__rsz dsh-jmcomic__rsz-nw', cursor: 'nwse-resize' },
    { dir: 'se', cls: 'dsh-jmcomic__rsz dsh-jmcomic__rsz-se', cursor: 'nwse-resize' },
    { dir: 'sw', cls: 'dsh-jmcomic__rsz dsh-jmcomic__rsz-sw', cursor: 'nesw-resize' },
  ]

  // 打开时若带 initialAlbumPath(点击最近封面),自动进入该漫画
  useEffect(() => {
    if (!initialAlbumPath) return
    const album = (albums || []).find((a) => a.path === initialAlbumPath)
    if (album) void openAlbum(album, initialReadPath === initialAlbumPath)
  }, [initialAlbumPath])

  const openAlbum = async (album, autoRead = false) => {
    setLoadingChapters(true)
    const r = await apiGet(`/jmcomic/api/album?path=${encodeURIComponent(album.path)}`)
    setLoadingChapters(false)
    if (r.ok) {
      setChapterData(r.data)
      setView({ mode: 'album', album, data: r.data })
      // 读取该漫画的阅读进度,恢复章节+页码
      const progress = await readProgressOf(album.path)
      if (autoRead && r.data.chapters.length > 0) {
        let targetChapter = r.data.chapters[0]
        let targetPage = 0
        if (progress) {
          const saved = r.data.chapters.find((c) => c.path === progress.chapter)
          if (saved) {
            targetChapter = saved
            targetPage = progress.page || 0
          }
        }
        recordRecent(album.path, targetChapter.path)
        setView({ mode: 'reader', albumPath: album.path, chapters: r.data.chapters, initialChapter: targetChapter.path, initialPage: targetPage })
      }
    } else {
      setView({ mode: 'library' })
    }
  }

  // 读取某漫画的阅读进度(缓存避免重复请求)
  const progressCache = useRef({})
  const readProgressOf = async (albumPath) => {
    if (progressCache.current[albumPath] !== undefined) return progressCache.current[albumPath]
    const r = await apiGet('/jmcomic/api/settings')
    if (!r.ok) { progressCache.current[albumPath] = null; return null }
    const p = r.data && r.data.readProgress && r.data.readProgress[albumPath]
    progressCache.current[albumPath] = p || null
    return p || null
  }

  // 保存阅读进度(滚动/切章时由 Reader 回调)
  const saveProgress = (albumPath, chapterPath, page) => {
    progressCache.current[albumPath] = { chapter: chapterPath, page }
    void apiPost('/jmcomic/api/settings', {
      readProgress: { [albumPath]: { chapter: chapterPath, page, at: Date.now() } },
    })
  }

  const recordRecent = (albumPath, chapterPath) => {
    void apiGet('/jmcomic/api/settings').then((r) => {
      if (!r.ok) return
      const recent = [
        { path: albumPath, chapter: chapterPath, at: Date.now() },
        ...r.data.recent.filter((x) => x.path !== albumPath),
      ].slice(0, 10)
      void apiPost('/jmcomic/api/settings', { recent })
    })
  }

  const openChapter = async (albumPath, chapterPath) => {
    recordRecent(albumPath, chapterPath)
    // 恢复该章节的页码(同一漫画内切章)
    let page = 0
    const progress = await readProgressOf(albumPath)
    if (progress && progress.chapter === chapterPath) page = progress.page || 0
    setView({ mode: 'reader', albumPath, chapters: chapterData.chapters, initialChapter: chapterPath, initialPage: page })
  }

  const deleteAlbum = async (album, e) => {
    e.stopPropagation()
    if (!window.confirm(`确定删除「${album.title}」？该操作不可恢复。`)) return
    const r = await apiPost(`/jmcomic/api/delete?path=${encodeURIComponent(album.path)}`, {})
    if (r.ok) {
      if (onRefresh) await onRefresh()
    } else {
      window.alert(`删除失败: ${r.error || ''}`)
    }
  }

  if (view.mode === 'reader') {
    return (
      <div className="dsh-jmcomic__overlay" role="presentation">
        <div className="dsh-jmcomic__mask" aria-hidden="true" onClick={() => setView({ mode: 'library' })} />
        <div
          id="dsh-jmcomic-reader-modal"
          className="dsh-jmcomic__modal"
          role="dialog"
          aria-modal="true"
          style={readerModalStyle}
          onMouseDown={startReaderMove}
        >
          <div className="dsh-jmcomic__readerDragBar" title="拖动窗口" />
          <DlBanner downloads={activeDownloads} t={t} />
          <Reader
            chapters={view.chapters}
            initialChapter={view.initialChapter}
            initialPage={view.initialPage || 0}
            albumPath={view.albumPath}
            onProgress={saveProgress}
            onBack={() => setView({ mode: 'library' })}
            t={t}
          />
          {resizeHandles.map((h) => (
            <div
              key={h.dir}
              className={h.cls}
              style={{ cursor: h.cursor }}
              onMouseDown={startReaderResize(h.dir)}
            />
          ))}
        </div>
      </div>
    )
  }

  if (view.mode === 'album') {
    return (
      <div className="dsh-jmcomic__overlay" role="presentation">
        <div className="dsh-jmcomic__mask" aria-hidden="true" onClick={() => setView({ mode: 'library' })} />
        <div className="dsh-jmcomic__modal" role="dialog" aria-modal="true" {...modalDragProps}>
          <DlBanner downloads={activeDownloads} t={t} />
          <div className="dsh-jmcomic__modalHeader">
            <button className="dsh-jmcomic__btn ghost" onClick={() => setView({ mode: 'library' })}>{t('comic.back')}</button>
            <div className="dsh-jmcomic__modalTitle">{view.data.albumTitle}</div>
            <button className="dsh-jmcomic__close" onClick={onClose} aria-label={t('comic.close')}>✕</button>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 16 }}>
            {view.data.chapters.length === 0 && <div className="dsh-jmcomic__state">{t('comic.empty')}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {view.data.chapters.map((c) => (
                <button
                  key={c.path}
                  className="dsh-jmcomic__resultRow"
                  style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', fontFamily: 'inherit' }}
                  onClick={() => openChapter(view.album.path, c.path)}
                >
                  <img className="dsh-jmcomic__resultCover" src={c.cover ? `/jmcomic/api/img?path=${encodeURIComponent(c.cover)}` : ''} alt="" />
                  <div className="dsh-jmcomic__resultInfo">
                    <div className="dsh-jmcomic__resultTitle">{c.title}</div>
                    <div className="dsh-jmcomic__resultMeta">{c.imageCount} {t('comic.pages')}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // library grid
  return (
    <div className="dsh-jmcomic__overlay" role="presentation">
      <div className="dsh-jmcomic__mask" aria-hidden="true" onClick={onClose} />
      <div className="dsh-jmcomic__modal" role="dialog" aria-modal="true" {...modalDragProps}>
        <DlBanner downloads={activeDownloads} t={t} />
        <div className="dsh-jmcomic__modalHeader">
          <div className="dsh-jmcomic__modalTitle">{t('comic.library')}</div>
          <button className="dsh-jmcomic__btn secondary" onClick={onOpenDir}>{t('comic.changeDir')}</button>
          <button className="dsh-jmcomic__close" onClick={onClose} aria-label={t('comic.close')}>✕</button>
        </div>
        {!baseDir && <div className="dsh-jmcomic__state">{t('comic.noBaseDir')}</div>}
        {baseDir && albums.length === 0 && <div className="dsh-jmcomic__state">{t('comic.empty')}</div>}
        <div className="dsh-jmcomic__grid">
          {albums.map((album) => (
            <div key={album.path} className="dsh-jmcomic__cardWrap">
              <button
                className="dsh-jmcomic__card"
                onClick={() => openAlbum(album)}
              >
                <div className="dsh-jmcomic__cardCover">
                  {album.cover
                    ? <img src={`/jmcomic/api/img?path=${encodeURIComponent(album.cover)}`} alt="" loading="lazy" />
                    : <span>📕</span>}
                </div>
                <div className="dsh-jmcomic__cardTitle">{album.title}</div>
                <div className="dsh-jmcomic__cardMeta">
                  {album.chapterCount > 0 ? `${album.chapterCount} ${t('comic.chapters')}` : ''}
                </div>
              </button>
              <button
                type="button"
                className="dsh-jmcomic__cardDelete"
                title="删除漫画"
                onClick={(e) => deleteAlbum(album, e)}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
        {loadingChapters && <div className="dsh-jmcomic__state">…</div>}
      </div>
    </div>
  )
}

// --- Small pop (search + import + recent) -----------------------------------

function ComicPop({ position, baseDir, albums, recent, activeDownloads, t, onImport, onOpenLibrary, onSearchResult, onPick, toast, beginDownload, endDownload }) {
  const [q, setQ] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)
  const [downloading, setDownloading] = useState(null)
  const { pos, onMouseDown } = useDraggable(position)

  // 点击小窗内部时不冒泡到 document(避免被外部点击关闭逻辑误关）
  const stopProp = (e) => { e.stopPropagation() }

  const doSearch = async () => {
    const keyword = q.trim()
    if (!keyword) return
    if (!baseDir) {
      toast(t('comic.noBaseDir'))
      return
    }
    setSearching(true)
    setResults(null)
    const r = await apiGet(`/jmcomic/api/search?q=${encodeURIComponent(keyword)}&page=1`)
    setSearching(false)
    if (r.ok) setResults(r.data.albums || [])
    else setResults([])
  }

  const download = async (album) => {
    if (!baseDir) { toast(t('comic.noBaseDir')); return }
    setDownloading(album.id)
    beginDownload && beginDownload(album.id, album.title)
    try {
      // SSE 流式接收下载进度
      const resp = await fetch('/jmcomic/api/download', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ albumId: album.id }),
      })
      if (!resp.ok || !resp.headers.get('content-type')?.includes('text/event-stream')) {
        const j = await resp.json().catch(() => null)
        throw new Error(j?.error || `HTTP ${resp.status}`)
      }
      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const { value, done: d } = await reader.read()
        done = d
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          // 不解析 SSE 细节,仅用于保持连接;最终事件在 stream 结束处理
          if (chunk.includes('event: done')) { /* 完成 */ }
          if (chunk.includes('event: error')) { throw new Error('download failed') }
        }
      }
      toast(t('comic.downloadDone'))
      onSearchResult && onSearchResult()
    } catch (e) {
      toast(`${t('comic.downloadFailed')}: ${e.message || ''}`)
    } finally {
      setDownloading(null)
      endDownload && endDownload(album.id)
    }
  }

  // 封面:优先最近阅读;无阅读记录时按下载时间(库内 mtime)取最新 2-3 本
  let covers = (recent || []).slice(0, 3).map((item) => {
    const album = (albums || []).find((a) => a.path === item.path)
    return album ? { ...item, cover: album.cover, title: album.title } : null
  }).filter(Boolean)
  if (covers.length === 0 && baseDir && albums.length > 0) {
    covers = (albums || []).slice(0, 3).map((a) => ({
      path: a.path, cover: a.cover, title: a.title,
    }))
  }

  return (
    <div
      id="dsh-jmcomic-pop"
      className="dsh-jmcomic__pop"
      style={{ top: pos.top, left: pos.left, cursor: 'move' }}
      onClick={stopProp}
      onMouseDown={onMouseDown}
    >
      {(activeDownloads || []).length > 0 && (
        <div className="dsh-jmcomic__dlBanner">
          <span className="dsh-jmcomic__dlBannerSpinner" />
          <span className="dsh-jmcomic__dlBannerText">
            downloading {activeDownloads[0].title}
            {(activeDownloads || []).length > 1 ? ` (+${activeDownloads.length - 1} more)` : ''}
          </span>
        </div>
      )}
      <div className="dsh-jmcomic__popBody">
        <div className="dsh-jmcomic__search">
          <input
            className="dsh-jmcomic__input"
            placeholder={t('comic.searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doSearch() }}
          />
          <button className="dsh-jmcomic__btn" disabled={searching} onClick={doSearch}>
            {searching ? '…' : '🔍'}
          </button>
        </div>

        {searching && <div className="dsh-jmcomic__state">{t('comic.searching')}</div>}
        {!searching && results !== null && results.length === 0 && (
          <div className="dsh-jmcomic__state">{t('comic.searchEmpty')}</div>
        )}
        {!searching && results !== null && results.length > 0 && (
          <div className="dsh-jmcomic__searchResults">
            {results.map((r) => (
              <div key={r.id} className="dsh-jmcomic__resultRow">
                <img className="dsh-jmcomic__resultCover" src={r.cover} alt="" loading="lazy" />
                <div className="dsh-jmcomic__resultInfo">
                  <div className="dsh-jmcomic__resultTitle">{r.title}</div>
                  <div className="dsh-jmcomic__resultMeta">#{r.id}</div>
                </div>
                <div className="dsh-jmcomic__resultActions">
                  {downloading === r.id
                    ? <span className="dsh-jmcomic__downloadState">{t('comic.downloading')}</span>
                    : (
                      <button className="dsh-jmcomic__btn" onClick={() => download(r)}>↓</button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {baseDir ? (
          <div className="dsh-jmcomic__recent">
            <div className="dsh-jmcomic__covers">
              {covers.length > 0 ? covers.map((c) => (
                <div key={c.path} className="dsh-jmcomic__cover" onClick={() => onPick(c.path)} title={c.title}>
                  {c.cover ? <img src={`/jmcomic/api/img?path=${encodeURIComponent(c.cover)}`} alt="" /> : <span>📕</span>}
                </div>
              )) : (
                <div className="dsh-jmcomic__hint" style={{ padding: '8px 4px', flex: 1, textAlign: 'center' }}>
                  {t('comic.empty')}
                </div>
              )}
            </div>
            <button className="dsh-jmcomic__moreBtn" onClick={onOpenLibrary}>{t('comic.more')}</button>
          </div>
        ) : (
          <button className="dsh-jmcomic__btn secondary" style={{ width: '100%' }} onClick={onImport}>
            {t('comic.importFolder')}
          </button>
        )}
      </div>
    </div>
  )
}

// --- Trigger component ------------------------------------------------------

function ComicTrigger(props) {
  const { t, pickDirectory } = props
  const [pop, setPop] = useState(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)
  const [settings, setSettings] = useState(null)
  const [albums, setAlbums] = useState([])
  const [triggerRef, setTriggerRef] = useState(null)
  const [initialAlbumPath, setInitialAlbumPath] = useState(null)
  // 封面点击时标记:打开后直接进入第一章阅读
  const [initialReadPath, setInitialReadPath] = useState(null)
  const pendingAlbum = useRef(null)
  // 进行中的下载任务列表:[{ id, title }],供小窗/大窗顶部显示
  const [activeDownloads, setActiveDownloads] = useState([])

  const beginDownload = (id, title) => {
    setActiveDownloads((prev) => prev.some((d) => d.id === id) ? prev : [...prev, { id, title }])
  }
  const endDownload = (id) => {
    setActiveDownloads((prev) => prev.filter((d) => d.id !== id))
  }

  const toast = (msg) => {
    setToastMsg(msg)
    window.setTimeout(() => setToastMsg(null), 3500)
  }

  const loadSettings = async () => {
    const r = await apiGet('/jmcomic/api/settings')
    if (r.ok) {
      // 数据未变化时不更新 state(避免轮询驱动无谓重渲染)
      setSettings((prev) => {
        if (prev && prev.baseDir === r.data.baseDir && prev.pythonPath === r.data.pythonPath
          && prev.installPromptShown === r.data.installPromptShown
          && JSON.stringify(prev.recent) === JSON.stringify(r.data.recent)) {
          return prev
        }
        return r.data
      })
    }
    return r.ok ? r.data : null
  }

  const loadLibrary = async () => {
    const s = await loadSettings()
    const r = await apiGet(`/jmcomic/api/library${s && s.baseDir ? `?dir=${encodeURIComponent(s.baseDir)}` : ''}`)
    if (r.ok) setAlbums(r.data.albums || [])
  }

  // first-load env check (install prompt)
  useEffect(() => {
    let cancelled = false
    apiGet('/jmcomic/api/env').then((r) => {
      if (cancelled || !r.needsPrompt) return
      setShowPrompt(true)
    })
    return () => { cancelled = true }
  }, [])

  // 小窗打开时,点击 pop 外任意位置自动关闭(修复:之前无法关闭)
  useEffect(() => {
    if (!pop) return
    const onDocClick = (e) => {
      const popEl = document.getElementById('dsh-jmcomic-pop')
      if (popEl && popEl.contains(e.target)) return
      setPop(null)
    }
    // 延迟一帧注册,避免触发本次按钮点击立即关闭
    const timer = window.setTimeout(() => {
      document.addEventListener('click', onDocClick)
    }, 50)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('click', onDocClick)
    }
  }, [pop])

  // 首次加载 + 文件夹变动检测:定时轮询 library,检测到内容变化自动刷新
  useEffect(() => {
    void loadLibrary()
    let lastSig = ''
    const timer = window.setInterval(async () => {
      const s = await loadSettings()
      if (!s || !s.baseDir) return
      const r = await apiGet(`/jmcomic/api/library?dir=${encodeURIComponent(s.baseDir)}&sig=1`)
      if (r.ok && r.data && r.data.sig && r.data.sig !== lastSig) {
        lastSig = r.data.sig
        setAlbums(r.data.albums || [])
      }
    }, 5000)
    return () => { window.clearInterval(timer) }
  }, [])

  const togglePop = () => {
    if (pop) { setPop(null); return }
    const rect = triggerRef?.getBoundingClientRect()
    const popWidth = 320
    const left = Math.max(8, (rect ? rect.left : 220) - popWidth + (rect ? rect.width : 0) - 8)
    setPop({
      top: Math.max(8, (rect ? rect.top : 80) - 8),
      left,
    })
    void loadLibrary()
  }

  const onImport = async () => {
    const dir = await pickDirectory()
    if (!dir) return
    await apiPost('/jmcomic/api/settings', { baseDir: dir })
    await loadLibrary()
    toast(`${t('comic.imported').replace('{dir}', dir)}`)
    window.setTimeout(() => toast(t('comic.importHint')), 1200)
  }

  const openLibrary = () => {
    setPop(null)
    setLibraryOpen(true)
    void loadLibrary()
  }

  const pickAndRefresh = async () => {
    const dir = await pickDirectory()
    if (!dir) return
    await apiPost('/jmcomic/api/settings', { baseDir: dir })
    await loadLibrary()
    toast(t('comic.importHint'))
  }

  const closeLibrary = () => {
    setLibraryOpen(false)
    pendingAlbum.current = null
    setInitialAlbumPath(null)
    setInitialReadPath(null)
  }

  return (
    <>
      <button
        ref={setTriggerRef}
        type="button"
        className={props.wide ? 'dsh-jmcomic__trigger' : 'dsh-jmcomic__trigger rail'}
        aria-haspopup="dialog"
        aria-expanded={Boolean(pop) || libraryOpen}
        aria-label={t('comic.trigger')}
        onClick={togglePop}
      >
        <span className="dsh-jmcomic__triggerIcon" style={{ fontSize: props.wide ? 15 : 16, lineHeight: 1 }}>📚</span>
        {props.wide && <span className="dsh-jmcomic__triggerLabel">{t('comic.trigger')}</span>}
      </button>

      {pop && (
        <ComicPop
          position={pop}
          baseDir={settings?.baseDir || ''}
          albums={albums}
          recent={settings?.recent || []}
          activeDownloads={activeDownloads}
          t={t}
          onImport={onImport}
          onOpenLibrary={openLibrary}
          onSearchResult={loadLibrary}
          onPick={(p) => {
            pendingAlbum.current = p
            setInitialAlbumPath(p)
            setInitialReadPath(p)
            openLibrary()
          }}
          toast={toast}
          beginDownload={beginDownload}
          endDownload={endDownload}
        />
      )}

      {libraryOpen && (
        <LibraryModal
          key={initialAlbumPath || 'library'}
          baseDir={settings?.baseDir || ''}
          albums={albums}
          initialAlbumPath={initialAlbumPath}
          initialReadPath={initialReadPath}
          activeDownloads={activeDownloads}
          onRefresh={loadLibrary}
          onClose={closeLibrary}
          onOpenDir={pickAndRefresh}
          t={t}
        />
      )}

      {showPrompt && (
        <InstallPrompt
          t={t}
          onClose={async () => {
            setShowPrompt(false)
            await apiPost('/jmcomic/api/settings', { installPromptShown: true })
          }}
          onOpenGitHub={() => window.open(t('comic.installLink'), '_blank')}
        />
      )}

      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}
    </>
  )
}

// --- Settings card(设置 → 插件 → 插件配置)------------------------------------

function SettingsCard(props) {
  const { t, pickDirectory } = props
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const r = await apiGet('/jmcomic/api/settings')
    if (r.ok) setSettings(r.data)
  }
  useEffect(() => { void load() }, [])

  const save = async (patch) => {
    setSaving(true)
    const r = await apiPost('/jmcomic/api/settings', patch)
    setSaving(false)
    if (r.ok) setSettings(r.data)
    return r.ok
  }

  const pickAndSave = async () => {
    const dir = await pickDirectory()
    if (!dir) return
    await save({ baseDir: dir })
  }

  return (
    <div style={{ padding: '4px 2px' }}>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: 'var(--dsw-alias-label-primary)' }}>
        {t('comic.settingsTitle')}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ flex: 'none', fontSize: 13, color: 'var(--dsw-alias-label-secondary)' }}>
          {t('comic.settingsBaseDir')}
        </span>
        <input
          className="dsh-jmcomic__input"
          style={{ flex: 1, minWidth: 0 }}
          value={settings?.baseDir || ''}
          placeholder={t('comic.settingsBaseDirPlaceholder')}
          onChange={(e) => setSettings({ ...(settings || {}), baseDir: e.target.value })}
          onBlur={() => { if (settings?.baseDir !== undefined) void save({ baseDir: settings.baseDir }) }}
        />
        <button className="dsh-jmcomic__btn secondary" onClick={pickAndSave}>{t('comic.settingsPick')}</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ flex: 'none', fontSize: 13, color: 'var(--dsw-alias-label-secondary)' }}>
          {t('comic.settingsPython')}
        </span>
        <input
          className="dsh-jmcomic__input"
          style={{ flex: 1, minWidth: 0 }}
          value={settings?.pythonPath || ''}
          placeholder="python"
          onChange={(e) => setSettings({ ...(settings || {}), pythonPath: e.target.value })}
          onBlur={() => { if (settings?.pythonPath !== undefined) void save({ pythonPath: settings.pythonPath }) }}
        />
        {saving && <span style={{ fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' }}>…</span>}
      </div>
    </div>
  )
}

// --- Client plugin ----------------------------------------------------------

import { useEffect, useRef, useState } from 'react'

/** Services required by the client plugin. */
export const inject = ['slots', 'locale', 'workspaces']

/** Client plugin body. */
export function apply(ctx) {
  ensureStyles()
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-jmcomic: dictionaries')

  const workspaces = ctx.workspaces
  const pickDirectory = () => workspaces.pickDirectory()

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'dsh-jmcomic',
    order: -10,
    locale: NS,
    inject: () => ({
      pickDirectory,
    }),
  }, ComicTrigger))

  // 设置 → 插件 → 插件配置:jmcomic 配置卡(更改默认本地文件夹)
  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    key: 'dsh-jmcomic',
    id: 'dsh-jmcomic',
    order: 30,
    locale: NS,
    inject: () => ({ pickDirectory }),
  }, SettingsCard))
}
