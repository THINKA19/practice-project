import { beforeEach, expect, it, vi } from 'vitest'
import { getAuthorizationHeaders } from '../composables/use-authorization'

const state = vi.hoisted(() => ({ token: 'customer-token', identity: 'customer' }))
vi.mock('../composables/use-actions', () => ({ getToken: () => state.token, getIdentity: () => state.identity }))
beforeEach(() => Object.assign(state, { token: 'customer-token', identity: 'customer' }))

it('每次读取当前凭证，拒绝缺失凭证及不匹配的身份', () => {
  expect(getAuthorizationHeaders('customer')).toEqual({ Authorization: 'Bearer customer-token' })
  state.token = 'new-token'
  expect(getAuthorizationHeaders('customer')).toEqual({ Authorization: 'Bearer new-token' })
  state.identity = 'shop'
  expect(() => getAuthorizationHeaders('customer')).toThrow('顾客身份')
  expect(getAuthorizationHeaders('shop')).toEqual({ Authorization: 'Bearer new-token' })
  state.token = ''
  expect(() => getAuthorizationHeaders('shop')).toThrow('对应身份')
})
