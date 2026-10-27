import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'

const m = vi.hoisted(() => ({ show: (() => {}) as () => void, token: '', guard: vi.fn(), detail: vi.fn() }))
vi.mock('@dcloudio/uni-app', () => ({ onLoad: (cb: (q: { id: string }) => void) => cb({ id: '1' }), onShow: (cb: () => void) => {
  m.show = cb
} }))
vi.mock('@/pages/auth/session', () => ({ getToken: () => m.token, getIdentity: () => m.token ? 'customer' : null, requireIdentity: m.guard, useSessionAccountScope: () => ({ ticket: () => 1, current: () => true }) }))
vi.mock('../composables/use-requests', () => ({ orderApi: { detail: m.detail } }))
afterEach(() => vi.unstubAllGlobals())
it('详情取消登录返回不重复跳转，登录后才请求详情', async () => {
  vi.stubGlobal('definePage', vi.fn())
  const Page = (await import('../detail.vue')).default
  const wrapper = mount(Page)
  m.show()
  m.show()
  await flushPromises()
  expect(m.guard).toHaveBeenCalledTimes(1)
  expect(m.detail).not.toHaveBeenCalled()
  expect(wrapper.text()).toContain('登录后查看订单详情')
  m.token = 'customer-token'
  m.detail.mockResolvedValue({ orderInfo: { statusStr: '已完成', amountReal: 10 }, goods: [] })
  m.show()
  await flushPromises()
  expect(m.detail).toHaveBeenCalledTimes(1)
  expect(wrapper.text()).toContain('已完成')
  wrapper.unmount()
})
