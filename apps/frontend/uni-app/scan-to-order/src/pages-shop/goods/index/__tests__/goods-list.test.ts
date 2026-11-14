import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { useGoodsActions } from '../composables/index/useGoodsActions'
import { useGoodsList } from '../composables/index/useGoodsList'
import { goodsApi } from '../api/goods'

vi.mock('@dcloudio/uni-app', () => ({ onShow: vi.fn(), onLoad: vi.fn(), onHide: vi.fn(), onUnload: vi.fn() }))
vi.mock('../api/goods', () => ({ goodsApi: { list: vi.fn(), action: vi.fn() } }))
vi.mock('@/utils/project/interaction', () => ({ confirm: vi.fn(async () => true), toast: vi.fn(), showError: vi.fn() }))

const shop = (id: string) => ({ id, merchantId: 'M1', name: id, soundNotify: true, roleTemplate: 'owner' as const, permissions: ['goods.edit'], grantVersion: 1 })
const item = { id: 1, shopId: 'A', version: 1, name: '测试商品', cover: '', price: 1, originPrice: 1, sold: 0, stock: 1, category: '主食', status: 1 as const }
beforeEach(() => {
  seedSession({}, 'shop')
  vi.mocked(goodsApi.list).mockReset()
  vi.mocked(goodsApi.action).mockReset()
})

describe('门店商品目录', () => {
  it('按接口顺序展示分类，只在首位补全部，保留空分类', async () => {
    vi.mocked(goodsApi.list).mockResolvedValue({ categories: ['套餐', '主食', '季节限定'], items: [item] })
    useMerchantShopStore().current = shop('A')
    const vm = useGoodsList()
    await vm.refresh()
    expect(goodsApi.list).toHaveBeenCalledWith(expect.objectContaining({ shopId: 'A' }))
    expect(vm.categories.value.map(tab => tab.label)).toEqual(['全部', '套餐', '主食', '季节限定'])
    expect(vm.list.value).toEqual([item])
    vm.activeCate.value = 1
    expect(vm.list.value).toEqual([])
    vm.activeCate.value = 2
    expect(vm.list.value).toEqual([item])
    vi.mocked(goodsApi.list).mockResolvedValue({ categories: ['主食', '套餐'], items: [item] })
    await vm.refresh()
    expect(vm.activeCate.value).toBe(1)
    expect(vm.list.value).toEqual([item])
  })

  it('切店后不接纳旧门店的商品和分类', async () => {
    let resolveCatalog!: (value: Awaited<ReturnType<typeof goodsApi.list>>) => void
    vi.mocked(goodsApi.list).mockReturnValue(new Promise((resolve) => {
      resolveCatalog = resolve
    }))
    const store = useMerchantShopStore()
    store.current = shop('A')
    const vm = useGoodsList()
    const pending = vm.refresh()
    store.current = shop('B')
    store.revision++
    resolveCatalog({ categories: ['主食'], items: [item] })
    await pending
    expect(vm.goods.value).toEqual([])
    expect(vm.categories.value.map(tab => tab.label)).toEqual(['全部'])
  })

  it('仅展示零库存商品，补货后从售罄筛选移出', async () => {
    vi.mocked(goodsApi.list).mockResolvedValue({ categories: ['售罄'], items: [item, { ...item, id: 2, stock: 0 }] })
    useMerchantShopStore().current = shop('A')
    const vm = useGoodsList()
    await vm.refresh()
    vm.activeCate.value = 1
    expect(vm.list.value.map(product => product.id)).toEqual([2])
    vm.applyLocalChange({ ...item, id: 2, stock: 5 })
    expect(vm.list.value).toEqual([])
  })
})

it('标记售罄后，只能用正整数补货恢复销售', async () => {
  useMerchantShopStore().current = shop('A')
  const vm = useGoodsActions()
  const soldOut = { ...item, stock: 0, version: 2 }
  const apply = vi.fn()
  vi.mocked(goodsApi.action).mockResolvedValueOnce(soldOut)
  vm.openEditor(item, 'stock')
  expect(vm.editorOpen.value).toBe(false)
  await vm.markSoldOut(item, apply)
  await vi.waitFor(() => expect(apply).toHaveBeenCalledWith(soldOut))
  expect(goodsApi.action).toHaveBeenLastCalledWith(expect.objectContaining({ shopId: 'A' }), item, 0)

  vm.openEditor(soldOut, 'stock')
  vm.input.value = '0'
  await vm.submitEditor(apply)
  expect(goodsApi.action).toHaveBeenCalledTimes(1)

  const restored = { ...soldOut, stock: 8, version: 3 }
  vi.mocked(goodsApi.action).mockResolvedValueOnce(restored)
  vm.input.value = '8'
  await vm.submitEditor(apply)
  expect(goodsApi.action).toHaveBeenLastCalledWith(expect.objectContaining({ shopId: 'A' }), soldOut, 8)
  expect(apply).toHaveBeenLastCalledWith(restored)
  expect(vm.editorOpen.value).toBe(false)
})
