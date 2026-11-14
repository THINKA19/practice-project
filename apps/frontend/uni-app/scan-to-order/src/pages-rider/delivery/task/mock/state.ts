/**
 * ============================================================================
 * 【文件概述】配送任务的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - snapshot：校验模拟身份后返回任务副本，不暴露内部可变状态。
 * - setOnline：修改凭证所属模拟骑手的接单状态。
 * - act：校验版本与状态后推进模拟配送任务；非法转换不写入。
 * - reset：清空本模块的模拟数据；下一次读取重新创建样本。
 * 【综合使用示例】
 * import { snapshot } from '@/pages-rider/delivery/task/mock/state'
 * snapshot(authorization).riderId // 凭证所属模拟骑手 id
 * ============================================================================
 */
/** 开发演示后端；由统一 Mock 加载器登记，不代表商家派单或真实结算。 */
import { sessionState } from '@/pages/auth/session/mock'
import type { RiderAction, RiderOrder, RiderPoint } from '../models/types'
import { createHistory, createTasks, demoGrant } from './fixtures'
import { demoDispatchPolicy } from './policy'
import { isInProgress, taskActionError } from '../domain/task.rules'
import { RIDER_ORDER_STATUS } from '../models/enums'

const accounts = new Map<string, { online: boolean, location?: RiderPoint, seeded: boolean }>()
const tasks = new Map<string, RiderOrder>()
const capacity = demoDispatchPolicy.maxConcurrent

function account(authorization: string) {
  const user = sessionState.profile(authorization.replace(/^Bearer /, ''))
  if (user?.identity !== 'rider')
    throw new Error('骑手登录已失效')
  const id = String(user.userId)
  const grant = demoGrant(id)
  let data = accounts.get(id)
  if (!data) {
    data = { online: false, seeded: false }
    accounts.set(id, data)
    if (grant) {
      for (const task of createHistory(grant, id))
        tasks.set(task.id, task)
    }
  }
  return { id, data, grant }
}

function distanceKm(a: RiderPoint, b: RiderPoint): number {
  const radians = Math.PI / 180
  const latitude = (a.latitude - b.latitude) * radians
  const longitude = (a.longitude - b.longitude) * radians
  const h = Math.sin(latitude / 2) ** 2 + Math.cos(a.latitude * radians) * Math.cos(b.latitude * radians) * Math.sin(longitude / 2) ** 2
  return 12742 * Math.asin(Math.min(1, Math.sqrt(h)))
}

function matches(task: RiderOrder, grant: ReturnType<typeof demoGrant>, location?: RiderPoint) {
  return !!grant && !!location && !!task.pickupPoint && task.serviceArea?.countryCode === grant.area.countryCode
    && task.serviceArea.cityId === grant.area.cityId && task.serviceArea.zoneId === grant.area.zoneId
    && (!grant.shopIds || grant.shopIds.includes(task.shopId))
    && distanceKm(task.pickupPoint, location) <= grant.radiusKm
}

function returnToPool(task: RiderOrder) {
  task.status = 'pending'
  task.statusText = RIDER_ORDER_STATUS.pending.text
  task.riderId = ''
  task.assignmentExpiresAt = undefined
  task.version++
}

function expireAssignments() {
  for (const task of tasks.values()) {
    if (task.status === 'assigned' && task.assignmentExpiresAt && Date.parse(task.assignmentExpiresAt) <= Date.now())
      returnToPool(task)
  }
}

/** 返回授权范围内的候选单和本人已有任务。 */
export function snapshot(authorization: string, includeNew = true) {
  const { id, data, grant } = account(authorization)
  expireAssignments()
  const visible = Array.from(tasks.values()).filter((task) => {
    if (task.status === 'pending' || task.status === 'assigned')
      return includeNew && data.online && matches(task, grant, data.location) && (!task.riderId || task.riderId === id)
    return task.riderId === id
  })
  return {
    riderId: id,
    serviceArea: grant?.area ?? null,
    online: data.online,
    maxConcurrent: capacity,
    tasks: visible.map((task) => {
      const own = task.status !== 'pending' && task.status !== 'assigned'
      const active = task.status === 'accepted' || task.status === 'delivering'
      const deliveryDistanceKm = task.status === 'delivering' && task.deliveryPoint && data.location
        ? distanceKm(task.deliveryPoint, data.location)
        : undefined
      return {
        ...task,
        serviceArea: { ...task.serviceArea! },
        pickupPoint: task.pickupPoint && { ...task.pickupPoint },
        deliveryPoint: active && task.deliveryPoint ? { ...task.deliveryPoint } : undefined,
        address: own ? task.address : '',
        pickupNote: task.status === 'accepted' ? task.pickupNote : undefined,
        deliveryNote: task.status === 'delivering' ? task.deliveryNote : undefined,
        customer: own ? task.customer : '',
        phone: task.status === 'delivering' ? task.phone : '',
        shopPhone: task.status === 'accepted' ? task.shopPhone : undefined,
        deliveryDistanceKm,
        pickupCode: task.status === 'accepted' ? task.pickupCode : undefined,
        distance: task.pickupPoint && data.location ? `${distanceKm(task.pickupPoint, data.location).toFixed(1)} km` : '',
      }
    }),
  }
}

