/**
 * dsh-jmcomic — host half entry.
 *
 * The host logic lives in src/server.js (webServer routes + python bridge
 * calls). It is bundled into lib/server.cjs by build.mjs so the installed
 * plugin ships a single self-contained file (no src/ needed at runtime).
 *
 * 兼容性要点(实测坑,2026-08,两次炸服后总结):
 * 1. Windows 下 ESM 动态 import 必须用 file:// URL,裸路径(G:\...)会抛
 *    ERR_UNSUPPORTED_ESM_URL_SCHEME —— 这里用 createRequire 同步加载 CJS。
 * 2. 不要静态 import 任何 @deepseek-ai/* 包:插件 link 目录下无法解析它们
 *    (MODULE_NOT_FOUND),只有 profile 顶层 hoisted node_modules 有。
 * 3. 不要导出 Config:cordis 的 resolveConfig 在 Config 存在时会调用
 *    Config['~standard'].validate,普通对象 {} 没有该方法会抛
 *    "Cannot read properties of undefined (reading 'validate')"。
 *    不导出 Config(cordis 源码 fiber.ts:51 `if (!runtime.Config) return config`)
 *    或提供合法 z schema 才安全。参照 dsh-skill-panel:不导出 Config。
 */

import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

/** Plugin display name (matches the package name; Loader resolves it). */
export const name = 'dsh-jmcomic'

/** Requires the webServer service (routes registered in the bundled server). */
export const inject = ['webServer']

/** Install the host half. */
export function apply(ctx) {
  const { registerJmcomicRoutes } = require('./lib/server.cjs')
  registerJmcomicRoutes(ctx)
}
