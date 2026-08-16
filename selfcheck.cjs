// dsh-jmcomic host 自检(修正:handler 非 async,用短等待替代 await)
const { registerJmcomicRoutes } = require('G:/github/dsh-jmcomic/lib/server.cjs')
const { Readable } = require('stream')
const routes = new Map()
const prefixes = []
const fakeCtx = {
  webServer: {
    register(r) {
      if (r.kind === 'exact') { routes.set(r.path, r.handler); return () => routes.delete(r.path) }
      if (r.kind === 'prefix') { prefixes.push(r); return () => {} }
      return () => {}
    },
  },
  effect(f) { f(); return () => {} },
}

function call(path, method = 'GET', body, waitMs = 1500) {
  return new Promise((resolvePromise) => {
    const req = new Readable(); req._read = () => {}
    req.method = method; req.url = path
    if (body) req.push(Buffer.from(body))
    req.push(null)
    const res = {
      statusCode: 0, headers: {}, chunks: [],
      writeHead(s, h) { this.statusCode = s; if (h) Object.assign(this.headers, h) },
      write(c) { this.chunks.push(Buffer.from(c)) },
      end(c) { if (c) this.chunks.push(Buffer.from(c)) },
      body() { return Buffer.concat(this.chunks).toString('utf8') },
    }
    const pathname = new URL(path, 'http://x').pathname
    let h = routes.get(pathname) || null
    if (!h) {
      let best = null
      for (const r of prefixes) {
        if (pathname === r.path || pathname.startsWith(r.path + '/')) {
          if (!best || r.path.length > best.path.length) best = r
        }
      }
      h = best ? best.handler : null
    }
    if (!h) { resolvePromise({ status: 404, body: 'no route', headers: {}, chunks: [] }); return }
    h(req, res)
    setTimeout(() => resolvePromise({ status: res.statusCode, body: res.body(), headers: res.headers, chunks: res.chunks }), waitMs)
  })
}

;(async () => {
  registerJmcomicRoutes(fakeCtx)
  console.log('routes:', [...routes.keys()].join(', '))

  let r = await call('/jmcomic/api/settings', 'POST', JSON.stringify({ baseDir: 'E:/jmcomic' }))
  console.log('\n[settings POST]', r.status, r.body.slice(0, 120))

  r = await call('/jmcomic/api/library')
  console.log('[library]', r.status, r.body.slice(0, 300))

  r = await call('/jmcomic/api/env')
  console.log('\n[env]', r.status, r.body.slice(0, 260))

  r = await call('/jmcomic/api/search?q=' + encodeURIComponent('电锯人'), 'GET', null, 20000)
  console.log('\n[search]', r.status, r.body.slice(0, 200))

  r = await call('/jmcomic/viewer/static/js/reader.js', 'GET', null, 3000)
  console.log('\n[viewer static]', r.status, 'len:', r.chunks.reduce((a, c) => a + c.length, 0), 'ct:', r.headers['content-type'])

  r = await call('/jmcomic/viewer/jm_view?path=' + encodeURIComponent('E:/jmcomic'), 'GET', null, 3000)
  console.log('\n[jm_view page]', r.status, 'len:', r.body.length, 'has stream:', r.body.includes('id="stream"'))

  console.log('\nALL ROUTES OK')
  process.exit(0)
})().catch((e) => { console.error('SELF-CHECK FAILED:', e); process.exit(1) })
