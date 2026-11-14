/**
 * ============================================================================
 * 【文件概述】个人中心的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderAccountDto：账户概览接口响应；等级、可空评分与非负累计完成量由账户模块校验。
 * 【综合使用示例】
 * import type { RiderAccountDto } from '@/pages-rider/account/index/api/account.dto'
 * const count = (dto: RiderAccountDto) => dto.completedCount
 * ============================================================================
 */
/**
 * 账户概览接口响应；等级、可空评分与非负累计完成量由账户模块校验。
 * @example const count = (dto: RiderAccountDto) => dto.completedCount
 */
export interface RiderAccountDto { level: string, rating: number | null, completedCount: number }
