/**
 * ============================================================================
 * 【文件概述】骑手资格与权限的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderGrantDto：权限接口响应；包含骑手标识、资格布尔值和操作权限字符串列表。
 * 【综合使用示例】
 * import type { RiderGrantDto } from '@/pages-rider/auth/permissions/api/permissions.dto'
 * const owner = (dto: RiderGrantDto) => dto.riderId
 * ============================================================================
 */
/**
 * 权限接口响应；包含骑手标识、资格布尔值和操作权限字符串列表。
 * @example const owner = (dto: RiderGrantDto) => dto.riderId
 */
export interface RiderGrantDto { riderId: string, qualified: boolean, permissions: string[] }
