import type { GoodsDetail } from '../models/goods.types'
import { describe, expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'
import { catalogApi } from '../api/catalog.api'
import { useOrderingSkuSelection } from '../composables/use-sku-selection'

vi.mock('../api/catalog.api', () => ({ catalogApi: { goodsPrice: vi.fn() } }))

function goods(): GoodsDetail {
  return {
    basicInfo: { id: 101, name: '牛肉面', pic: '', minPrice: 18, originalPrice: 20, minScore: 0, stores: 9, minBuyNumber: 1 },
    properties: [{ id: 1, name: '辣度', childsCurGoods: [{ id: 11, name: '微辣' }, { id: 12, name: '特辣' }] }],
  } as unknown as GoodsDetail
}

describe('sKU 选择引擎', () => {
  it('多组规格和接口时段均不预选，选齐后才完整，重置清空选择', () => {
    const product = goods()
    product.properties!.push({ id: 2, name: '接口返回的份量', childsCurGoods: [{ id: 21, name: '小份' }, { id: 22, name: '大份' }] })
    const sku = useOrderingSkuSelection({ detail: ref(product) })
    sku.setSchedule([{ day: '今天', items: [{ name: '晚餐', stores: 3, price: 20 }] }])
    expect(sku.selection.value.time).toBeNull()
    expect(sku.selection.value.props).toEqual({})
    sku.chooseProperty(1, 11)
    expect(sku.isPropertiesComplete(false)).toBe(false)
    sku.chooseProperty(2, 22)
    expect(sku.isPropertiesComplete(false)).toBe(true)
    expect(sku.isPropertiesComplete(true)).toBe(false)
    sku.chooseTime(0, 0)
    expect(sku.isPropertiesComplete(true)).toBe(true)
    expect(sku.cartPayload(1)?.sku).toEqual([{ optionId: 1, optionValueId: 11 }, { optionId: 2, optionValueId: 22 }])
    sku.reset()
    expect(sku.selection.value.props).toEqual({})
    expect(sku.selection.value.time).toBeNull()
  })
  it('切换商品或销毁选择实例后不接收旧商品报价', async () => {
    let complete!: (value: unknown) => void
    vi.mocked(catalogApi.goodsPrice).mockImplementation(() => new Promise((resolve) => {
      complete = resolve
    }) as never)
    const scope = effectScope()
    const detail = ref<GoodsDetail | null>(goods())
    const sku = scope.run(() => useOrderingSkuSelection({ detail }))!
    const oldQuote = sku.requote(true)
    detail.value = { ...goods(), basicInfo: { ...goods().basicInfo, id: 102 } }
    complete({ price: 99, stores: 1 })
    expect(await oldQuote).toBe(false)
    expect(sku.skuPrice.value).toBeNull()
    const afterLeave = sku.requote(true)
    scope.stop()
    complete({ price: 88, stores: 1 })
    expect(await afterLeave).toBe(false)
    expect(sku.skuPrice.value).toBeNull()
  })
  it('选全规格后询价，过期询价结果被丢弃', async () => {
    const detail = ref<GoodsDetail | null>(goods())

    const sku = useOrderingSkuSelection({ detail })

    expect(sku.isPropertiesComplete(false)).toBe(false)

    sku.chooseProperty(1, 11)

    expect(sku.isPropActive(1, 11)).toBe(true)

    expect(sku.isPropertiesComplete(false)).toBe(true)

    let resolveFirst!: (v: unknown) => void

    vi.mocked(catalogApi.goodsPrice)
      .mockReturnValueOnce(new Promise((r) => {
        resolveFirst = r
      }) as never)
      .mockResolvedValueOnce({ price: 22, originalPrice: 25, score: 0, stores: 5 } as never)

    const first = sku.requote(true)

    const second = sku.requote(true)

    expect(await second).toBe(true)

    resolveFirst({ price: 1, originalPrice: 1, score: 0, stores: 1 })

    expect(await first).toBe(false)

    expect(sku.skuPrice.value).toMatchObject({ price: 22 })
  })

  it('时段无库存不改变选择；加购参数包含规格', () => {
    const detail = ref<GoodsDetail | null>(goods())

    const sku = useOrderingSkuSelection({ detail })

    sku.setSchedule([{ day: '今天', items: [{ name: '午餐', stores: 0 }, { name: '晚餐', stores: 3 }] }] as never)

    expect(sku.chooseTime(0, 0)).toBe('noStores')

    expect(sku.chooseTime(0, 1)).toBe('ok')

    expect(sku.chooseTime(5, 0)).toBe('invalid')

    sku.chooseProperty(1, 12)

    expect(sku.cartPayload(2)).toMatchObject({ goodsId: 101, number: 2, sku: [{ optionId: 1, optionValueId: 12 }], goodsTimesDay: '今天', goodsTimesItem: '晚餐' })
  })
})
