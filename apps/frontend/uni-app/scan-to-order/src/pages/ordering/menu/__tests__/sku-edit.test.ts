import { effectScope, reactive } from 'vue'
import { expect, it, vi } from 'vitest'
import { catalogApi } from '../api/catalog.api'
import { useOrderingSkuPopup } from '../composables/use-sku-popup'

vi.mock('../api/catalog.api', () => ({ catalogApi: {
  goodsDetail: vi.fn(),
  goodsAddition: vi.fn(),
  timesSchedule: vi.fn(),
  goodsPrice: vi.fn().mockResolvedValue({ price: 20, stores: 10 }),
} }))
vi.mock('../composables/use-locale', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))
vi.mock('@/utils/project/interaction', () => ({ showError: vi.fn(), toast: vi.fn() }))

it('编辑按条目回显规格、加料、时段和数量；保存更新原条目；重新新增清空选择', async () => {
  vi.mocked(catalogApi.goodsDetail).mockResolvedValue({ basicInfo: { id: 104, minBuyNumber: 1, stores: 20, minPrice: 20 }, properties: [
    { id: 2, name: '份量', childsCurGoods: [{ id: 21, name: '小份' }, { id: 22, name: '大份' }] },
    { id: 3, name: '辣度', childsCurGoods: [{ id: 31, name: '不辣' }, { id: 32, name: '微辣' }] },
  ] } as never)
  vi.mocked(catalogApi.goodsAddition).mockResolvedValue([{ id: 1, name: '配料', items: [{ id: 7, pid: 1, name: '鸡蛋', price: 2 }] }] as never)
  vi.mocked(catalogApi.timesSchedule).mockResolvedValue([{ day: '今天', items: [{ name: '晚餐', stores: 20, price: 20 }] }])
  const original = reactive({ key: 'specific-line', goodsId: 104, name: '餐品', pic: '', price: 22, number: 3, sku: [{ optionId: 2, optionValueId: 22 }, { optionId: 3, optionValueId: 32 }], additions: [{ pid: 1, id: 7 }], goodsTimesDay: '今天', goodsTimesItem: '晚餐' })
  const addToCart = vi.fn()
  const updateCart = vi.fn().mockResolvedValue('ok')
  const scope = effectScope()
  const sku = scope.run(() => useOrderingSkuPopup({ addToCart, updateCart, onClose: vi.fn() }))!
  try {
    await sku.load(104, original)
    sku.open()
    expect(sku.propertyGroups.value.map(group => group.choices.find(choice => choice.active)?.name)).toEqual(['大份', '微辣'])
    expect(sku.additionGroups.value[0].choices[0].active).toBe(true)
    expect(sku.timeGroups.value[0].choices[0].active).toBe(true)
    expect(sku.number.value).toBe(3)
    sku.chooseProperty(3, 31)
    sku.hide()
    expect(updateCart).not.toHaveBeenCalled()
    expect(original.sku[1].optionValueId).toBe(32)
    sku.open()
    await sku.addToCart()
    expect(addToCart).not.toHaveBeenCalled()
    expect(updateCart).toHaveBeenCalledWith(expect.objectContaining({ key: 'specific-line' }), expect.objectContaining({ number: 3, sku: expect.arrayContaining([{ optionId: 3, optionValueId: 31 }]) }))
    expect(sku.visible.value).toBe(false)
    await sku.load(104)
    expect(sku.editingItem.value).toBeNull()
    expect(sku.selection.value).toEqual({ props: {}, additions: [], time: null })
    expect(sku.number.value).toBe(1)
  }
  finally { scope.stop() }
})
