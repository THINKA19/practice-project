/** 门店购物车回归：混合响应、切店迟到读取与按店清空，不依赖公共请求实现。 */
import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { cartApi, useCartStore } from '@/pages/ordering/menu-cart'
import { useShopStore } from '@/pages/ordering/index'

function mixed() {
  return {
    items: [
      { key: 'a', goodsId: 101, shopId: 1, name: 'A', pic: '', price: 28, number: 2 },
      { key: 'b', goodsId: 201, shopId: 2, name: 'B', pic: '', price: 12, number: 1 },
    ],
    number: 3,
    price: 68,
  }
}

beforeEach(() => {
  vi.restoreAllMocks()
  setActivePinia(createPinia())
})

it('只汇总当前门店，切到空店立即隐藏，返回原店重新读取其商品', async () => {
  vi.spyOn(cartApi, 'info').mockImplementation(async () => mixed())
  const shop = useShopStore()
  const cart = useCartStore()
  shop.setCurrent({ id: 1, name: 'A店' })
  await cart.refresh()
  expect(cart.items.map(item => item.key)).toEqual(['a'])
  expect([cart.totalNumber, cart.totalPrice]).toEqual([2, 56])
  shop.setCurrent({ id: 3, name: '空店' })
  expect(cart.totalNumber).toBe(0)
  await cart.refresh()
  expect(cart.items).toEqual([])
  expect(cart.totalPrice).toBe(0)
  shop.setCurrent({ id: 2, name: 'B店' })
  await cart.refresh()
  expect([cart.totalNumber, cart.totalPrice]).toEqual([1, 12])
  shop.setCurrent({ id: 1, name: 'A店' })
  await cart.refresh()
  expect([cart.totalNumber, cart.totalPrice]).toEqual([2, 56])
})

it('切店后的迟到读取不能恢复旧店商品', async () => {
  let resolve!: (value: ReturnType<typeof mixed>) => void
  vi.spyOn(cartApi, 'info').mockImplementationOnce(() => new Promise((done) => {
    resolve = done
  }))
  const shop = useShopStore()
  shop.setCurrent({ id: 1, name: 'A店' })
  const cart = useCartStore()
  const pending = cart.refresh()
  shop.setCurrent({ id: 2, name: 'B店' })
  resolve(mixed())
  await pending
  expect(cart.info).toBeNull()
})

it('结算读取失败保持报错，切店后不能修改旧店条目', async () => {
  const shop = useShopStore()
  shop.setCurrent({ id: 1, name: 'A店' })
  const cart = useCartStore()
  vi.spyOn(cartApi, 'info').mockRejectedValue(new Error('登录已失效'))
  await expect(cart.refresh(true)).rejects.toThrow('登录已失效')
  const modify = vi.spyOn(cartApi, 'modifyNumber')
  shop.setCurrent({ id: 2, name: 'B店' })
  await expect(cart.changeNumber('a', 2)).rejects.toThrow('当前门店')
  expect(modify).not.toHaveBeenCalled()
})

it('清空只删除当前店条目，不调用全车清空，也不删除其他店', async () => {
  const response = mixed()
  vi.spyOn(cartApi, 'info').mockImplementation(async () => response)
  const empty = vi.spyOn(cartApi, 'empty')
  const remove = vi.spyOn(cartApi, 'remove').mockImplementation(async (key) => {
    response.items = response.items.filter(item => item.key !== key)
    return response
  })
  const shop = useShopStore()
  shop.setCurrent({ id: 1, name: 'A店' })
  const cart = useCartStore()
  await cart.refresh()
  await cart.clear()
  expect(remove).toHaveBeenCalledExactlyOnceWith('a')
  expect(empty).not.toHaveBeenCalled()
  shop.setCurrent({ id: 2, name: 'B店' })
  await cart.refresh()
  expect(cart.items.map(item => item.key)).toEqual(['b'])
  expect(cart.totalPrice).toBe(12)
})
