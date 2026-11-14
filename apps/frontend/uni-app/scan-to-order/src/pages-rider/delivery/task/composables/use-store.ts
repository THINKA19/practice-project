/**
 * ============================================================================
 * 【文件概述】配送任务的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderTaskStore：管理当前骑手任务投影、动作锁和会话隔离；不乐观写入任务状态。
 * 【综合使用示例】
 * import { useRiderTaskStore } from '@/pages-rider/delivery/task/composables/use-store'
 * const tasks = useRiderTaskStore(); await tasks.refresh() // 更新当前账号任务
 * ============================================================================
 */
import { t } from '@/locale'
import { useRiderPermissionsStore } from '@/pages-rider/auth/permissions'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useSessionState } from '@/pages/auth/session'
import type { ActResult, RiderAction, RiderOrder, RiderServiceArea } from '../models/types'
import { validateSnapshot } from '../models/mappers'
import { summarizeTasks, taskActionError } from '../domain/task.rules'
import { fetchRiderTasks, setRiderOnline, submitRiderAction } from '../api/tasks.api'

/**
 * 管理当前骑手任务投影、动作锁和会话隔离；不乐观写入任务状态。
 * 无参数；须在已安装 Pinia 的应用中调用。
 * @returns 当前 Pinia 实例中本领域的状态与操作。
 * @example const tasks = useRiderTaskStore(); await tasks.refresh() // 更新当前账号任务
 */
export const useRiderTaskStore = defineStore('rider-task-pool', () => {
  const session = useSessionState()
  const orders = ref<RiderOrder[]>([])
  const online = ref(false)
  const riderId = ref('')
  const serviceArea = ref<RiderServiceArea | null>()
  const maxConcurrent = ref(0)
  const error = ref('')
  const loading = ref(false)
  const submitting = ref(false)
  const clock = ref(Date.now())
  let revision = 0
  let actionRevision = 0
  const identity = computed(() => session.identity === 'rider' && session.hasLogin ? session.sessionRevision : -1)
  const hallOrders = computed(() => orders.value.filter(o => o.status === 'pending' && !o.riderId))
  const myOrders = computed(() => orders.value.filter(o => !!riderId.value && o.riderId === riderId.value))
  const assignedOrders = computed(() => myOrders.value.filter(o => o.status === 'assigned'))
  const activeOrders = computed(() => myOrders.value.filter(o => o.status === 'accepted' || o.status === 'delivering'))
  const doneOrders = computed(() => myOrders.value.filter(o => o.status === 'done'))
  const stats = computed(() => summarizeTasks(myOrders.value, clock.value, serviceArea.value))
  /**
   * 清空当前任务投影并使在途请求与动作失效。
   * 无参数。
   * @returns {void} 重置任务、上下线、状态锁与错误。
   * @example store.reset() // 任务列表变为空
   */
  function reset() {
    revision++
    actionRevision++
    orders.value = []
    riderId.value = ''
    serviceArea.value = undefined
    online.value = false
    maxConcurrent.value = 0
    error.value = ''
    loading.value = false
    submitting.value = false
  }
  watch(identity, reset, { flush: 'sync' })
  /**
   * 读取并验证最新任务投影，隔离乱序响应。
   * 无参数。
   * @returns Promise<boolean>，最新快照应用成功时为 true。
   * @example await store.refresh() // 有效快照时 true
   */
  async function refresh(): Promise<boolean> {
    session.updateNowTime()
    const sent = identity.value
    const started = ++revision
    if (sent < 0)
      return false
    loading.value = true
    try {
      const result = validateSnapshot(await fetchRiderTasks(online.value || maxConcurrent.value === 0))
      if (sent !== identity.value || started !== revision)
        return false
      serviceArea.value = result.serviceArea
      orders.value = result.tasks
      online.value = result.online
      riderId.value = result.riderId
      maxConcurrent.value = result.maxConcurrent
      clock.value = Date.now()
      error.value = ''
      return true
    }
    catch (reason) {
      if (sent === identity.value && started === revision)
        error.value = reason instanceof Error ? reason.message : t('rider.task.refreshFailed')
      return false
    }
    finally {
      if (started === revision)
        loading.value = false
    }
  }
  async function mutate(permission: string, action: () => Promise<unknown>): Promise<ActResult> {
    session.updateNowTime()
    if (submitting.value || identity.value < 0)
      return { ok: false }
    const sent = identity.value
    const started = ++actionRevision
    submitting.value = true
    // 使动作开始前的列表响应失效。
    revision++
    try {
      await useRiderPermissionsStore().requirePermission(permission)
      if (sent !== identity.value)
        return { ok: false }
      await action()
      if (sent !== identity.value)
        return { ok: false }
      await refresh()
      return { ok: true }
    }
    catch (failure) {
      if (sent !== identity.value)
        return { ok: false }
      await refresh()
      return { ok: false, error: failure }
    }
    finally {
      if (started === actionRevision)
        submitting.value = false
    }
  }
  /**
   * 统一校验任务版本、状态并提交动作。
   * @param order 当前任务快照。
   * @param action 配送动作。
   * @param reason 异常原因，可选。
   * @returns Promise<ActResult>，取消或失效时返回 ok=false。
   * @example await store.pickupOrder(order) // 校验成功后请求取餐
   */
  function act(order: RiderOrder, action: RiderAction, reason = '') {
    const current = orders.value.find(item => item.id === order.id)
    if (!current || current.version !== order.version)
      return refresh().then((): ActResult => ({ ok: false, error: new Error(t('rider.task.conflict')) }))
    const issue = taskActionError(current, action, riderId.value, online.value, stats.value.activeCount, maxConcurrent.value, reason)
    if (issue)
      return Promise.resolve<ActResult>({ ok: false, error: new Error(issue) })
    return mutate(`task.${action}`, () => submitRiderAction(order, action, reason))
  }
  function toggleOnline() {
    const next = !online.value
    return mutate('online.change', async () => {
      const sent = identity.value
      await setRiderOnline(next)
      if (sent === identity.value)
        online.value = next
    })
  }

  return { orders, clock, online, riderId, serviceArea, loading, submitting, myOrders, assignedOrders, activeOrders, hallOrders, doneOrders, stats, error, maxConcurrent, refresh, reset, toggleOnline, grabOrder: (order: RiderOrder) => act(order, 'grab'), acceptAssigned: (order: RiderOrder) => act(order, 'accept'), rejectAssigned: (order: RiderOrder) => act(order, 'reject'), pickupOrder: (order: RiderOrder) => act(order, 'pickup'), finishOrder: (order: RiderOrder) => act(order, 'finish'), cancelAccept: (order: RiderOrder) => act(order, 'release'), reportException: (order: RiderOrder, reason: string) => act(order, 'exception', reason) }
})
