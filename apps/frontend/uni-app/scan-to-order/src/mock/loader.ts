/**
 * ============================================================================
 * 【文件概述】自动发现 Mock 登记入口、检查重复并统一重置状态。
 * 【方法与导出清单】discoverMockModules、registerMockModules、resetAllMocks。
 * 【综合使用示例】
 * import { discoverMockModules } from '@/mock/loader'
 * ============================================================================
 */
import type { MockWrapper } from '@alova/mock'

/**
 * 发现正式业务模块的专用登记入口。
 * 无参数。
 * @returns 文件路径到模块入口的映射，入口包含 default 和可选 reset。
 * @example discoverMockModules() // 文件路径到登记入口的映射
 */
export function discoverMockModules() {
  return import.meta.glob<{ default: MockWrapper, reset?: () => void }>([
    '/src/pages/**/mock/entry.mock.ts',
  ], { eager: true })
}

/**
 * 检查相同方法与路径，保留模块来源用于报错。
 * @param modules 来源文件到 MockWrapper 的映射。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example registerMockModules({}) // []
 */
export function registerMockModules(modules: Record<string, MockWrapper>): MockWrapper[] {
  const owners = new Map<string, string>()
  for (const [name, module] of Object.entries(modules)) {
    if (!module.enable)
      continue
    for (const route of Object.keys(module.data)) {
      // Alova 的无方法前缀写法等价于 GET。
      const method = /^\[(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|TRACE|CONNECT)\]/i.exec(route)
      const key = method
        ? `[${method[1].toUpperCase()}]${route.slice(method[0].length)}`
        : `[GET]${route}`
      const owner = owners.get(key)
      if (owner !== undefined)
        throw new Error(`[__SCAN_ORDER_DEV_MOCK__] 重复路由 ${key}：${owner} / ${name}`)
      owners.set(key, name)
    }
  }
  return Object.values(modules)
}

/**
 * 重置全部模块拥有的状态。无参数。
 * @returns {void} 不替换状态实例。
 * @example resetAllMocks() // 恢复全部样本
 */
export function resetAllMocks(): void {
  for (const entry of Object.values(discoverMockModules())) entry.reset?.()
}
