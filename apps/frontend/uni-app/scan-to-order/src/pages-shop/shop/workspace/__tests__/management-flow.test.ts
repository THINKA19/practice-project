import { beforeEach, expect, it } from 'vitest'
import { summary as orderCenterSummary } from '@/pages-shop/order/index/mock'
import { parseOrderCenterSummary } from '@/pages-shop/order/index/models/summary'
import { login } from '@/pages-shop/auth/login/mock'
import { shops } from '@/pages-shop/auth/permissions/mock'
import { endpoints as goods } from '@/pages-shop/goods/index/api/endpoints'
import { handle as goodsRequest } from '@/pages-shop/goods/index/mock'
import { endpoints as statistics } from '@/pages-shop/statistics/index/api/endpoints'
import { handle as report } from '@/pages-shop/statistics/index/mock'
import { endpoints as settings } from '@/pages-shop/shop/index/api/endpoints'
import { handle as settingsRequest } from '@/pages-shop/shop/index/mock'
import type { ShopSettingsForm } from '@/pages-shop/shop/index/models/index'
import { endpoints as staff } from '@/pages-shop/staff/index/api/endpoints'
import { acceptInvite, reset as resetStaff, handle as staffRequest } from '@/pages-shop/staff/index/mock'
import { endpoints as delivery } from '@/pages-shop/delivery/index/api/endpoints'
import { handle as deliveryRequest } from '@/pages-shop/delivery/index/mock'
import { endpoints as order } from '@/pages-shop/order/detail/api/endpoints'
import { endpoints as orderList } from '@/pages-shop/order/list/api/endpoints'
import { getOrderRecord, handle as listRequest, orders, reset as resetOrders } from '@/pages-shop/order/list/mock'
import { handle as orderRequest } from '@/pages-shop/order/detail/mock'
import { endpoints as table } from '@/pages-shop/table/index/api/endpoints'
import { handle as tableRequest } from '@/pages-shop/table/index/mock'
import { groupTables } from '@/pages-shop/table/index/models'
import { list as listBookings, update as updateBooking } from '@/pages-shop/order/list/mock/bookings'
import { endpoints as workspace } from '../api/endpoints'
import { handle as dashboard } from '../mock'

beforeEach(() => {
  resetStaff()
  resetOrders()
})

async function token(username: string) {
  const credentials = await login(username, '123456')
  return 'token' in credentials ? credentials.token : credentials.accessToken
}

it('updates the order center summary from shop records and rejects other shops', async () => {
  const owner = await token('shop')
  const employee = await token('shop-staff')
  const shopId = 'A'
  const before = orderCenterSummary(owner, shopId)
  const pending = orders(owner, shopId).find(order => order.status === 1)!

  expect(parseOrderCenterSummary(before, shopId)).toContainEqual({
    category: 'dine-in',
    status: 'awaitingAcceptance',
    count: orders(owner, shopId).filter(item => item.type === '堂食' && item.status === 1).length,
  })
  orderRequest(order.action, { shopId, id: pending.id, version: pending.version, action: 'accept' }, owner)
  expect(orderCenterSummary(owner, shopId).items).toContainEqual({
    category: 'dine-in',
    status: 'awaitingAcceptance',
    count: before.items.find(item => item.category === 'dine-in' && item.status === 'awaitingAcceptance')!.count - 1,
  })
  expect(orderCenterSummary(employee, shopId).items.some(item => item.category === 'cashier')).toBe(false)
  expect(() => orderCenterSummary(employee, 'B')).toThrow()
  expect(() => parseOrderCenterSummary(before, 'B')).toThrow()
})

it('邀请、变更权限和移除员工立即反映到对应门店授权', async () => {
  const owner = await token('shop')
  const employee = await token('shop-staff')
  const shop = { shopId: 'A' }
  expect(shops(employee).map(store => store.id)).toEqual(['A'])
  expect(() => tableRequest(table.list, { shopId: 'B' }, employee)).toThrow()
  const branch = { shopId: 'B' }
  const { code } = staffRequest(staff.invite, branch, owner) as { code: string }
  acceptInvite(employee, code)
  expect(() => acceptInvite(employee, code)).toThrow()
  expect(shops(employee).map(store => store.id)).toEqual(['A', 'B'])
  expect(() => goodsRequest(goods.list, shop, employee)).toThrow()
  expect(() => report(statistics.overview, { ...shop, period: 0 }, employee)).toThrow()
  expect(() => staffRequest(staff.list, shop, employee)).toThrow()
  expect(tableRequest(table.list, shop, employee)).toEqual(tableRequest(table.list, shop, owner))
  const member = { ...shop, id: '20002', version: 1 }
  expect(() => staffRequest(staff.update, { ...member, permissions: '["statistics.read"]', enabled: true }, owner)).toThrow()
  staffRequest(staff.update, { ...member, permissions: '["order.read","delivery.read"]', enabled: true }, owner)
  expect(() => tableRequest(table.list, shop, employee)).toThrow()
  expect(deliveryRequest(delivery.list, shop, employee)).toMatchObject({ tasks: expect.any(Array) })
  staffRequest(staff.remove, { ...member, version: 2 }, owner)
  expect(shops(employee).map(store => store.id)).toEqual(['B'])
  staffRequest(staff.update, { ...member, shopId: 'B', permissions: '["order.read"]', enabled: false }, owner)
  expect(shops(employee)).toEqual([])
  expect(() => orders(employee, 'B')).toThrow()
  await expect(token('shop-staff')).rejects.toThrow('停用')
})

