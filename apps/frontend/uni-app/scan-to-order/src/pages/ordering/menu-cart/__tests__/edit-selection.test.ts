import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, it, vi } from 'vitest'
import { cartApi } from '../api/cart.api'
import { useCartStore } from '../store'

const original = { key: 'old', goodsId: 104, name: '餐品', pic: '', price: 20, number: 3, sku: [{ optionId: 2, optionValueId: 21 }] }
const target = { ...original, key: 'new', sku: [{ optionId: 2, optionValueId: 22 }] }
const command = { goodsId: 104, number: 3, sku: target.sku }
function snapshot(items: typeof original[]) {
  return { items, number: items.reduce((sum, item) => sum + item.number, 0), price: 100 }
}
beforeEach(() => {
  vi.restoreAllMocks()
  setActivePinia(createPinia())
})

it('保存替换原条目，合并已有目标配置，不重复增加原配置数量', async () => {
  const store = useCartStore()
  store.info = snapshot([original, { ...target, number: 2 }])
  const add = vi.spyOn(cartApi, 'add').mockResolvedValue(snapshot([original, { ...target, number: 5 }]))
  const remove = vi.spyOn(cartApi, 'remove').mockResolvedValue(snapshot([{ ...target, number: 5 }]))
  await store.replaceItem(original, command)
  expect(add).toHaveBeenCalledTimes(1)
  expect(remove).toHaveBeenCalledWith('old')
  expect(store.items).toHaveLength(1)
  expect(store.items[0].number).toBe(5)
})

it('原条目删除失败时恢复已有目标数量，并刷新真实快照', async () => {
  const store = useCartStore()
  store.info = snapshot([original, { ...target, number: 2 }])
  vi.spyOn(cartApi, 'add').mockResolvedValue(snapshot([original, { ...target, number: 5 }]))
  vi.spyOn(cartApi, 'remove').mockRejectedValue(new Error('删除失败'))
  const rollback = vi.spyOn(cartApi, 'modifyNumber').mockResolvedValue(snapshot([original, { ...target, number: 2 }]))
  vi.spyOn(cartApi, 'info').mockResolvedValue(snapshot([original, { ...target, number: 2 }]))
  await expect(store.replaceItem(original, command)).rejects.toThrow('删除失败')
  expect(rollback).toHaveBeenCalledWith('new', 2)
  expect(store.items.map(item => item.number)).toEqual([3, 2])
})

it('新增配置失败不删除原条目；过期编辑不发起写入', async () => {
  const store = useCartStore()
  store.info = snapshot([original])
  const add = vi.spyOn(cartApi, 'add').mockRejectedValue(new Error('库存不足'))
  const remove = vi.spyOn(cartApi, 'remove')
  await expect(store.replaceItem(original, command)).rejects.toThrow('库存不足')
  expect(remove).not.toHaveBeenCalled()
  await expect(store.replaceItem({ ...original, number: 2 }, command)).rejects.toThrow('购物车已变化')
  expect(add).toHaveBeenCalledTimes(1)
})

it('配置未变化只更新数量，保存原数量不会重复加购', async () => {
  const store = useCartStore()
  store.info = snapshot([original])
  const add = vi.spyOn(cartApi, 'add')
  const remove = vi.spyOn(cartApi, 'remove')
  const modify = vi.spyOn(cartApi, 'modifyNumber').mockResolvedValue(snapshot([original]))
  vi.spyOn(cartApi, 'info').mockResolvedValue(snapshot([original]))
  await store.replaceItem(original, { ...command, sku: original.sku })
  expect(modify).toHaveBeenCalledWith('old', 3)
  expect(add).not.toHaveBeenCalled()
  expect(remove).not.toHaveBeenCalled()
})

it('删除原条目失败且目标是新配置时移除新增条目', async () => {
  const store = useCartStore()
  store.info = snapshot([original])
  vi.spyOn(cartApi, 'add').mockResolvedValue(snapshot([original, target]))
  const remove = vi.spyOn(cartApi, 'remove').mockRejectedValueOnce(new Error('删除失败')).mockResolvedValueOnce(snapshot([original]))
  vi.spyOn(cartApi, 'info').mockResolvedValue(snapshot([original]))
  await expect(store.replaceItem(original, command)).rejects.toThrow('删除失败')
  expect(remove.mock.calls.map(call => call[0])).toEqual(['old', 'new'])
  expect(store.items).toHaveLength(1)
})
