/**
 * dsh-jmcomic — bundle build.
 *
 * Produces two artifacts:
 *   1. lib/client.js   — browser client bundle (self-registers via
 *                        window.__ModuleLoader__.load; @deepseek-ai/* and
 *                        react stay external, provided by the shell).
 *   2. lib/server.cjs  — host-side route/server code (node CJS; only node
 *                        builtins + @deepseek-ai/schemastery used).
 *
 * Usage: `npm run build` (also runs on `npm install` via prepare).
 */
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))

// --- client bundle -----------------------------------------------------------
await build({
  entryPoints: [resolve(root, 'src/client.jsx')],
  outfile: resolve(root, 'lib/client.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  jsx: 'automatic',
  sourcemap: true,
  // The dsh shell's static module table provides these at runtime.
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    'react-dom/client',
    '@deepseek-ai/*',
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  banner: {
    js: 'var module = { exports: {} }; var exports = module.exports;\n'
      + 'window.__ModuleLoader__.load({ id: "dsh-jmcomic", factory: (require) => {',
  },
  footer: {
    js: 'return module.exports; } });',
  },
  logLevel: 'info',
})

// --- host server bundle ------------------------------------------------------
await build({
  entryPoints: [resolve(root, 'src/server.js')],
  outfile: resolve(root, 'lib/server.cjs'),
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: ['node22'],
  // 插件根目录由 server.cjs 内基于打包后 __dirname(lib/)推导,不注入任何
  // 编译期绝对路径,保证可移植(迁移到任意目录/机器均可用)。
  // node 内置模块保持 external;@deepseek-ai/* 已从 server.js 移除。
  external: [],
  logLevel: 'info',
})

console.log('dsh-jmcomic: built lib/client.js + lib/server.cjs')
