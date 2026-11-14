/**
 * ============================================================================
 * 【文件概述】配送任务的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderTaskActionDto：版本化任务动作请求；只含 id、version、action 与 reason，不在请求体传递凭证。
 * - RiderOnlineDto：接单状态命令；online 为上线或下线布尔值。
 * 【综合使用示例】
 * import type { RiderTaskActionDto } from '@/pages-rider/delivery/task/api/tasks.dto'
 * const dto: RiderTaskActionDto = { id: 'task-1', version: 1, action: 'pickup', reason: '' }
 * ============================================================================
 */
import type { RiderAction, RiderPoint } from '../models/types'
/**
 * 版本化任务动作请求；只含 id、version、action 与 reason，不在请求体传递凭证。
 * @example const dto: RiderTaskActionDto = { id: 'task-1', version: 1, action: 'pickup', reason: '' }
 */
export interface RiderTaskActionDto { id: string, version: number, action: RiderAction, reason: string }
/**
 * 接单状态命令；online 为上线或下线布尔值。
 * @example const dto: RiderOnlineDto = { online: true }
 */
export interface RiderOnlineDto { online: boolean, location?: RiderPoint & { accuracy?: number } }
