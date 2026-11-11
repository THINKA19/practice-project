/**
 * ============================================================================
 * 【文件概述】service/welfare/composables/use-page.ts，负责页面状态与交互编排。
 * 【方法与导出清单】useWelfarePage
 * 【综合使用示例】
 * import { useWelfarePage } from '@/pages/home/service/welfare/composables/use-page'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
import { useCouponPage } from '../../../user/coupons'
/**
 * 福利中心复用首页优惠券领域的领取流程，页面实例独立。
 * 无参数。
 * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
 * @example const page = useWelfarePage() // 获取独立页面状态
 */
export function useWelfarePage() {
  return useCouponPage()
}
