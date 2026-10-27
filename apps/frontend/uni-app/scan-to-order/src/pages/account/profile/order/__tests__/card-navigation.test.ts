import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import OrderCard from '../components/OrderCard/index.vue'
import type { OrderCardVM } from '../components/OrderCard/types'

it('店名不跳转，状态和商品打开详情，支付独立触发', async () => {
  const card: OrderCardVM = {
    order: { id: 1, status: 0, amountReal: 10, dateAdd: '', orderNumber: '1', shopNameZt: '餐厅' },
    goods: [{ id: 1, goodsId: 1, goodsName: '汉堡', pic: '', number: 1, amount: 10 }],
    statusText: '待付款',
    typeText: '到店自取',
    statusClass: 'status-pending',
    showCallShop: false,
    showDelete: false,
    showCancel: true,
    showRefund: false,
    showPay: true,
  }
  const wrapper = mount(OrderCard, { props: { card }, global: { stubs: { 'wd-icon': true } } })
  await wrapper.find('.shop-name').trigger('tap')
  expect(wrapper.emitted('detail')).toBeUndefined()
  await wrapper.find('.order-status').trigger('tap')
  await wrapper.find('.goods-container').trigger('tap')
  expect(wrapper.emitted('detail')).toHaveLength(2)
  await wrapper.find('.btn-primary').trigger('tap')
  expect(wrapper.emitted('pay')).toHaveLength(1)
  expect(wrapper.emitted('detail')).toHaveLength(2)
  wrapper.unmount()
})
