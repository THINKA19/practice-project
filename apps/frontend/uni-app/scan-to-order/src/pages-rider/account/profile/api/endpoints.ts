/**
 * ============================================================================
 * 【文件概述】骑手资料的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - endpoints：骑手资料接口路径唯一事实源，供 API 和 Mock 共同引用。
 * 【综合使用示例】
 * import { endpoints } from '@/pages-rider/account/profile/api/endpoints'
 * Object.values(endpoints) // 骑手资料接口路径列表
 * ============================================================================
 */
/**
 * 骑手资料接口路径唯一事实源，供 API 和 Mock 共同引用。
 * @example Object.values(endpoints) // 骑手资料接口路径列表
 */
export const endpoints = { profile: '/operator/rider/profile', save: '/operator/rider/profile/save' } as const
