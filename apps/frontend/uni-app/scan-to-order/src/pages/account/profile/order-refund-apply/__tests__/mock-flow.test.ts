import { afterEach, expect, it, vi } from 'vitest'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())
it('正式请求链可读取演示订单、申请售后、查询历史和撤销', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { seedSession } = await import('@/pages/auth/session/__tests__/fixtures')
  const session = seedSession()
  session.snapshot!.tokenInfo = { token: 'wx-demo-session-refund-flow', expiresIn: 3600 }
  const { orderApi } = await import('@/pages/account/profile/order')
  const detail = await orderApi.detail(1003)
  const goods = detail.goods![0]
  expect(goods.afterSale).toBeTruthy()
  expect(await orderApi.refundApplyDetail(1003)).toHaveLength(0)
  await orderApi.refundApply({ orderId: 1003, orderGoodsId: goods.id, type: '0', number: 1, reason: '质量问题' })
  expect(await orderApi.refundApplyDetail(1003)).toHaveLength(1)
  await orderApi.refundApplyCancel(1003, goods.id)
  expect((await orderApi.refundApplyDetail(1003))[0].baseInfo.status).toBe(-1)
  expect(uni.request).not.toHaveBeenCalled()
}, 15000)
