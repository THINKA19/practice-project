/**
 * ============================================================================
 * 【文件概述】配送任务的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderTaskActions：提供多页面共用的配送动作反馈，确认框结果受当前会话约束。
 * 【综合使用示例】
 * import { useRiderTaskActions } from '@/pages-rider/delivery/task/composables/use-actions'
 * const actions = useRiderTaskActions(); await actions.toggleOnline() // 请求切换接单状态
 * ============================================================================
 */
import type { ActResult, RiderOrder } from '../models/types'
import { currentLocale, t } from '@/locale'
import { useSessionAccountScope } from '@/pages/auth/session'
import { isRiderDemo } from '../api/tasks.api'
import { confirm, showError, toast } from '@/utils/project/interaction'
import { useRiderTaskStore } from './use-store'
import { actError, orderReference } from '../domain/task.rules'

/**
 * 提供多页面共用的配送动作反馈，确认框结果受当前会话约束。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const actions = useRiderTaskActions(); await actions.toggleOnline() // 请求切换接单状态
 */
export function useRiderTaskActions() {
  const store = useRiderTaskStore()
  const scope = useSessionAccountScope(() => {})
  async function notify(task: Promise<ActResult>, action?: 'grab' | 'accept') {
    const ticket = scope.ticket()
    const result = await task
    const error = actError(result)
    if (scope.current(ticket) && !result.ok && error) {
      const message = error instanceof Error ? error.message : ''
      const conflict = /^请求错误\[409\]|^HTTP请求错误\[409\]/.test(message) || message === '订单已更新，请刷新后重试'
      const code = typeof error === 'object' && 'code' in error ? error.code : undefined
      const status = typeof error === 'object' && 'statusCode' in error ? error.statusCode : undefined
      const localized = ['expired', 'onlineRequired', 'claimUnavailable', 'ownOnly', 'invalidState', 'reportPrompt', 'conflict']
        .some(key => message === t(`rider.task.${key}`))
      if (code === 'ORDER_ALREADY_CLAIMED' || conflict || code === 409 || status === 409)
        toast(t(action === 'grab' ? 'rider.task.claimConflict' : 'rider.task.conflict'))
      else if (currentLocale.value === 'zh-Hans' || localized)
        showError(error)
      else
        toast(t('rider.task.actionFailed'))
    }
    return result
  }
  async function onCancel(order: RiderOrder) {
    const ticket = scope.ticket()
    if (await confirm({ title: t('rider.task.release'), content: t('rider.task.releaseConfirm'), confirmText: t('common.confirm'), cancelText: t('common.cancel') }) && scope.current(ticket))
      return notify(store.cancelAccept(order))
  }
  function currentTask(order: RiderOrder) {
    return store.activeOrders.find(item => item.id === order.id && item.version === order.version)
  }
  function resolveShopPhone(order: RiderOrder) {
    const current = currentTask(order)
    if (isRiderDemo || current?.status !== 'accepted' || !current.shopPhone)
      return toast(t('rider.task.noShopContact'))
    return current.shopPhone
  }
  function navigateTask(order: RiderOrder) {
    const current = currentTask(order)
    const point = current?.status === 'accepted' ? current.pickupPoint : current?.deliveryPoint
    if (!current || !point)
      return toast(t('rider.task.noLocation'))
    // #ifdef H5
    if (typeof window !== 'undefined') {
      const destination = encodeURIComponent(`${point.latitude},${point.longitude}`)
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank', 'noopener,noreferrer')
      return
    }
    // #endif
    // #ifndef H5
    uni.openLocation({
      ...point,
      name: current.status === 'accepted' ? current.shopName : current.address,
      address: current.status === 'accepted' ? current.shopAddress : current.address,
      fail: () => toast(t('rider.task.mapFailed')),
    })
    // #endif
  }
  async function confirmAction(order: RiderOrder, title: string, content: string, action: (order: RiderOrder) => Promise<ActResult>, confirmText = t('common.confirm')) {
    const ticket = scope.ticket()
    if (await confirm({ title, content, confirmText, cancelText: t('common.cancel') }) && scope.current(ticket))
      return notify(action(order))
  }
  function resolveCustomerPhone(order: RiderOrder) {
    const current = currentTask(order)
    if (isRiderDemo || current?.status !== 'delivering' || !current.phone)
      return toast(t('rider.task.noContact'))
    return current.phone
  }
  return { notify, onCancel, resolveCustomerPhone, resolveShopPhone, navigateTask, onGrab: (o: RiderOrder) => notify(store.grabOrder(o), 'grab'), onPickup: (o: RiderOrder) => notify(store.pickupOrder(o)), onFinish: (o: RiderOrder) => confirmAction(o, t('rider.task.confirmDelivery'), [t(o.customer ? 'rider.task.finishNamed' : 'rider.task.finishOrder', { id: orderReference(o), customer: o.customer }), o.address].filter(Boolean).join('\n'), store.finishOrder, t('rider.task.finishSubmit')), acceptAssigned: (o: RiderOrder) => notify(store.acceptAssigned(o), 'accept'), rejectAssigned: (o: RiderOrder) => confirmAction(o, t('rider.task.rejectTitle'), t('rider.task.rejectConfirm'), store.rejectAssigned), toggleOnline: () => notify(store.toggleOnline()) }
}