/** 上线校验运营授权及服务区，下线释放尚未确认的指派。 */
export function setOnline(authorization: string, online: boolean, location?: RiderPoint) {
  const { id, data, grant } = account(authorization)
  if (online) {
    if (!grant)
      throw new Error('尚未分配服务区，请联系站点管理员')
    const position = location ?? grant.center
    if (!Number.isFinite(position.latitude) || !Number.isFinite(position.longitude)
      || Math.abs(position.latitude) > 90 || Math.abs(position.longitude) > 180
      || distanceKm(position, grant.center) > grant.radiusKm) {
      throw new Error('当前定位不在服务区域内')
    }
    data.location = position
    if (!data.seeded) {
      for (const task of createTasks(grant, id)) {
        if (!tasks.has(task.id))
          tasks.set(task.id, task)
      }
      data.seeded = true
    }
  }
  else {
    data.location = undefined
    for (const task of tasks.values()) {
      if (task.riderId === id && task.status === 'assigned')
        returnToPool(task)
    }
  }
  data.online = online
}

/**
 * 校验版本与状态后推进模拟配送任务；非法转换不写入。
 * @param authorization {string} Bearer 模拟会话凭证
 * @param input {Pick<RiderOrder, 'id' | 'version'>} 任务 id 与乐观锁版本
 * @param action {RiderAction} 所提交的配送动作
 * @param reason {string} 异常说明，最多 200 字
 * @returns {void} 本人待取餐任务变为配送中
 * @example act(authorization, task, 'pickup', '') // void；本人待取餐任务变为配送中
 */
export function act(authorization: string, input: Pick<RiderOrder, 'id' | 'version'>, action: RiderAction, reason: string) {
  const { id, data, grant } = account(authorization)
  expireAssignments()
  const task = tasks.get(input.id)
  if (!data.online && (action === 'grab' || action === 'accept'))
    throw new Error('请先上线接单')
  if (task && (task.status === 'pending' || task.status === 'assigned') && !matches(task, grant, data.location))
    throw new Error('订单不在当前服务范围')
  if (task?.riderId && task.riderId !== id && (action !== 'grab' || !matches(task, grant, data.location) || task.version === input.version))
    throw new Error('订单不在当前服务范围')
  if (!task || task.version !== input.version)
    throw new Error('订单已更新，请刷新后重试')
  const active = Array.from(tasks.values()).filter(row => row.riderId === id && isInProgress(row)).length
  const issue = taskActionError(task, action, id, data.online, active, capacity, reason)
  if (issue)
    throw new Error(issue)
  if (action === 'grab') {
    task.riderId = id
    task.status = 'accepted'
    task.acceptAt = new Date().toISOString()
  }
  else {
    if (action === 'exception') {
      task.exception = reason.trim()
    }
    else {
      const transitions = { accept: ['assigned', 'accepted'], reject: ['assigned', 'pending'], pickup: ['accepted', 'delivering'], finish: ['delivering', 'done'], release: ['accepted', 'pending'] } as const
      const [from, to] = transitions[action]
      if (task.status !== from)
        throw new Error('当前订单状态不允许此操作')
      task.status = to
      task.assignmentExpiresAt = undefined
      if (to === 'pending')
        task.riderId = ''
      if (to === 'accepted')
        task.acceptAt = new Date().toISOString()
      if (to === 'delivering')
        task.pickedUpAt = new Date().toISOString()
      if (to === 'done') {
        task.deliveredAt = new Date().toISOString()
        task.settledAt = task.deliveredAt
      }
    }
  }
  task.version++
  task.statusText = RIDER_ORDER_STATUS[task.status].text
}
/**
 * 清空本模块的模拟数据；下一次读取重新创建样本。
 * 无参数。
 * @returns {void} 不影响真实登录会话
 * @example reset() // void；不影响真实登录会话
 */
export function reset() {
  accounts.clear()
  tasks.clear()
}
