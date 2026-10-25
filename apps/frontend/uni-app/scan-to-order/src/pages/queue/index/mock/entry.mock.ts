/**
 * ============================================================================
 * 【文件概述】开发 Mock 专用登记入口，默认导出路由规则，可选导出状态重置。
 * 【方法与导出清单】reset。
 * 【综合使用示例】
 * import { reset } from '@/pages/queue/index/mock/entry.mock'
 * ============================================================================
 */
import { demoQueueState, queueState } from './state'

export { default } from './handlers'

/**
 * 重置普通与演示取号。无参数。
 * @returns {void} 恢复初始排队记录。
 * @example reset() // 恢复种子数据
 */
export function reset() {
  queueState.reset()
  demoQueueState.reset()
}
