/**
 * ============================================================================
 * 【文件概述】维护开发 Mock 开关与公共行为参数，不导入业务样本。
 * 【方法与导出清单】USE_MOCK、MockConfig、mockConfig。
 * 【综合使用示例】
 * import { USE_MOCK } from '@/mock/config'
 * ============================================================================
 */
/** Mock 仅用于开发；生产构建即使误设开关也不会启用。 */
export const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 公共行为配置，delay 单位毫秒，failureRate 默认零，strict 控制未命中。
 * @example const config: MockConfig = { delay: 300, failureRate: 0, strict: false, logRequests: false }
 */
export interface MockConfig {
  /** 固定延迟，便于复现 loading；单位毫秒。 */
  delay: number
  /** 仅对显式使用 withFailure 的接口生效，范围 0～1。 */
  failureRate: number
  strict: boolean
  logRequests: boolean
}

export const mockConfig: Readonly<MockConfig> = {
  delay: 300,
  failureRate: 0,
  logRequests: false,
  strict: import.meta.env.VITE_MOCK_STRICT === 'true',
}
