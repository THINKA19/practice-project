import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import PayGoodsCard from '../components/PayGoodsCard/index.vue'
import CartPopup from '../../menu/components/cart/CartPopup/index.vue'

vi.mock('@/pages/ordering/index', () => ({ useOrderingCurrency: () => ({ countryCode: 'VN' }) }))
vi.mock('@/pages/ordering/menu-cart', async () => ({
  isCartItemShortage: () => false,
  describeCartItem: (await import('../../menu-cart/domain/cart.rules')).describeCartItem,
}))
vi.mock('@/pages/ordering/menu', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))
vi.mock('@/pages/ordering/menu/composables/use-locale', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))

const item = { key: 'one', goodsId: 1, shopId: 1, name: '招牌饭', price: 28, number: 1, pic: '/actual-food.jpg', sku: [], additions: [] }

it('结算清单使用商品接口图片，加载失败有占位，金额保持越南计价单位', async () => {
  const wrapper = mount(PayGoodsCard, { props: { goodsList: [item], totalNumber: 1, totalPrice: 28 } })
  expect(wrapper.find('image').attributes('src')).toBe(item.pic)
  expect(wrapper.text()).toContain('₫28万')
  await wrapper.find('image').trigger('error')
  expect(wrapper.text()).toContain('暂无图片')
  wrapper.unmount()
})

it('购物车弹层展示同一商品缩略图', () => {
  const wrapper = mount(CartPopup, { props: { show: true, items: [item], changingItems: {}, clearing: false, locked: false, clearBlocked: false }, global: { stubs: { 'wd-popup': { template: '<view><slot /></view>' }, 'wd-input-number': true } } })
  expect(wrapper.find('image').attributes('src')).toBe(item.pic)
  wrapper.unmount()
})

it('购物车与结算摘要一致，点击可核对完整选项，价格和数量位于同一操作行', async () => {
  const selected = { ...item, name: '很长的商品名称完整保留以便核对', sku: [{ optionValueName: '大份' }, { optionValueName: '微辣' }], additions: [{ name: '鸡蛋' }] }
  const showModal = vi.fn()
  vi.stubGlobal('uni', { showModal })
  try {
    const cart = mount(CartPopup, { props: { show: true, items: [selected], changingItems: {}, clearing: false, locked: false, clearBlocked: false }, global: { stubs: { 'wd-popup': { template: '<view><slot /></view>' }, 'wd-input-number': true } } })
    const pay = mount(PayGoodsCard, { props: { goodsList: [selected], totalNumber: 1, totalPrice: 28 } })
    expect(cart.find('.content').text()).toBe('大份·微辣·鸡蛋')
    expect(pay.find('.goods-specs').text()).toBe(cart.find('.content').text())
    expect(cart.find('.item-description .item-controls .price').exists()).toBe(true)
    expect(cart.find('.item-controls .stepper-box').exists()).toBe(true)
    await cart.find('.content').trigger('tap')
    await pay.find('.goods-name').trigger('tap')
    expect(showModal).toHaveBeenCalledTimes(2)
    expect(showModal).toHaveBeenLastCalledWith(expect.objectContaining({ content: `${selected.name}\n大份·微辣·鸡蛋`, showCancel: false }))
    cart.unmount()
    pay.unmount()
  }
  finally {
    vi.unstubAllGlobals()
  }
})
