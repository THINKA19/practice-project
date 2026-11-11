/**
 * ============================================================================
 * 【文件概述】礼品卡流水接口路径；沿用现有 Alova 默认网关。
 * 【方法与导出清单】endpoints：本模块唯一端点清单，API 与 Mock 共用。
 * 【综合使用示例】
 * import { endpoints } from './endpoints'
 * const path = endpoints.logs // => '/card/logs'
 * ============================================================================
 */
export const endpoints = {
  /** 流水接口；默认网关，客户身份。 */
  logs: '/card/logs',
} as const
