import { afterEach, expect, it, vi } from 'vitest'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())
it('真实 Alova 链路：买单模拟幂等、重算优惠，签到隔离且同日不重复', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { http } = await import('@/http/alova')
  const { resetAllMocks } = await import('@/mock')
  resetAllMocks()
  const { endpoints: bill } = await import('../api/endpoints')
  const { endpoints: sign } = await import('../../sign-in/api/endpoints')
  const a = { headers: { Authorization: 'Bearer wx-demo-session-a' }, cacheFor: 0 }
  const b = { headers: { Authorization: 'Bearer wx-demo-session-b' }, cacheFor: 0 }
  const first = await http.Post(bill.pay, { amountCents: 10000, requestId: 'same' }, a).send()
  expect(first).toMatchObject({ payableCents: 9000, demo: true })
  expect(await http.Post(bill.pay, { amountCents: 10000, requestId: 'same' }, a).send()).toEqual(first)
  await expect(http.Post(bill.pay, { amountCents: 5000, requestId: 'same' }, a).send()).rejects.toThrow()
  await http.Post(sign.sign, {}, a).send()
  await http.Post(sign.sign, {}, a).send()
  const logs = await http.Post<{ result: unknown[] }>(sign.signLogs, {}, a).send()
  expect(logs.result).toHaveLength(1)
  expect(await http.Post(sign.signLogs, {}, b).send()).toEqual({ result: [] })
  expect(uni.request).not.toHaveBeenCalled()
})
