/**
 * ============================================================================
 * 【文件概述】配送任务的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RIDER_ORDER_STATUS：任务状态对应的展示文案。
 * 【综合使用示例】
 * import { RIDER_ORDER_STATUS } from '@/pages-rider/delivery/task/models/enums'
 * RIDER_ORDER_STATUS.assigned.text // '指派待确认'
 * ============================================================================
 */
const meta = (text: string) => ({ text, color: '#A0826D', bg: '#e8f5e9' })
/**
 * 任务状态对应的展示文案。
 * @example RIDER_ORDER_STATUS.assigned.text // '指派待确认'
 */
export const RIDER_ORDER_STATUS = { pending: meta('待接单'), assigned: meta('指派待确认'), accepted: meta('待取餐'), delivering: meta('配送中'), done: meta('已送达'), cancelled: meta('已取消') }