it('员工订单响应省去金额，已完成订单不能从详情链接访问', async () => {
  const owner = await token('shop')
  const employee = await token('shop-staff')
  const shopId = 'A'
  const pending = orders(employee, shopId).find(item => item.status === 1)!
  const request = { shopId, id: pending.id }
  expect(orders(owner, shopId).find(item => item.id === pending.id)?.amount).toBe(28)
  expect(pending).not.toHaveProperty('amount')
  expect(pending.goods[0]).not.toHaveProperty('price')
  expect(orderRequest(order.detail, request, employee)).not.toHaveProperty('amount')
  expect(dashboard(workspace.dashboard, { shopId }, employee)).not.toHaveProperty('today.revenue')
  expect(() => orderRequest(order.print, request, employee)).toThrow()

  const pickup = orders(employee, shopId).find(item => item.type === '自取')!
  const preparing = orderRequest(order.action, { shopId, id: pickup.id, version: pickup.version, action: 'prepare' }, employee)
  expect(preparing).not.toHaveProperty('amount')
  const verification = { shopId, id: pickup.id, version: pickup.version + 1, action: 'pickup' }
  expect(() => orderRequest(order.action, { ...verification, verificationCode: '0000' }, employee)).toThrow('核销码错误')
  orderRequest(order.action, { ...verification, verificationCode: '6142' }, employee)
  expect(() => orderRequest(order.action, { ...verification, verificationCode: '6142' }, employee)).toThrow()
  expect(orders(employee, shopId).some(item => item.id === pickup.id)).toBe(false)
  expect(() => orderRequest(order.detail, { shopId, id: pickup.id }, employee)).toThrow()
  expect(orderRequest(order.detail, { shopId, id: pickup.id }, owner)).toMatchObject({ status: 4, amount: 28 })
})

it('门店操作更新各业务列表及工作台，分店数据独立', async () => {
  const owner = await token('shop')
  const shop = { shopId: 'A' }
  goodsRequest(goods.action, { ...shop, id: 1, version: 1, action: 'stock', value: 17 }, owner)
  expect(goodsRequest(goods.list, shop, owner)).toContainEqual(expect.objectContaining({ id: 1, stock: 17 }))
  expect(goodsRequest(goods.list, { shopId: 'B' }, owner)).toContainEqual(expect.objectContaining({ id: 1, stock: 100 }))

  const beforePending = orders(owner, 'A').filter(item => item.status === 1).length
  const beforeToday = report(statistics.overview, { ...shop, period: 0 }, owner)
  const pending = orders(owner, 'A').find(item => item.status === 1)!
  orderRequest(order.action, { ...shop, id: pending.id, version: pending.version, action: 'accept' }, owner)
  expect(orderRequest(order.detail, { ...shop, id: pending.id }, owner)).toMatchObject({ status: 2 })
  expect(listRequest(orderList.list, shop, owner)).toContainEqual(expect.objectContaining({ id: pending.id, status: 2, version: pending.version + 1 }))
  expect(dashboard(workspace.dashboard, shop, owner)).toMatchObject({ pendingCount: beforePending - 1 })

  expect(tableRequest(table.list, shop, owner)).toHaveLength(80)
  expect(tableRequest(table.list, { shopId: 'B' }, owner)).toHaveLength(48)

  const { tasks: [task], riders: [rider] } = deliveryRequest(delivery.list, shop, owner) as { tasks: { id: string, version: number }[], riders: { id: string }[] }
  expect(deliveryRequest(delivery.dispatch, { ...shop, id: task.id, version: task.version, riderId: rider.id }, owner)).toMatchObject({ status: 'assigned' })
  expect(deliveryRequest(delivery.withdraw, { ...shop, id: task.id, version: task.version + 1 }, owner)).toMatchObject({ status: 'pending' })

  const current = settingsRequest(settings.settings, shop, owner) as { version: number, form: ShopSettingsForm }
  settingsRequest(settings.save, { ...shop, version: current.version, form: JSON.stringify({ ...current.form, shopName: '中心测试店', businessStatus: false, soundNotify: false }) }, owner)
  expect(dashboard(workspace.dashboard, shop, owner)).toMatchObject({ shopName: '中心测试店', open: false })
  expect(shops(owner).find(store => store.id === shop.shopId)?.soundNotify).toBe(false)
  const summary = report(statistics.overview, { ...shop, period: 0 }, owner)
  expect(summary.overview.orderCount).toBeGreaterThan(10)
  expect(summary.overview.orderCount).toBe(beforeToday.overview.orderCount)
  expect(summary.topGoods).toEqual(beforeToday.topGoods)
  expect(summary.topGoods).toHaveLength(10)
})

