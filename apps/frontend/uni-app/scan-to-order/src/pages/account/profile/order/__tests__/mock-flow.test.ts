import { afterEach, expect, it, vi } from 'vitest'

let authorization = 'Bearer wx-demo-session-orders-a'
vi.mock('@/pages/auth/session', () => ({ AUTH_ROUTES: { customer: '/pages/auth/login/index' }, getAuthorizationHeaders: () => ({ Authorization: authorization }) }))
vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())

it('通过正式请求链完成订单查询、取消、删除、账户隔离及进行中订单保护', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { orderApi } = await import('../composables/use-requests')
  const { reset } = await import('../mock/entry.mock')
  reset()
  const before = await orderApi.list({})
  expect(before.orderList).toHaveLength(7)
  expect(before.goodsMap['1001']).toHaveLength(3)
  expect(new Set(before.orderList.map(row => row.orderType)).size).toBe(4)
  expect((await orderApi.detail(1001)).goods).toEqual(before.goodsMap['1001'])
  expect((await orderApi.detail(1001)).orderInfo.status).toBe(0)
  await expect(orderApi.remove(1001)).rejects.toThrow()
  await orderApi.close(1001)
  expect((await orderApi.detail(1001)).orderInfo.status).toBe(-1)
  await orderApi.remove(1001)
  authorization = 'Bearer wx-demo-session-orders-b'
  expect((await orderApi.list({})).orderList).toHaveLength(7)
  authorization = 'Bearer wx-demo-session-orders-a'
  await orderApi.remove(1003)
  await orderApi.remove(1004)
  await orderApi.close(1002)
  await orderApi.remove(1002)
  for (const id of [1005, 1006, 1007]) {
    await expect(orderApi.remove(id)).rejects.toThrow()
    await expect(orderApi.close(id)).rejects.toThrow()
  }
  expect((await orderApi.list({})).orderList.map(row => row.id)).toEqual([1005, 1006, 1007])
  await orderApi.demoAction(1005, 'refund')
  expect((await orderApi.detail(1005)).orderInfo.refundStatus).toBe(1)
  await expect(orderApi.demoAction(1005, 'refund')).rejects.toThrow()
  authorization = 'Bearer wx-demo-session-orders-b'
  await orderApi.demoAction(1001, 'pay')
  expect((await orderApi.detail(1001)).orderInfo.isPay).toBe(true)
  await expect(orderApi.demoAction(1001, 'pay')).rejects.toThrow()
  authorization = 'Bearer wx-demo-session-orders-a'
  expect((await orderApi.detail(1005)).orderInfo.refundStatus).toBe(1)
  vi.stubEnv('VITE_USE_MOCK', 'false')
  await expect(orderApi.demoAction(1005, 'pay')).rejects.toThrow('仅开发 Mock')
  expect(uni.request).not.toHaveBeenCalled()
}, 15000)
