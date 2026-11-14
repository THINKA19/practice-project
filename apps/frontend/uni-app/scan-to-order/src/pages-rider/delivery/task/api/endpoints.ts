/**
 * ============================================================================
 * 【文件概述】配送任务的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - endpoints：配送任务接口路径唯一事实源，供 API 和 Mock 共同引用。
 * 【综合使用示例】
 * import { endpoints } from '@/pages-rider/delivery/task/api/endpoints'
 * Object.values(endpoints) // 配送任务接口路径列表
 * ============================================================================
 */
/**
 * 配送任务接口路径唯一事实源，供 API 和 Mock 共同引用。
 * @example Object.values(endpoints) // 配送任务接口路径列表
 */
export const endpoints = { tasks: '/operator/rider/tasks', online: '/operator/rider/online', action: '/operator/rider/task/action' } as const
