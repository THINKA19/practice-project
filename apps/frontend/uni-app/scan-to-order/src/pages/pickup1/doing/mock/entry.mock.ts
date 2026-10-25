/**
 * ============================================================================
 * 【文件概述】开发 Mock 专用登记入口，默认导出路由规则，可选导出状态重置。
 * 【方法与导出清单】reset。
 * 【综合使用示例】
 * import { reset } from '@/pages/pickup1/doing/mock/entry.mock'
 * ============================================================================
 */
import { demoPickupState } from './state'

export { default } from './handlers'

/**
 * 清空本模块开发会话状态。无参数。
 * @returns {void} 恢复初始样本。
 * @example reset() // 清空当前模块状态
 */
export function reset(): void {
  demoPickupState.reset()
}
