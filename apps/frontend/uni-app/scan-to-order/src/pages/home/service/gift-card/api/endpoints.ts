/**
 * ============================================================================
 * 【文件概述】卡包路径清单，只拥有目录、持卡查询及开发资产操作。
 * 【方法与导出清单】endpoints。
 * 【综合使用示例】
 * import { endpoints } from './endpoints'
 * const path = endpoints.my // => '/card/my'
 * ============================================================================
 */
export const endpoints = {
  /** 开发专用模拟购卡、消费、退款；非生产协议。 */
  demoAction: '/__mock/gift-card/action',
  /** 默认网关，公开模板查询。 */
  list: '/card/list',
  /** 默认网关，当前客户持卡查询。 */
  my: '/card/my',
} as const
