import type { MockWrapper } from '@alova/mock'

/** 防止模块聚合时同一路由被静默覆盖；匹配逻辑仍完全交给 Alova。 */
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
        throw new Error(`[mock] 重复路由 ${key}：${owner} / ${name}`)
      owners.set(key, name)
    }
  }
  return Object.values(modules)
}
