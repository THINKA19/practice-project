/** 桌码门店优先于缓存门店，不回退到无关商家。 */
import { beforeEach, expect, it, vi } from 'vitest'
import { useOrderingShopSection } from '../composables/use-shop-section'

const m = vi.hoisted(() => ({ detail: vi.fn(), nearest: vi.fn(), store: { current: { id: 2, name: '上次门店' } as { id: number, name: string } | null, scanDining: { shopId: '1', id: '10', key: 'table-key' }, setCurrent: vi.fn() } }))
vi.mock('@/pages/ordering/index', () => ({ useShopStore: () => m.store, shopApi: { detail: m.detail, fetchShops: m.nearest }, toShopDetail: (data: unknown) => data }))
vi.mock('../adapters/platform.adapter', () => ({ checkAndAuthorize: vi.fn(), hideTabBar: vi.fn(), showTabBar: vi.fn() }))
vi.mock('../adapters/navigation.adapter', () => ({ relaunch: vi.fn() }))
vi.mock('../composables/use-locale', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))
vi.mock('@/utils/project/interaction', () => ({ confirm: vi.fn().mockResolvedValue(true) }))
beforeEach(() => {
  m.detail.mockReset()
})
it('扫码后加载桌码门店，忽略原缓存门店', async () => {
  m.detail.mockResolvedValueOnce({ info: { id: 1, name: '桌码门店' } })
  const ready = vi.fn()
  const vm = useOrderingShopSection({ onShopReady: ready })
  await vm.loadShop()
  expect(m.detail).toHaveBeenCalledWith(1)
  expect(ready).toHaveBeenCalledWith({ id: 1, name: '桌码门店' })
  expect(m.nearest).not.toHaveBeenCalled()
})
it('桌码门店加载失败时不使用其他门店菜单', async () => {
  m.detail.mockRejectedValueOnce(new Error('404'))
  const ready = vi.fn()
  await useOrderingShopSection({ onShopReady: ready }).loadShop()
  expect(ready).not.toHaveBeenCalled()
  expect(m.store.setCurrent).toHaveBeenCalledWith(null)
  expect(m.nearest).not.toHaveBeenCalled()
})
