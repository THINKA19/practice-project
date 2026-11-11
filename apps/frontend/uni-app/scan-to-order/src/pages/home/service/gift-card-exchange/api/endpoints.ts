/**
 * ============================================================================
 * 【文件概述】礼品卡兑换接口路径；沿用现有 Alova 默认网关。
 * 【方法与导出清单】endpoints：本模块唯一端点清单，API 与 Mock 共用。
 * 【综合使用示例】
 * import { endpoints } from './endpoints'
 * const path = endpoints.exchange // => '/card/exchange'
 * ============================================================================
 */
export const endpoints = {
  /** 兑换接口；默认网关，客户身份。 */
  exchange: '/card/exchange',
} as const
