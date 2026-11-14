/**
 * ============================================================================
 * 【文件概述】骑手资料的跨模块公开入口。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderProfileStore：所属模块的公开能力。
 * 【综合使用示例】
 * import { useRiderProfileStore } from '@/pages-rider/account/profile/index'
 * // 调用约束与参数见该导出的实现声明。
 * ============================================================================
 */
export { useRiderProfileStore } from './composables/use-store'
export type { RiderAccountProfile } from './models/types'
