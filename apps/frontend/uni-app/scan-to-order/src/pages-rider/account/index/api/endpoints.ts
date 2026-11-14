/**
 * ============================================================================
 * 【文件概述】个人中心的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - endpoints：个人中心接口路径唯一事实源，供 API 和 Mock 共同引用。
 * 【综合使用示例】
 * import { endpoints } from '@/pages-rider/account/index/api/endpoints'
 * Object.values(endpoints) // 个人中心接口路径列表
 * ============================================================================
 */
/**
 * 个人中心接口路径唯一事实源，供 API 和 Mock 共同引用。
 * @example Object.values(endpoints) // 个人中心接口路径列表
 */
export const endpoints = { overview: '/operator/rider/account' } as const
