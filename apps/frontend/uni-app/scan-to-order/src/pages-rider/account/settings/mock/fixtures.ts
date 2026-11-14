/**
 * ============================================================================
 * 【文件概述】接单规则与提醒设置的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - createRules：创建独立的演示接单规则，不提供可修改的服务端设置。
 * 【综合使用示例】
 * import { createRules } from '@/pages-rider/account/settings/mock/fixtures'
 * createRules().maxConcurrent // 3
 * ============================================================================
 */
import type { RiderRules } from '../models/types'
import { demoDispatchPolicy } from '@/pages-rider/delivery/task/mock'

/**
 * 创建独立的演示接单规则，不提供可修改的服务端设置。
 * 无参数。
 * @returns RiderRules，含并发上限、超时秒数、服务门店和说明文本。
 * @example createRules().maxConcurrent // 3
 */
export function createRules(): RiderRules {
  return { ...demoDispatchPolicy, serviceShops: [{ id: 'demo-shop', name: '禾味厨房' }], rules: ['上线后才能抢单，待确认指派计入同时配送上限。', '先确认取餐，再标记送达；取餐前可以转回大厅。'] }
}
