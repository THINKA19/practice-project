import type { VerificationOrder } from '../models/types'

/**
 * 判断服务端订单是否已完成。
 * @param order 经接口边界校验的页面订单。
 * @returns 状态为 3/4 时返回 true。
 * @example isVerificationCompleted(order) // 用于展示完成状态
 */
export function isVerificationCompleted(order: VerificationOrder): boolean {
  return [3, 4].includes(order.status)
}

/**
 * 判断订单状态是否允许核销；账号权限由调用方与服务端校验。
 * @param order 已校验的页面订单，未加载时为 null。
 * @returns 仅状态 1/2 且非制作中时返回 true。
 * @example canVerifyOrder(order) // 与页面提交锁、账号检查组合使用
 */
export function canVerifyOrder(order: VerificationOrder | null): boolean {
  return !!order && !order.preparing && [1, 2].includes(order.status)
}
