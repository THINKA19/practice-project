import { beforeEach, expect, it } from 'vitest'
import { sessionState } from '@/pages/auth/session/mock'
import { act, reset, setOnline, snapshot } from '../mock'
import { validateSnapshot } from '../models/mappers'
import { riderDateKey, summarizeTasks } from '../domain/task.rules'

let authorization = ''
beforeEach(() => {
  reset()
  sessionState.reset()
  const token = sessionState.issue('rider')
  authorization = `Bearer ${'token' in token ? token.token : token.accessToken}`
})
it('演示接口完成上线、接单、取餐、送达，拒绝重复和越级状态', () => {
  const initial = validateSnapshot(snapshot(authorization))
  expect(initial.online).toBe(false)
  expect(initial.tasks).toHaveLength(24)
  expect(initial.tasks.every(task => task.riderId === initial.riderId && ['done', 'cancelled'].includes(task.status))).toBe(true)
  const timeZone = initial.serviceArea?.timeZone
  const today = riderDateKey(Date.now(), timeZone)
  expect(initial.tasks.some(task => riderDateKey(task.deliveredAt ?? task.cancelledAt!, timeZone).slice(0, 7) < today.slice(0, 7))).toBe(true)
  const stats = summarizeTasks(initial.tasks, Date.now(), initial.serviceArea)
  expect(stats).toMatchObject({ todayDone: 4, todayCancelled: 1, activeCount: 0 })
  expect(stats.todayIncome).toBeGreaterThan(0)
  expect(() => act(authorization, { id: 'cached-task', version: 1 }, 'accept', '')).toThrow('上线')
  setOnline(authorization, true)
  let data = validateSnapshot(snapshot(authorization))
  const order = data.tasks.find(task => task.status === 'pending')!
  expect(order.deliveryArea).toBeTruthy()
  expect(order.address).toBe('')
  expect(order.deliveryNote).toBeUndefined()
  expect(order.deliveryPoint).toBeUndefined()
  expect(data.tasks.find(task => task.status === 'assigned')?.address).toBe('')
  act(authorization, order, 'grab', '')
  data = snapshot(authorization)
  const accepted = data.tasks.find(task => task.id === order.id)!
  expect(accepted.address).toContain('801 室')
  expect(accepted.pickupNote).toBeTruthy()
  expect(accepted.deliveryNote).toBeUndefined()
  expect(() => act(authorization, accepted, 'finish', '')).toThrow('状态')
  act(authorization, accepted, 'pickup', '')
  const delivering = snapshot(authorization).tasks.find(task => task.id === order.id)!
  expect(delivering.pickedUpAt).toEqual(expect.any(String))
  expect(delivering.deliveryDistanceKm).toBeGreaterThan(0)
  expect(delivering.pickupNote).toBeUndefined()
  expect(delivering.deliveryNote).toBeTruthy()
  act(authorization, delivering, 'finish', '')
  const finished = snapshot(authorization).tasks.find(task => task.id === order.id)!
  expect(finished.status).toBe('done')
  expect(finished.deliveredAt).toEqual(expect.any(String))
  expect(finished.phone).toBe('')
  expect(finished.deliveryDistanceKm).toBeUndefined()
  expect(finished.deliveryNote).toBeUndefined()
  expect(() => act(authorization, order, 'finish', '')).toThrow('更新')
})
it('接受、拒绝指派和转单均保留版本规则，上限包含指派', () => {
  setOnline(authorization, true)
  const assigned = snapshot(authorization).tasks.find(task => task.status === 'assigned')!
  act(authorization, assigned, 'accept', '')
  act(authorization, snapshot(authorization).tasks.find(task => task.id === assigned.id)!, 'release', '')
  expect(snapshot(authorization).tasks.find(task => task.id === assigned.id)?.riderId).toBe('')
  const token = sessionState.issue('rider', false, 30002)
  const other = `Bearer ${'token' in token ? token.token : token.accessToken}`
  setOnline(other, true)
  expect(() => act(other, snapshot(authorization).tasks.find(task => task.status === 'pending')!, 'grab', '')).toThrow('服务范围')
})
it('拒绝非法金额、状态、日期与重复任务 ID', () => {
  setOnline(authorization, true)
  const data = snapshot(authorization)
  for (const patch of [{ deliveryFee: Number.NaN }, { status: 'unknown' }, { createdAt: 'not-date' }, { version: 0 }])
    expect(() => validateSnapshot({ ...data, tasks: [{ ...data.tasks[0], ...patch }] })).toThrow('数据无效')
  expect(() => validateSnapshot({ ...data, tasks: [data.tasks[0], data.tasks[0]] })).toThrow('数据无效')
})

