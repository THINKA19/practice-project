import { beforeEach, expect, it, vi } from 'vitest'
import { cartApi, useCartStore } from '@/pages/ordering/menu-cart'

beforeEach(() => {
  vi.restoreAllMocks()
})
it('本地重置不发清空请求，旧请求晚到不会恢复旧购物车', async () => {
  const empty = vi.spyOn(cartApi, 'empty')

  let resolve!: (value: Awaited<ReturnType<typeof cartApi.info>>) => void

  vi.spyOn(cartApi, 'info').mockImplementation(() => new Promise((done) => {
    resolve = done
  }))

  const store = useCartStore()

  const pending = store.refresh()

  store.resetLocal()

  resolve({ items: [], number: 1, price: 20 })

  await pending

  expect(store.info).toBeNull()

  expect(empty).not.toHaveBeenCalled()
})
it('消费者共用购物车状态与刷新结果', async () => {
  const cart = { items: [], number: 0, price: 0 }

  vi.spyOn(cartApi, 'info').mockResolvedValue(cart)

  const first = useCartStore()

  const second = useCartStore()

  expect(first).toBe(second)

  expect(first.$id).toBe('cart')

  await first.refresh()

  expect(second.info).toEqual(cart)
})

it('较早的读取最后返回时不覆盖新快照', async () => {
  let resolveOld!: (value: Awaited<ReturnType<typeof cartApi.info>>) => void
  vi.spyOn(cartApi, 'info')
    .mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve }))
    .mockResolvedValueOnce({ items: [], number: 2, price: 40 })
  const store = useCartStore()
  const pending = store.refresh()
  await store.refresh()
  resolveOld({ items: [], number: 1, price: 20 })
  await pending
  expect(store.totalNumber).toBe(2)
})

it('删除失败向调用方报告错误并保留已有购物车', async () => {
  const snapshot = { items: [], number: 1, price: 20 }
  vi.spyOn(cartApi, 'info').mockResolvedValue(snapshot)
  vi.spyOn(cartApi, 'remove').mockRejectedValue(new Error('删除失败'))
  const store = useCartStore()
  await store.refresh()
  await expect(store.changeNumber('item', 0)).rejects.toThrow('删除失败')
  expect(store.info).toEqual(snapshot)
})

it('清空成功后，清空期间发起的读取不能恢复旧快照', async () => {
  let resolveRead!: (value: Awaited<ReturnType<typeof cartApi.info>>) => void
  let resolveClear!: () => void
  vi.spyOn(cartApi, 'info').mockImplementation(() => new Promise((resolve) => {
    resolveRead = resolve
  }))
  vi.spyOn(cartApi, 'empty').mockImplementation(() => new Promise<null>((resolve) => {
    resolveClear = () => resolve(null)
  }))
  const store = useCartStore()
  const clearing = store.clear()
  const reading = store.refresh()
  resolveClear()
  await clearing
  resolveRead({ items: [], number: 1, price: 20 })
  await reading
  expect(store.info).toBeNull()
})
