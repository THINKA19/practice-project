import { expect, it, vi } from 'vitest'
import { requireCustomerSession } from '../composables/requireCustomer'

const state = vi.hoisted(() => ({ hasLogin: false, identity: null as string | null }))
const login = vi.hoisted(() => vi.fn())
vi.mock('@/store/token', () => ({ useTokenStore: () => ({ updateNowTime: () => state }) }))
vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: login }))
it('requires a verified customer session for customer operations', () => {
  state.hasLogin = false
  expect(requireCustomerSession()).toBe(false)
  state.hasLogin = true
  state.identity = 'shop'
  expect(requireCustomerSession()).toBe(false)
  state.identity = 'customer'
  expect(requireCustomerSession()).toBe(true)
  expect(login).toHaveBeenCalledTimes(2)
})
