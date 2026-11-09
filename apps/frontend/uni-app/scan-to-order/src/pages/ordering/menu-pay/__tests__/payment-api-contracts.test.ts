/** 验证支付请求只读取现有唯一会话，不接受测试页面的独立 token 状态。 */
import { beforeEach, expect, it, vi } from 'vitest'
import { paymentApi } from '../api/payment.api'
import { http } from '@/http/alova'

const session = vi.hoisted(() => ({ authorization: 'Bearer customer-a', allowed: true }))
vi.mock('@/pages/auth/session', async original => ({ ...await original<typeof import('@/pages/auth/session')>(), getAuthorizationHeaders: () => {
  if (!session.allowed)
    throw new Error('请先使用顾客身份登录')
  return { Authorization: session.authorization }
} }))
beforeEach(() => {
  vi.restoreAllMocks()
  session.allowed = true
  session.authorization = 'Bearer customer-a'
})
it('每次请求读取当前凭证，并保留调用方显式支付路径', async () => {
  const post = vi.spyOn(http, 'Post').mockResolvedValue({})
  await paymentApi.wxpay({ money: 12 }, '/configured/payment')
  expect(post).toHaveBeenLastCalledWith('/configured/payment', { money: 12 }, { cacheFor: 0, headers: { Authorization: 'Bearer customer-a' }, meta: { ignoreAuth: true } })
  session.authorization = 'Bearer customer-b'
  await paymentApi.wxpay({ money: 12 })
  expect(post).toHaveBeenLastCalledWith('/pay/wx/wxapp', { money: 12 }, { cacheFor: 0, headers: { Authorization: 'Bearer customer-b' }, meta: { ignoreAuth: true } })
})
it('身份不匹配时不会向请求客户端发送支付请求', () => {
  session.allowed = false
  const post = vi.spyOn(http, 'Post')
  expect(() => paymentApi.wxpay({ money: 12 })).toThrow('顾客身份')
  expect(() => paymentApi.payBill(12)).toThrow('顾客身份')
  expect(post).not.toHaveBeenCalled()
})
