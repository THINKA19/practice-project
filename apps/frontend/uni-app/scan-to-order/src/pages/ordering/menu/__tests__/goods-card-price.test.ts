import { setLocale } from '@/locale'
import { useShopStore } from '@/pages/ordering/index'
import { shallowMount } from '@vue/test-utils'
import { computed, nextTick } from 'vue'
import { expect, it, vi } from 'vitest'
import GoodsCard from '../components/catalog/GoodsList/parts/GoodsCard.vue'
import type { Goods } from '../models/goods.types'
import { createGoodsDetail, goods } from '../mock/fixtures/goods'

vi.mock('@/pages/ordering/menu/index', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))
vi.stubGlobal('computed', computed)

it.each([
  [32, true],
  [0, false],
  [28, false],
  [20, false],
  [undefined, false],
])('售价28，原价%s时划线原价的展示为%s', (originalPrice, visible) => {
  const wrapper = shallowMount(GoodsCard, {
    props: {
      goods: { id: 1, name: '商品', minPrice: 28, originalPrice } as Goods,
      action: 'add',
      countdown: null,
      badge: 0,
    },
  })
  expect(wrapper.find('.price').text()).toContain('28')
  expect(wrapper.find('.origin-price').exists()).toBe(visible)
  wrapper.unmount()
})

it('示例商品以正价为主，少数有优惠，详情价格与列表一致', () => {
  const discounted = goods.filter(item => item.originalPrice > item.minPrice)
  expect(discounted.length).toBeGreaterThan(0)
  expect(discounted.length).toBeLessThan(goods.length / 2)
  for (const item of goods) {
    expect(createGoodsDetail(item.id)?.basicInfo.originalPrice).toBe(item.originalPrice)
  }
})

it('国家切换同步更新售价与原价货币，金额保持不变', async () => {
  setLocale('zh-Hans')
  const shop = useShopStore()
  const wrapper = shallowMount(GoodsCard, {
    props: { goods: { id: 1, name: '商品', minPrice: 2.28, originalPrice: 3.2 } as Goods, action: 'add', countdown: null, badge: 0 },
  })
  for (const [countryCode, prefix, suffix] of [['VN', '₫', '万'], ['LA', '₭', '万'], ['TH', '฿', ''], ['CN', '¥', ''], ['XX', '', '']]) {
    shop.setCurrent({ id: 1, name: '门店', countryCode })
    await nextTick()
    expect(wrapper.find('.price').text()).toBe(`${prefix}2.28${suffix}`)
    expect(wrapper.find('.origin-price').text()).toBe(`${prefix}3.2${suffix}`)
  }
  shop.setCurrent(null)
  wrapper.unmount()
})
