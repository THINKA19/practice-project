import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'
import { useOrderingSkuPopup } from '../composables/use-sku-popup'
import type { GoodsDetail } from '../models/goods.types'
import type { AddCartResult } from '../composables/use-cart-bar'

vi.mock('../composables/use-locale', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))

it.each<AddCartResult>(['ok', 'failed', 'needLogin'])('规格加购结果为%s：等待期间防重复，仅成功关闭弹层', async (result) => {
  let finish!: (value: AddCartResult) => void
  const addToCart = vi.fn(() => new Promise<AddCartResult>((resolve) => {
    finish = resolve
  }))
  const onClose = vi.fn()
  const scope = effectScope()
  const sku = scope.run(() => useOrderingSkuPopup({ addToCart, onClose }))!
  try {
    sku.detail.value = { basicInfo: { id: 1, name: '测试餐品', minPrice: 28, stores: 10, minBuyNumber: 1 }, properties: [] } as unknown as GoodsDetail
    sku.open()
    const pending = sku.addToCart()
    expect(sku.submitting.value).toBe(true)
    await sku.addToCart()
    expect(addToCart).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
    finish(result)
    await pending
    expect(sku.submitting.value).toBe(false)
    expect(onClose).toHaveBeenCalledTimes(result === 'ok' ? 1 : 0)
  }
  finally {
    scope.stop()
  }
})
