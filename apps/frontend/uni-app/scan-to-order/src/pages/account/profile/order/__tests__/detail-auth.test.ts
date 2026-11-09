import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const m = vi.hoisted(() => ({ hide: (() => {}) as () => void, query: { id: '1' } as { id: string, submitted?: string }, show: (() => {}) as () => void, token: '', guard: vi.fn(), detail: vi.fn() }))
vi.mock('@dcloudio/uni-app', () => ({ onHide: (cb: () => void) => {
  m.hide = cb
}, onLoad: (cb: (q: { id: string, submitted?: string }) => void) => cb(m.query), onShow: (cb: () => void) => {
  m.show = cb
} }))
vi.mock('@/pages/auth/session', () => ({ getToken: () => m.token, getIdentity: () => m.token ? 'customer' : null, requireIdentity: m.guard, useSessionAccountScope: () => ({ ticket: () => 1, current: () => true }) }))
vi.mock('../composables/use-requests', () => ({ orderApi: { detail: m.detail } }))
beforeEach(() => {
  m.query = { id: '1' }
  m.token = ''
  m.guard.mockClear()
  m.detail.mockReset()
  vi.mocked(uni.showToast).mockClear()
})
afterEach(() => vi.unstubAllGlobals())
it('提交后加载真实订单再展示结果和下一步，失败重试不要求重复下单', async () => {
  vi.stubGlobal('definePage', vi.fn())
  m.query = { id: '1', submitted: '1' }
  m.token = 'customer-token'
  m.detail.mockRejectedValueOnce(new Error('offline'))
  const Page = (await import('../detail.vue')).default
  const wrapper = mount(Page)
  m.show()
  await flushPromises()
  expect(wrapper.text()).toContain('订单加载失败')
  expect(wrapper.text()).not.toContain('订单已提交')
  expect(uni.showToast).not.toHaveBeenCalled()
  m.detail.mockResolvedValue({ orderInfo: { id: 1, status: 0, orderNumber: 'ORDER-1', orderType: 'pickup', amountReal: 56, extJsonStr: JSON.stringify({ 结算方式: '现金结算' }) }, goods: [] })
  await wrapper.find('button').trigger('tap')
  await flushPromises()
  expect(wrapper.text()).toContain('订单已提交')
  expect(wrapper.text()).toContain('ORDER-1')
  expect(wrapper.text()).toContain('到店现金结算')
  expect(wrapper.text()).toContain('应付金额')
  expect(wrapper.text()).not.toContain('已付款')
  expect(uni.showToast).toHaveBeenCalledWith({ title: '下单成功，无需线上支付', icon: 'none', duration: 2500 })
  m.show()
  await flushPromises()
  expect(uni.showToast).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})
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
  expect(uni.showToast).not.toHaveBeenCalled()
  wrapper.unmount()
})

it('详情在后台加载完成不弹提示，返回后成功加载仅提示一次', async () => {
  vi.stubGlobal('definePage', vi.fn())
  m.query = { id: '1', submitted: '1' }
  m.token = 'customer-token'
  const result = { orderInfo: { id: 1, status: 0, orderType: 'delivery', amountReal: 56, extJsonStr: JSON.stringify({ 结算方式: '现金结算' }) }, goods: [] }
  let resolve!: (value: typeof result) => void
  m.detail.mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const Page = (await import('../detail.vue')).default
  const wrapper = mount(Page)
  m.show()
  m.hide()
  resolve(result)
  await flushPromises()
  expect(uni.showToast).not.toHaveBeenCalled()
  m.detail.mockResolvedValue(result)
  m.show()
  await flushPromises()
  expect(uni.showToast).toHaveBeenCalledWith({ title: '下单成功，无需线上支付', icon: 'none', duration: 2500 })
  wrapper.unmount()
})
