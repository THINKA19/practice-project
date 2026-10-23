/**
 * Mock 扩展入口：
 * 1. 业务模块 mock/：专属路由和数据；全局 modules/ 保留示例与显式登记。
 * 2. generators/：通用或示例工厂；业务专属工厂由业务模块维护。
 * 3. modules/index.ts：显式登记模块，初始化时检查重复路由。
 * 4. config.ts：开关和行为；utils/：响应信封、故障注入和登记检查。
 * 大型静态样本确有需要时放 fixtures/，由数据工厂读取。
 * 仅本入口创建适配器，业务调用继续使用现有 http/alova.ts。
 */
import { uniappMockResponse, uniappRequestAdapter } from '@alova/adapter-uniapp'
import { createAlovaMockAdapter } from '@alova/mock'
import { mockConfig } from './config'
import { mockModules } from './modules'
import { registerMockModules } from './utils/register'

/** 路由匹配与请求模拟交给 Alova，不自建 HTTP、路由器或存储层。 */
export function createMockRequestAdapter() {
  return createAlovaMockAdapter(registerMockModules(mockModules), {
    delay: mockConfig.delay,
    onMockResponse: uniappMockResponse,
    // 与官方适配方式一致：未登记的接口继续请求真实后端。
    httpAdapter: uniappRequestAdapter,
    mockRequestLogger: mockConfig.logRequests,
  })
}
