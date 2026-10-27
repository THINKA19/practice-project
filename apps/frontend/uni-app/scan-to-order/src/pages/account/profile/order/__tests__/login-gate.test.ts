import { beforeEach, expect, it, vi } from 'vitest'
import { useOrderListPage } from '../composables/use-list-page'

const mocks = vi.hoisted(() => ({ token: '', guard: vi.fn(() => false), list: vi.fn() }))
vi.mock('@/pages/auth/session', () => ({
  getToken: () => mocks.token,
  getIdentity: () => mocks.token ? 'customer' : null,
  requireIdentity: mocks.guard,
  useSessionAccountScope: () => ({ ticket: () => 1, current: () => true }),
}))
vi.mock('../composables/use-requests', () => ({ orderApi: { list: mocks.list } }))
vi.mock('../composables/use-pay', () => ({ useOrderPay: () => ({}) }))
vi.mock('@/pages/routes', () => ({ ClientRoutes: { Account: {}, Ordering: {} } }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
vi.mock('@/utils/project/interaction', () => ({ confirm: vi.fn(), showError: vi.fn(), toast: vi.fn() }))

beforeEach(() => {
  mocks.token = ''
  mocks.guard.mockClear()
  mocks.list.mockReset().mockResolvedValue({ orderList: [], goodsMap: {} })
})

it('未登录进入及返回都不自动跳转，只有点击登录才引导', async () => {
  const vm = useOrderListPage()
  await vm.refresh()
  await vm.refresh()
  expect(vm.needsLogin.value).toBe(true)
  expect(vm.apiOk.value).toBe(false)
  expect(mocks.guard).not.toHaveBeenCalled()
  expect(mocks.list).not.toHaveBeenCalled()
  vm.login()
  expect(mocks.guard).toHaveBeenCalledTimes(1)
})

it('登录成功后才查询订单并允许展示空态', async () => {
  const vm = useOrderListPage()
  await vm.refresh()
  mocks.token = 'customer-token'
  await vm.refresh()
  expect(vm.needsLogin.value).toBe(false)
  expect(vm.apiOk.value).toBe(true)
  expect(mocks.list).toHaveBeenCalledTimes(1)
})