it('按门店汇总每日历史，并用商品 ID 排序取前五', async () => {
  const owner = await token('shop')
  const shopId = 'A'
  const [first, second] = orders(owner, shopId)
  const { record: historical } = getOrderRecord(owner, shopId, first.id)
  const { record: recent } = getOrderRecord(owner, shopId, second.id)
  historical.createdAt = '2020-01-02T00:30:00.000Z'
  historical.goods = Array.from({ length: 6 }, (_, index) => ({
    productId: index,
    name: '同名商品',
    qty: 200 + index,
  }))
  recent.goods = [{ productId: 0, name: '改名商品', qty: 10 }]

  const all = report(statistics.overview, { shopId, period: 3 }, owner)
  const today = report(statistics.overview, { shopId, period: 0 }, owner)
  const month = report(statistics.overview, { shopId, period: 4 }, owner)
  const last30 = report(statistics.overview, { shopId, period: 2 }, owner)
  expect(all.range?.start).toBe('2020-01-02')
  expect(all.trend[0]).toEqual({ day: '2020-01-02', value: historical.amount })
  expect(all.trend.reduce((sum, point) => sum + point.value, 0)).toBe(Number(all.overview.revenue))
  expect(all.topGoods.slice(0, 6).map(item => item.sold)).toEqual([210, 205, 204, 203, 202, 201])
  expect(all.topGoods).toHaveLength(10)
  expect(month.range?.start).toBe(`${month.range?.end.slice(0, 7)}-01`)
  expect(new Date(Date.parse(month.range!.end) + 86_400_000).toISOString().slice(0, 7)).toBe(today.range?.end.slice(0, 7))
  expect(month.trend).toHaveLength(Number(month.range?.end.slice(-2)))
  expect(last30.trend).toHaveLength(30)
  expect(last30.trend.some(point => point.value === 0)).toBe(true)
  expect(month.finance?.pendingAmount).toBe(today.finance?.pendingAmount)
  expect(today.finance?.receivedAmount).toBeGreaterThan(0)
  expect(today.finance?.refundedAmount).toBeGreaterThan(0)
  expect(today.trend).toEqual([{ day: today.range?.end, value: Number(today.overview.revenue) }])
  expect(all.overview.unitsSold).toBeGreaterThan(today.overview.unitsSold!)
  expect(all.overview.completedCount).toBeGreaterThan(0)
  expect(all.overview.cancelledCount).toBeGreaterThan(0)
  expect(today.topGoods.some(item => item.sold >= 200)).toBe(false)
  expect(report(statistics.overview, { shopId: 'B', period: 3 }, owner).range?.start).not.toBe('2020-01-02')
})

it('预约和收银动作按门店、权限和版本校验', async () => {
  const owner = await token('shop')
  const employee = await token('shop-staff')
  const shopId = 'A'
  const [booking] = listBookings(owner, shopId)
  expect(() => listBookings(employee, shopId)).toThrow()
  const confirmBooking = { shopId, id: booking.id, version: booking.version, action: 'confirm' } as const
  expect(() => updateBooking(owner, { ...confirmBooking, shopId: 'B' })).toThrow()
  expect(updateBooking(owner, confirmBooking)).toMatchObject({ status: 'confirmed' })
  expect(() => updateBooking(owner, confirmBooking)).toThrow()
  expect(updateBooking(owner, { ...confirmBooking, version: booking.version + 1, action: 'complete' })).toMatchObject({ status: 'completed' })

  const cashOrder = orders(owner, shopId).find(item => item.cashier)!
  const collect = { shopId, id: cashOrder.id, version: cashOrder.version, action: 'collect' }
  expect(() => orderRequest(order.action, collect, employee)).toThrow()
  orderRequest(order.action, collect, owner)
  expect(() => orderRequest(order.action, collect, owner)).toThrow()
  expect(orders(owner, shopId).find(item => item.id === cashOrder.id)).toMatchObject({ paymentStatus: 'paid', status: cashOrder.status })
})

