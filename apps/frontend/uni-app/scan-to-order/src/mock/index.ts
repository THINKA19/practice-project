/**
 * ============================================================================
 * 【文件概述】Mock 专用公共出口，不由业务根入口转发。
 * 【方法与导出清单】createMockRequestAdapter、resetAllMocks。
 * 【综合使用示例】
 * import { createMockRequestAdapter } from '@/mock/index'
 * ============================================================================
 */
import { uniappMockResponse, uniappRequestAdapter } from '@alova/adapter-uniapp'
import { createAlovaMockAdapter } from '@alova/mock'
import { mockConfig } from './config'
import { discoverMockModules, registerMockModules } from './loader'

export { resetAllMocks } from './loader'

/**
 * 创建开发 Mock 适配器，未命中时按配置回退或拒绝。
 * 无参数。
 * @returns Alova 请求适配器；匹配规则由 Alova 处理，未命中受严格模式控制。
 * @example createMockRequestAdapter() // 开发请求适配器
 */
export function createMockRequestAdapter() {
  return createAlovaMockAdapter(registerMockModules(Object.fromEntries(Object.entries(discoverMockModules()).map(([source, entry]) => [source, entry.default]))), {
    delay: mockConfig.delay,
    onMockResponse: uniappMockResponse,
    // 与官方适配方式一致：未登记的接口继续请求真实后端。
    httpAdapter: (request, method) => {
      if (mockConfig.strict)
        throw new Error('[mock] 未登记接口，严格模式阻止真实请求')
      console.warn('[mock] 未登记接口，回退真实网络', method.type, method.url)
      return uniappRequestAdapter(request, method)
    },
    mockRequestLogger: mockConfig.logRequests,
  })
}
