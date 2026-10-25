/**
 * ============================================================================
 * 【文件概述】本文件负责 vite-plugins/mock-isolation.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】createMockIsolationPlugin。
 * 【综合使用示例】
 * import { createMockIsolationPlugin } from './vite-plugins/mock-isolation'
 * createMockIsolationPlugin(false) // 生产隔离插件
 * ============================================================================
 */
import type { Plugin } from 'vite'

/**
 * 在非开发 Mock 构建中替换公共入口，并拒绝产物残留业务 Mock。
 * @param enabled 仅开发环境且显式打开 Mock 时为 true。
 * @returns Vite 插件，不改变请求层的正常适配器。
 * @example createMockIsolationPlugin(false) // 生产入口为空实现
 */
export function createMockIsolationPlugin(enabled: boolean): Plugin {
  const virtualId = '\0scan-order-mock-disabled'
  return {
    name: 'scan-order-mock-isolation',
    enforce: 'pre',
    resolveId(id) {
      if (!enabled && (id === '@/mock' || /\/src\/mock(?:\/index(?:\.ts)?)?$/.test(id.replaceAll('\\', '/'))))
        return virtualId
    },
    load(id) {
      if (id === virtualId)
        return 'export function createMockRequestAdapter() { return undefined } export function resetAllMocks() {}'
    },
    transform(code, id) {
      if (!enabled && /\/src\/mock\/index\.ts(?:\?|$)/.test(id.replaceAll('\\', '/')))
        return { code: 'export function createMockRequestAdapter() { return undefined } export function resetAllMocks() {}', map: null }
    },
    generateBundle(_, bundle) {
      if (enabled)
        return
      this.emitFile({ type: 'asset', fileName: 'mock-isolation.json', source: JSON.stringify({ mockEnabled: false, checkedAt: new Date().toISOString() }) })
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk')
          continue
        for (const [id, info] of Object.entries(output.modules)) {
          const file = id.replaceAll('\\', '/')
          if (info.renderedLength > 0 && /\/src\/.*\/mock\//.test(file))
            this.error(`生产产物包含业务 Mock: ${file}; 引用方: ${this.getModuleInfo(id)?.importers.join(', ')}`)
          if (info.renderedLength > 0 && /\/src\/mock\/(?:loader|scenario|response)\.ts$/.test(file))
            this.error(`生产产物包含 Mock 实现: ${file}`)
        }
      }
    },
  }
}