it('员工可测试本店新单播报，事件不会进入其他门店', async () => {
  const owner = await token('shop')
  const employee = await token('shop-staff')
  const shop = { shopId: 'A' }
  const branch = { shopId: 'B' }
  const first = settingsRequest(settings.events, shop, employee) as { cursor: number }
  const other = settingsRequest(settings.events, branch, owner) as { cursor: number }
  const before = dashboard(workspace.dashboard, shop, owner) as { pendingCount: number }

  expect(() => dashboard(workspace.demoOrder, branch, employee)).toThrow()
  const order = dashboard(workspace.demoOrder, shop, employee) as { id: string }
  expect(order).not.toHaveProperty('amount')

  expect(settingsRequest(settings.events, { ...shop, after: first.cursor }, employee)).toMatchObject({
    events: [{ kind: 'new-order', shopId: 'A', orderId: order.id }],
  })
  expect(settingsRequest(settings.events, { ...branch, after: other.cursor }, owner)).toMatchObject({ events: [] })
  expect(dashboard(workspace.dashboard, shop, owner)).toMatchObject({ pendingCount: before.pendingCount + 1 })
})

it('店铺只能对已有商品修改售价或库存', async () => {
  const owner = await token('shop')
  const shop = { shopId: 'B' }
  const initial = goodsRequest(goods.list, shop, owner)
  expect(initial).toHaveLength(25)

  const target = { ...shop, id: 1, version: 1 }
  const operations = { price: 29.5 }
  expect(() => goodsRequest(goods.save, { ...target, id: 0, form: JSON.stringify(operations) }, owner)).toThrow('商品不存在')
  expect(() => goodsRequest(goods.save, {
    ...target,
    form: JSON.stringify({ ...operations, originPrice: 33 }),
  }, owner)).toThrow('商品字段无效')
  expect(goodsRequest(goods.save, { ...target, form: JSON.stringify(operations) }, owner)).toMatchObject({
    ...operations,
    name: '招牌套餐',
    originPrice: 32,
    stock: 100,
    version: 2,
  })
  expect(() => goodsRequest(goods.save, { ...target, form: JSON.stringify(operations) }, owner)).toThrow('商品已更新')
  const current = { ...target, version: 2 }
  expect(() => goodsRequest(goods.action, { ...current, action: 'status', value: 0 }, owner)).toThrow('商品操作参数无效')
  expect(goodsRequest(goods.action, { ...current, action: 'stock', value: 0 }, owner)).toMatchObject({ stock: 0, price: 29.5 })
  expect(goodsRequest(goods.list, shop, owner)).toHaveLength(25)
})

it('桌台按容量排序，正确区分空桌、部分入座和满座', async () => {
  const owner = await token('shop')
  const center = tableRequest(table.list, { shopId: 'A' }, owner)
  const [other] = tableRequest(table.list, { shopId: 'B' }, owner)
  const [first] = center
  const groups = groupTables([
    ...center.slice(1).reverse(),
    first,
    { ...first, id: 'disabled', enabled: false },
    other,
  ], 'A')

  expect(groups.map(group => [group.seats, group.tables.length])).toEqual([[2, 18], [4, 16], [6, 12], [8, 10], [10, 12], [12, 12]])
  expect(groups[0].tables.slice(0, 4)).toMatchObject([
    { no: 'A01', occupancy: 'vacant', occupiedSeats: 0, remainingSeats: 2 },
    { no: 'A02', occupancy: 'occupied', occupiedSeats: 1, remainingSeats: 1 },
    { no: 'A03', occupancy: 'occupied', full: true, remainingSeats: 0 },
    { no: 'A04', occupancy: 'unknown', occupiedSeats: null, remainingSeats: null },
  ])
  expect(groups[0].tables[1].seatPositions).toEqual([
    { code: '1', occupied: false },
    { code: '2', occupied: true },
  ])
  expect(groupTables([{ ...first, occupiedSeats: 1 }], 'A')[0].tables[0]).toMatchObject({
    occupiedSeats: 1,
    remainingSeats: 1,
    seatPositions: [],
  })
  expect(groups[1].tables[4]).toMatchObject({ seats: 4, occupiedSeats: 2, remainingSeats: 2 })
  expect(groupTables([{ ...first, occupiedSeats: 5 }], 'A')[0].tables[0]).toMatchObject({ occupancy: 'unknown', remainingSeats: null })
  expect(groupTables([{ ...first, seats: undefined, occupiedSeats: undefined, seatPositions: undefined, occupancy: 'occupied' }], 'A')[0]).toMatchObject({
    seats: null,
    tables: [{ occupancy: 'occupied', remainingSeats: null }],
  })
})
