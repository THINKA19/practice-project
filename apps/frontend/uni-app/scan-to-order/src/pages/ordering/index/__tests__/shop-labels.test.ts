/** 用户可见状态、活动规则和卡片收藏入口回归。 */
import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import ShopLabels from '../components/ShopLabels/index.vue'
import ShopCard from '../components/ShopCard/index.vue'
import ShopBusinessBadge from '../components/ShopBusinessBadge/index.vue'

const lifecycle = vi.hoisted(() => ({ hide: undefined as (() => void) | undefined, show: undefined as (() => void) | undefined }))
vi.mock('@dcloudio/uni-app', () => ({
  onHide: (callback: () => void) => {
    lifecycle.hide = callback
  },
  onShow: (callback: () => void) => {
    lifecycle.show = callback
  },
}))

it('即将开业可以同时有活动，查看活动说明时间和规则', async () => {
  const promotion = { id: 'opening', status: 'published' as const, startsAt: new Date(Date.now() + 86400000).toISOString(), endsAt: new Date(Date.now() + 172800000).toISOString(), applicableModes: ['堂食'], title: '开业优惠', summary: '指定套餐八折', period: '明日至后日', rules: '仅限到店' }
  const wrapper = mount(ShopLabels, { props: { shop: { id: 1, name: '筹备店', openingState: 'upcoming', openingDate: '2027-01-01', promotions: [promotion] } }, global: { stubs: { ShopActivityPanel: true } } })
  expect(wrapper.text()).toContain('即将开业')
  expect(wrapper.text()).toContain('2027-01-01')
  expect(wrapper.text()).toContain('暂不可下单')
  expect(wrapper.text()).toContain('开业优惠')
  expect(wrapper.text()).not.toContain('指定套餐八折')
  expect(wrapper.text()).not.toContain('堂食')
  expect(wrapper.text()).not.toContain('明日至后日')
  expect(wrapper.text()).not.toContain('查看活动')
  expect(wrapper.text()).not.toContain('即将开始')
  await wrapper.find('[role="button"]').trigger('tap')
  expect(uni.showModal).not.toHaveBeenCalled()
  expect(wrapper.findComponent({ name: 'ShopActivityPanel' }).exists()).toBe(true)
  lifecycle.hide?.()
  await wrapper.vm.$nextTick()
  expect(wrapper.findComponent({ name: 'ShopActivityPanel' }).exists()).toBe(false)
  lifecycle.show?.()
  await wrapper.setProps({ shop: { id: 2, name: '新店', openingState: 'new', newUntil: new Date(Date.now() + 86400000).toISOString() } })
  expect(wrapper.text()).not.toContain('新开业')
  expect(wrapper.text()).toBe('')
  expect(wrapper.find('[role="button"]').exists()).toBe(false)
  wrapper.unmount()
})

it('列表不重复状态和长提示，门店内保留简短不可下单说明', async () => {
  const wrapper = mount(ShopLabels, { props: { shop: { id: 1, name: '门店', businessState: 'open' }, showEnter: true }, global: { stubs: { ShopActivityPanel: true } } })
  expect(wrapper.text()).toBe('')
  await wrapper.setProps({ showEnter: false })
  expect(wrapper.text()).toBe('')
  for (const [businessState, label] of [['suspended', '暂停营业'], ['resting', '休息中']] as const) {
    await wrapper.setProps({ shop: { id: 1, name: '门店', businessState }, showEnter: true })
    expect(wrapper.text()).toBe('')
    await wrapper.setProps({ showEnter: false })
    expect(wrapper.text()).toBe(`${label}，暂不可下单`)
    expect(wrapper.find('[role="button"]').exists()).toBe(false)
  }
  wrapper.unmount()
})

it('列表状态位于店名旁，不展示收藏或长提示，未开业仍可进入', async () => {
  const wrapper = mount(ShopCard, { props: { shop: { id: 1, name: '筹备店', openingState: 'upcoming' }, nearest: false, selectText: '进入门店' }, global: { stubs: { 'wd-icon': true, 'ShopActivityPanel': true } } })
  expect(wrapper.find('.shop-name').element.parentElement?.parentElement?.textContent).toContain('即将开业')
  expect(wrapper.find('.business-badge').classes()).toContain('rounded-full')
  expect(wrapper.text()).not.toContain('收藏')
  expect(wrapper.text()).not.toContain('可浏览商品并加入购物车')
  expect(wrapper.find('.select-btn').text()).toBe('进入门店')
  await wrapper.find('.select-btn').trigger('tap')
  expect(wrapper.emitted('select')).toHaveLength(1)
  wrapper.unmount()
})

it('经营状态胶囊在列表省略正常营业，门店内可显示正常营业', async () => {
  const wrapper = mount(ShopBusinessBadge, { props: { shop: { id: 1, name: '门店', businessState: 'open' } } })
  expect(wrapper.text()).toBe('')
  await wrapper.setProps({ showOpen: true })
  expect(wrapper.text()).toBe('正常营业')
  await wrapper.setProps({ shop: { id: 1, name: '门店', businessState: 'suspended' } })
  expect(wrapper.text()).toBe('暂停营业')
  wrapper.unmount()
})

it('仅展示接口排序首项活动，点击传递对应活动编号', async () => {
  const item = { status: 'published' as const, startsAt: '2099-01-01', endsAt: '2099-01-07', summary: '优惠介绍', rules: '到店参加' }
  const wrapper = mount(ShopLabels, { props: { shop: { id: 1, name: '门店', promotions: [{ ...item, id: 'a', title: '活动一' }, { ...item, id: 'b', title: '活动二' }] } }, global: { stubs: { ShopActivityPanel: true } } })
  expect(wrapper.findAll('[role="button"]')).toHaveLength(1)
  expect(wrapper.text()).not.toContain('即将开始')
  expect(wrapper.text()).not.toContain('个活动')
  await wrapper.findAll('[role="button"]')[0].trigger('tap')
  expect(wrapper.findComponent({ name: 'ShopActivityPanel' }).props('activityId')).toBe('a')
  wrapper.unmount()
})
