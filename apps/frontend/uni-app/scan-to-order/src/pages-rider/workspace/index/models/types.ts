/**
 * ============================================================================
 * 【文件概述】骑手工作台的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderWorkspaceOverview：工作台配置；公告为字符串，incomeTarget 为正数金额（元）或未配置 null。
 * 【综合使用示例】
 * import type { RiderWorkspaceOverview } from '@/pages-rider/workspace/index/models/types'
 * const announcement = (value: RiderWorkspaceOverview) => value.announcement
 * ============================================================================
 */
/**
 * 工作台配置；公告为字符串，incomeTarget 为正数金额（元）或未配置 null。
 * @example const announcement = (value: RiderWorkspaceOverview) => value.announcement
 */
export interface RiderWorkspaceOverview { announcement: string, incomeTarget: number | null }
