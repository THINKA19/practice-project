import { describe, expect, it } from 'vitest'
import { quickAddNumber } from '@/pages/ordering/menu-cart'

describe('cart', () => {
  it('已在购物车则+1，否则按起购量', () => {
    const cart = { items: [{ key: 'k', goodsId: 1, name: '', pic: '', price: 1, number: 1 }], number: 1, price: 1 }

    expect(quickAddNumber(cart, 1, 3)).toBe(1)

    expect(quickAddNumber(cart, 2, 3)).toBe(3)

    expect(quickAddNumber(null, 2, 0)).toBe(1)
  })
})