it('共享大厅隔离跨城与跨国任务，并防止同区两个骑手重复抢单', () => {
  const issue = (id: number) => {
    const token = sessionState.issue('rider', false, id)
    return `Bearer ${'token' in token ? token.token : token.accessToken}`
  }
  const sameZone = issue(30003)
  const otherCity = issue(30004)
  const otherCountry = issue(30002)
  const noGrant = issue(30099)
  expect(snapshot(noGrant).serviceArea).toBeNull()
  expect(snapshot(noGrant).tasks).toEqual([])
  expect(() => setOnline(noGrant, true)).toThrow('尚未分配')
  expect(() => setOnline(authorization, true, { latitude: 13.78, longitude: 100.54 })).toThrow('服务区域')
  for (const account of [authorization, sameZone, otherCity, otherCountry])
    setOnline(account, true)
  const order = snapshot(authorization).tasks.find(task => task.status === 'pending')!
  expect(snapshot(sameZone).tasks.some(task => task.id === order.id)).toBe(true)
  for (const account of [otherCity, otherCountry]) {
    expect(snapshot(account).tasks.some(task => task.id === order.id)).toBe(false)
    expect(() => act(account, order, 'grab', '')).toThrow('服务范围')
  }
  act(sameZone, order, 'grab', '')
  expect(() => act(authorization, order, 'grab', '')).toThrow('更新')
  setOnline(sameZone, false)
  const owned = snapshot(sameZone).tasks.filter(task => task.id === order.id)
  expect(owned.map(task => task.status)).toEqual(['accepted'])
  act(sameZone, owned[0], 'pickup', '')
  act(sameZone, snapshot(sameZone).tasks.find(task => task.id === order.id)!, 'finish', '')
  expect(snapshot(sameZone).tasks.find(task => task.id === order.id)?.status).toBe('done')
  expect(snapshot(authorization).tasks.some(task => task.id === order.id || task.riderId === '30003')).toBe(false)
})

it('满载时保留已预留的指派名额，下线释放指派并跳过新任务视图', () => {
  const token = sessionState.issue('rider', false, 30003)
  const other = `Bearer ${'token' in token ? token.token : token.accessToken}`
  setOnline(authorization, true)
  setOnline(other, true)
  const pending = snapshot(authorization).tasks.filter(task => task.status === 'pending')
  expect(pending).toHaveLength(6)
  for (const task of pending.slice(0, 2))
    act(authorization, task, 'grab', '')
  expect(snapshot(authorization, false).tasks.filter(task => task.status === 'accepted')).toHaveLength(2)
  expect(snapshot(authorization, false).tasks.some(task => task.status === 'pending' || task.status === 'assigned')).toBe(false)
  setOnline(other, false)
  const pool = snapshot(authorization).tasks
  const extra = pool.find(task => task.status === 'pending')!
  const assigned = pool.find(task => task.status === 'assigned')!
  expect(() => act(authorization, extra, 'grab', '')).toThrow('上限')
  act(authorization, assigned, 'accept', '')
  expect(snapshot(authorization).tasks.filter(task => task.status === 'accepted')).toHaveLength(3)
})
