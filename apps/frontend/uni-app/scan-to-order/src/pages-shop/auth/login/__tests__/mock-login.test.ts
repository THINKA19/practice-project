import { expect, it } from 'vitest'
import { login as shopLogin } from '../mock'
import { login as riderLogin } from '@/pages-rider/auth/login/mock'
import { mockCustomerOwner, sessionState } from '@/pages/auth/session/mock'

it('模拟商家和骑手账号不可混用，凭证各自绑定服务端身份', async () => {
  const shop = await shopLogin('shop', '123456')

  const rider = await riderLogin('rider', '123456')

  const token = (value: typeof shop) => 'token' in value ? value.token : value.accessToken

  expect(sessionState.profile(token(shop))?.identity).toBe('shop')
  expect(() => mockCustomerOwner(`Bearer ${token(shop)}`)).toThrow('不能访问顾客数据')

  expect(sessionState.profile(token(rider))?.identity).toBe('rider')

  await expect(shopLogin('rider', '123456')).rejects.toThrow()

  await expect(riderLogin('shop', '123456')).rejects.toThrow()
})
