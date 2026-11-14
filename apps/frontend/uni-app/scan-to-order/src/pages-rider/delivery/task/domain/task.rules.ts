/**
 * ============================================================================
 * 【文件概述】配送任务的无框架依赖的纯业务规则层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - isInProgress：统一进行中口径：待确认指派、待取餐及配送中。
 * - actError：读取动作失败信息，静默取消不产生错误。
 * - summarizeTasks：按 UTC+7 业务日汇总本人任务，配送费按分累计且不表示结算收入。
 * - taskActionError：校验任务归属、状态、接单上限和异常说明，供前端与模拟后端复用。
 * 【综合使用示例】
 * import { isInProgress } from '@/pages-rider/delivery/task/domain/task.rules'
 * isInProgress(task) // task.status 为 assigned 时返回 true
 * ============================================================================
 */
import { t } from '@/locale'
import type { ActResult, RiderAction, RiderOrder, RiderServiceArea, RiderStats } from '../models/types'

/**
 * 统一进行中口径：待确认指派、待取餐及配送中。
 * @param task {RiderOrder} 当前配送任务
 * @returns boolean，待确认、待取餐或配送中时为 true。
 * @example isInProgress(task) // task.status 为 assigned 时返回 true
 */
export function isInProgress(task: RiderOrder): boolean {
  return ['assigned', 'accepted', 'delivering'].includes(task.status)
}
/**
 * 读取动作失败信息，静默取消不产生错误。
 * @param result {ActResult} 动作结果，取消时可无 error
 * @returns unknown，存在失败原因时返回 error，否则 undefined。
 * @example actError({ ok: false }) // undefined
 */
export function actError(result: ActResult): unknown {
  return 'error' in result ? result.error : undefined
}
/**
 * 取配送费汇总的各币种金额，单币种接口沿用服务区币种。
 * @param stats 配送费汇总。
 * @param currency 服务区币种。
 * @returns 按币种展示的原始金额列表。
 * @example riderIncomeAmounts({ todayIncome: 0 }, "VND")
 */
export function riderIncomeAmounts(stats: Pick<RiderStats, 'todayIncome' | 'incomeByCurrency'>, currency?: string) {
  return stats.incomeByCurrency?.length ? stats.incomeByCurrency : [{ amount: stats.todayIncome, currency }]
}

/** 联系按钮使用授权号码，订单页面只展示掩码。 */
export function maskRiderPhone(phone: string): string {
  if (phone.includes('*'))
    return phone
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 7)
    return digits ? '***' : ''
  return `${digits.slice(0, 3)}***${digits.slice(-4)}`
}

/** 配送完成时间兼容旧任务快照中的 settledAt。 */
export function deliveredAt(task: RiderOrder) {
  return task.deliveredAt ?? task.settledAt
}

export function riderDateKey(value: number | string, timeZone = 'Asia/Bangkok'): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value))
  const part = (type: string) => parts.find(item => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function formatRiderTime(value?: string, timeZone = 'Asia/Bangkok'): string {
  if (!value || !Number.isFinite(Date.parse(value)))
    return ''
  const time = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value))
  return `${riderDateKey(value, timeZone)} ${time}`
}

export function deliveryDeadlineLabel(task: RiderOrder, now: number): string {
  if (!task.deliverBy)
    return ''
  const deadline = Date.parse(task.deliverBy)
  if (!Number.isFinite(deadline))
    return ''
  const minutes = Math.ceil(Math.abs(deadline - now) / 60_000)
  return t(deadline < now ? 'rider.task.overdue' : 'rider.task.dueIn', { minutes })
}

export function orderReference(task: RiderOrder): string {
  return `#${(task.orderId || task.id).slice(-4)}`
}

/** 按当前运营时区和币种分别汇总今日配送费。 */
export function summarizeTasks(tasks: RiderOrder[], now: number, area?: RiderServiceArea | null): RiderStats & { todayCancelled: number } {
  const today = riderDateKey(now, area?.timeZone)
  const done = tasks.filter((task) => {
    const ended = deliveredAt(task)
    return task.status === 'done' && ended && riderDateKey(ended, area?.timeZone) === today
  })
  const cancelled = tasks.filter(task => task.status === 'cancelled'
    && task.cancelledAt
    && Number.isFinite(Date.parse(task.cancelledAt))
    && riderDateKey(task.cancelledAt, area?.timeZone) === today)
  return {
    ...summarizeDeliveryFees(done, area, tasks.filter(isInProgress).length),
    todayCancelled: cancelled.length,
  }
}

export function summarizeDeliveryFees(done: RiderOrder[], area?: RiderServiceArea | null, activeCount = 0): RiderStats {
  const income = new Map<string, number>()
  for (const task of done) {
    const currency = task.serviceArea?.currency ?? ''
    income.set(currency, (income.get(currency) ?? 0) + Math.round(task.deliveryFee * 100))
  }
  const baseCurrency = area?.currency ?? ''
  return {
    todayDone: done.length,
    todayIncome: (income.get(baseCurrency) ?? 0) / 100,
    activeCount,
    ...(area ? { incomeByCurrency: Array.from(income, ([currency, cents]) => ({ currency, amount: cents / 100 })) } : {}),
  }
}

/**
 * 校验任务归属、状态、接单上限和异常说明，供前端与模拟后端复用。
 * @param task {RiderOrder} 当前配送任务
 * @param action {RiderAction} 所提交的配送动作
 * @param riderId {string} 当前骑手标识
 * @param online {boolean} 是否接单
 * @param activeCount {number} 当前进行中任务数量
 * @param maxConcurrent {number} 服务端并发接单上限
 * @param reason 异常说明，最多 200 字
 * @returns string，允许动作时为空，否则为具体拒绝原因。
 * @example taskActionError(task, 'pickup', riderId, true, 1, 3) // 本人待取餐任务返回空字符串
 */
export function taskActionError(task: RiderOrder, action: RiderAction, riderId: string, online: boolean, activeCount: number, maxConcurrent: number, reason = ''): string {
  if (!online && (action === 'grab' || action === 'accept'))
    return t('rider.task.onlineRequired')
  if (action === 'accept' && task.assignmentExpiresAt && Date.parse(task.assignmentExpiresAt) <= Date.now())
    return t('rider.task.expired')
  if (action === 'grab')
    return task.status === 'pending' && !task.riderId && maxConcurrent > activeCount ? '' : '请先上线，并确认订单可接且未达到接单上限'
  if (!riderId || task.riderId !== riderId)
    return t('rider.task.ownOnly')
  const expected = { accept: 'assigned', reject: 'assigned', pickup: 'accepted', finish: 'delivering', release: 'accepted' } as const
  if (action === 'exception') {
    if (!['accepted', 'delivering'].includes(task.status))
      return t('rider.task.invalidState')
    return reason.trim() && reason.trim().length <= 200 ? '' : '请输入200字以内的异常说明'
  }
  return task.status === expected[action] ? '' : '当前订单状态不允许此操作'
}
