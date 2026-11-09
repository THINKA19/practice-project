import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CartBar from '../index.vue'
import type { CartBarProps } from '../types'

const props: CartBarProps = {
  number: 2,
  price: 56,
  checkingOut: false,
  opened: true,
  hasShop: true,
  currencySymbol: '₫',
  currencyUnit: '万',
  currencyName: '越南盾',
  cartText: '购物车',
  checkoutText: '去结算',
  selectShopText: '选择门店',
  closedText: '未营业',
}

describe('公共购物车底栏交互', () => {
  it('响应数量变化，空车与结算中拦截点击，恢复后允许再次结算', async () => {
    const wrapper = mount(CartBar, { props, global: { stubs: { 'wd-loading': true } } })
    await wrapper.get('.topay').trigger('tap')
    expect(wrapper.emitted('pay')).toHaveLength(1)
    await wrapper.setProps({ checkingOut: true })
    await wrapper.get('.topay').trigger('tap')
    await wrapper.get('.cart-entry').trigger('tap')
    expect(wrapper.emitted('pay')).toHaveLength(1)
    expect(wrapper.emitted('toggleCart')).toBeUndefined()
    await wrapper.setProps({ checkingOut: false, number: 0 })
    expect(wrapper.find('.badge').exists()).toBe(false)
    await wrapper.get('.topay').trigger('tap')
    expect(wrapper.emitted('pay')).toHaveLength(1)
    await wrapper.setProps({ number: 120 })
    expect(wrapper.get('.badge').text()).toBe('99+')
    await wrapper.get('.topay').trigger('tap')
    await wrapper.get('.cart-entry').trigger('tap')
    expect(wrapper.emitted('pay')).toHaveLength(2)
    expect(wrapper.emitted('toggleCart')).toHaveLength(1)
  })

  it('无门店时选择门店，未营业时禁止结算，展示数据响应更新', async () => {
    const wrapper = mount(CartBar, { props: { ...props, hasShop: false } })
    expect(wrapper.get('.topay').text()).toBe('选择门店')
    await wrapper.get('.topay').trigger('tap')
    expect(wrapper.emitted('getShop')).toHaveLength(1)
    expect(wrapper.emitted('pay')).toBeUndefined()
    await wrapper.setProps({ hasShop: true, opened: false })
    expect(wrapper.get('.topay').text()).toBe('未营业')
    await wrapper.get('.topay').trigger('tap')
    expect(wrapper.emitted('pay')).toBeUndefined()
    await wrapper.setProps({ opened: true, checkoutText: 'Checkout', price: 78 })
    expect(wrapper.get('.topay').text()).toBe('Checkout')
    expect(wrapper.get('.amount').text()).toContain('78')
  })
})
