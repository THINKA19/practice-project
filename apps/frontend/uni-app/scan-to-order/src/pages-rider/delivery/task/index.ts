/**
 * ============================================================================
 * 【文件概述】配送任务的跨模块公开入口。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - isRiderDemo：所属模块的公开能力。
 * - useRiderTaskActions：所属模块的公开能力。
 * - useRiderTaskRefresh：所属模块的公开能力。
 * - useRiderTaskReminders：所属模块的公开能力。
 * - useRiderTaskStore：所属模块的公开能力。
 * - actError：所属模块的公开能力。
 * - RIDER_ORDER_STATUS：所属模块的公开能力。
 * 【综合使用示例】
 * import { isRiderDemo } from '@/pages-rider/delivery/task/index'
 * // 调用约束与参数见该导出的实现声明。
 * ============================================================================
 */
export { isRiderDemo } from './api/tasks.api'
export { useRiderTaskActions } from './composables/use-actions'
export { useRiderCopyAddress } from './composables/use-copy-address'
export { useRiderTaskRefresh } from './composables/use-refresh'
export { useRiderTaskReminders } from './composables/use-reminders'
export { useRiderTaskStore } from './composables/use-store'
export { actError, deliveryDeadlineLabel, maskRiderPhone, riderIncomeAmounts } from './domain/task.rules'

export { RIDER_ORDER_STATUS } from './models/enums'
export type { RiderOrder } from './models/types'

export type { ActResult } from './models/types'
