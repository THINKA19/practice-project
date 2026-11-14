/**
 * ============================================================================
 * 【文件概述】骑手工作台的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderWorkspaceDto：工作台接口响应；公告和参考目标独立于订单快照。
 * 【综合使用示例】
 * import type { RiderWorkspaceDto } from '@/pages-rider/workspace/index/api/workspace.dto'
 * const target = (dto: RiderWorkspaceDto) => dto.incomeTarget
 * ============================================================================
 */
/**
 * 工作台接口响应；公告和参考目标独立于订单快照。
 * @example const target = (dto: RiderWorkspaceDto) => dto.incomeTarget
 */
export interface RiderWorkspaceDto { announcement: string, incomeTarget: number | null }
