/**
 * ============================================================================
 * 【文件概述】配送任务的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderTaskDetail：读取本人任务详情并编排异常上报，拒绝过期确认框结果。
 * 【综合使用示例】
 * import { useRiderTaskDetail } from '@/pages-rider/delivery/task/composables/use-detail'
 * const page = useRiderTaskDetail() // 在详情页 setup 中读取路由任务 id
 * ============================================================================
 */
import { t } from '@/locale'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { useSessionAccountScope } from '@/pages/auth/session'
import { showError } from '@/utils/project/interaction'
import { useRiderTaskStore } from './use-store'
import { useRiderTaskRefresh } from './use-refresh'
import { useRiderTaskActions } from './use-actions'

/**
 * 读取本人任务详情并编排异常上报，拒绝过期确认框结果。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const page = useRiderTaskDetail() // 在详情页 setup 中读取路由任务 id
 */
export function useRiderTaskDetail() {
  const store = useRiderTaskStore()
  const id = ref('')
  const scope = useSessionAccountScope(() => {})
  const actions = useRiderTaskActions()
  useRiderTaskRefresh()
  onLoad((options) => {
    id.value = typeof options?.id === 'string' ? options.id : ''
  })
  const task = computed(() => store.myOrders.find(t => t.id === id.value) ?? store.hallOrders.find(t => t.id === id.value))
  async function report() {
    const current = task.value
    const ticket = scope.ticket()
    if (!current)
      return
    try {
      const result = await uni.showModal({ title: t('rider.task.reportIssue'), confirmText: t('common.confirm'), cancelText: t('common.cancel'), editable: true, placeholderText: t('rider.task.reportPrompt') })
      if (!result.confirm || !scope.current(ticket))
        return
      const reason = result.content?.trim() || ''
      if (!reason || reason.length > 200)
        throw new Error(t('rider.task.reportPrompt'))
      await actions.notify(store.reportException(current, reason))
    }
    catch (error) {
      if (scope.current(ticket))
        showError(error)
    }
  }
  return { store, task, report, resolveShopPhone: actions.resolveShopPhone, resolveCustomerPhone: actions.resolveCustomerPhone, navigateTask: actions.navigateTask, onCancel: actions.onCancel, acceptAssigned: actions.acceptAssigned, rejectAssigned: actions.rejectAssigned, pickupOrder: actions.onPickup, finishOrder: actions.onFinish }
}
