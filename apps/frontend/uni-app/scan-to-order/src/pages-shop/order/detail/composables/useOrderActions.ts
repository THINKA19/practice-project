/**
 * ============================================================================
 * 门店订单履约操作
 * ============================================================================
 *
 * 【文件概述】
 * 校验门店和动作权限，提交订单版本，通知调用页面刷新。
 *
 * 【方法与导出清单】
 * - useOrderActions：组合列表和详情可共同使用的履约动作。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useOrderActions } from '@/pages-shop/order/detail'
 * // 页面传入订单查找函数和刷新函数
 * const actions = useOrderActions(findOrder, refresh)
 * ```
 * ============================================================================
 */
import { shopText as st } from '@/locale/shop-text'
import type { ShopOrder } from '../../list'
import { submitShopOrderAction } from '../api/orders'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { confirm as confirmModal, prompt, showError, toast } from '@/utils/project/interaction'

const permissions: Record<string, string> = {
  accept: 'order.accept',
  prepare: 'order.prepare',
  cancel: 'order.cancel',
  serve: 'order.serve',
  pickup: 'order.pickup.verify',
  collect: 'order.cashier.collect',
}

/**
 * 组装通过门店授权的订单动作。
 * @param findOrder 按编号取得调用页面的最新订单。
 * @param refresh 服务端写入成功或冲突后的页面刷新方法。
 * @returns 接单、取消、出餐和交付方法。
 * @example useOrderActions(findOrder, refresh).finishOrder(id) // => 提交出餐动作
 */
export function useOrderActions(findOrder: (id: string) => ShopOrder | undefined, refresh: () => Promise<void>) {
  const contextStore = useMerchantShopStore()
  let submitting = false
  async function execute(id: string, action: string, verificationCode?: string, version?: number) {
    if (submitting)
      return false
    const revision = contextStore.revision
    submitting = true
    try {
      const context = contextStore.capture(permissions[action])
      const order = findOrder(id)
      if (!order || order.id !== id || order.shopId !== context.shopId || (version !== undefined && order.version !== version))
        throw new Error(st('订单已失效，请刷新'))
      await submitShopOrderAction(context, order, action, verificationCode)
      if (contextStore.matches(context)) {
        toast(st('操作成功'), 'success')
        await refresh()
        return true
      }
    }
    catch (error) {
      if (contextStore.revision === revision) {
        showError(error)
        await refresh()
      }
    }
    finally {
      submitting = false
    }
    return false
  }
  async function confirm(id: string, action: string) {
    const revision = contextStore.revision
    const order = findOrder(id)
    if (!order)
      return false
    const codeRequired = action === 'pickup' && order.pickupVerificationRequired
    const answer = codeRequired
      ? await prompt({ title: st('自取核销'), placeholder: st('请输入顾客核销码') })
      : await confirmModal({ title: st(action === 'collect' ? '确认线下收款' : '操作确认'), content: st(action === 'collect' ? '请确认款项已实际收取' : '确认处理当前门店的此订单？') })
    if (answer && contextStore.revision === revision)
      return execute(id, action, typeof answer === 'string' ? answer : undefined, order.version)
    return false
  }
  return { acceptOrder: (id: string) => confirm(id, 'accept'), finishOrder: (id: string) => execute(id, 'prepare'), cancelOrder: (id: string) => confirm(id, 'cancel'), deliverOrder: (id: string) => confirm(id, findOrder(id)?.type === '堂食' ? 'serve' : 'pickup'), collectOrder: (id: string) => confirm(id, 'collect') }
}
