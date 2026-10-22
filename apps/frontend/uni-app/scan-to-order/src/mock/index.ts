/**
 * Mock 扩展入口：
 * 1. modules/<API 文件同名>.mock.ts：方法、路径、请求参数和场景。
 * 2. generators/：纯数据工厂，每次调用返回独立数据，无 HTTP / store 依赖。
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
