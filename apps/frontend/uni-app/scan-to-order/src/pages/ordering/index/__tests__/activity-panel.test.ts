/** 活动面板刷新、过期和关闭后的迟到响应回归。 */
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import ShopActivityPanel from '../components/ShopActivityPanel/index.vue'
import type { Shop } from '../models/types'

const api = vi.hoisted(() => ({ detail: vi.fn() }))
vi.mock('../api/shop.api', () => ({ shopApi: api }))
const now = Date.parse('2026-11-01T10:00:00+07:00')
const activity = { id: 'a', status: 'published' as const, startsAt: '2026-11-01T09:00:00+07:00', endsAt: '2026-11-01T10:00:30+07:00', applicableModes: ['堂食'], title: '开业优惠', summary: '双人套餐八折', period: '11月1日 09:00 至 10:00:30', rules: '不可与其他优惠叠加' }
const shop: Shop = { id: 1, name: '福记饭店', promotions: [activity, { ...activity, id: 'b', title: '会员套餐优惠' }] }
const wrappers: ReturnType<typeof mount>[] = []
function panel() {
  const wrapper = mount(ShopActivityPanel, { props: { modelValue: true, shopId: 1, shopName: shop.name, showEnter: true }, global: { stubs: { WdPopup: { template: '<view><slot /></view>' } } } })
  wrappers.push(wrapper)
  return wrapper
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  api.detail.mockReset().mockResolvedValue({ info: shop })
})
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  vi.useRealTimers()
})

it('底部面板仅展示日期、简介与活动说明，进入时重新确认数据', async () => {
  const wrapper = panel()
  await flushPromises()
  expect(wrapper.text()).not.toContain('会员套餐优惠')
  expect(wrapper.text()).toContain('不可与其他优惠叠加')
  expect(wrapper.text()).toContain('活动说明')
  expect(wrapper.text()).toContain('11月1日—11月1日')
  expect(wrapper.text()).not.toContain('到店现金结算')
  expect(wrapper.text()).not.toContain('双人套餐八折')
  expect(wrapper.find('text.text-30rpx').classes()).toContain('text-[#8b4513]')
  expect(wrapper.text()).not.toContain('适用方式：')
  expect(wrapper.text()).not.toContain('09:00')
  expect(wrapper.text()).not.toContain('进行中')
  await wrapper.findAll('button').find(button => button.text() === '进入门店')!.trigger('tap')
  await flushPromises()
  expect(api.detail).toHaveBeenCalledTimes(2)
  expect(wrapper.emitted('enter')?.[0]?.[0]).toMatchObject({ id: 1 })
  expect(uni.showModal).not.toHaveBeenCalled()
})

it('开业预告可进入浏览，刷新后过期活动移除', async () => {
  api.detail.mockResolvedValue({ info: { ...shop, openingState: 'upcoming', openingDate: '2026-11-03' } })
  const wrapper = panel()
  await flushPromises()
  expect(wrapper.text()).toContain('开业后可点餐')
  const action = wrapper.findAll('button').find(button => button.text() === '进入门店')!
  expect(action.attributes('disabled')).toBeUndefined()
  vi.setSystemTime(Date.parse('2026-11-02T00:00:00+07:00'))
  await vi.advanceTimersByTimeAsync(30000)
  await flushPromises()
  expect(wrapper.text()).toContain('活动已结束或已下架')
  expect(wrapper.emitted('enter')).toBeUndefined()
})

it('失败可重试，进入时发现撤回则不进入，关闭后旧请求不回写', async () => {
  api.detail.mockRejectedValueOnce(new Error('offline'))
  const wrapper = panel()
  await flushPromises()
  expect(wrapper.text()).toContain('加载失败')
  await wrapper.findAll('button').find(button => button.text() === '重新加载')!.trigger('tap')
  await flushPromises()
  api.detail.mockResolvedValueOnce({ info: { ...shop, promotions: [] } })
  await wrapper.findAll('button').find(button => button.text() === '进入门店')!.trigger('tap')
  await flushPromises()
  expect(wrapper.emitted('enter')).toBeUndefined()
  let finish!: (value: unknown) => void
  api.detail.mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  await wrapper.setProps({ shopId: 2 })
  await wrapper.setProps({ modelValue: false })
  finish({ info: { ...shop, id: 2 } })
  await flushPromises()
  expect(wrapper.text()).not.toContain('会员套餐优惠')
})

it('指定活动入口仅展示选中的活动，未来日期可提前宣传', async () => {
  api.detail.mockResolvedValue({ info: { ...shop, promotions: [activity, { ...activity, id: 'b', title: '未来套餐', startsAt: '2026-11-08', endsAt: '2026-11-15' }] } })
  const wrapper = panel()
  await wrapper.setProps({ activityId: 'b' })
  await flushPromises()
  expect(wrapper.text()).toContain('未来套餐')
  expect(wrapper.text()).toContain('11月8日—11月15日')
  expect(wrapper.text()).not.toContain('开业优惠')
  expect(wrapper.text()).not.toContain('即将开始')
})
