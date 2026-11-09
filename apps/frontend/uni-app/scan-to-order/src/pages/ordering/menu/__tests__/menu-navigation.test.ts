import { beforeEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useOrderingMenu } from '../composables/use-menu'
/** 分类切换只定位最后一次选择，异步补载不打断整个页面。 */

const api = vi.hoisted(() => ({ categories: vi.fn(), goodsList: vi.fn() }))
vi.mock('@/pages/ordering/index', () => ({ useShopStore: () => ({ goodsShopScope: '' }) }))
vi.mock('../api/catalog.api', () => ({ catalogApi: api }))
vi.mock('../models/goods.mappers', () => ({ toGoodsList: (response: unknown) => response }))
vi.mock('../domain/catalog.rules', () => ({
  categoryShopScope: () => '',
  goodsListAction: () => 'add',
  MENU_INITIAL_GOODS: 20,
  miaoshaCountdown: () => null,
  toGoodsList: (response: unknown) => response,
}))
vi.mock('@/utils/project/interaction', () => ({ showError: vi.fn() }))

function goods(categoryId: number, count = 1) {
  return { result: Array.from({ length: count }, (_, i) => ({ id: categoryId * 100 + i, categoryId })) }
}

beforeEach(() => {
  vi.clearAllMocks()
  api.categories.mockResolvedValue([{ id: 1, name: '主食' }, { id: 2, name: '饮品' }, { id: 3, name: '小食' }])
  api.goodsList.mockImplementation(async ({ categoryId }) => goods(categoryId, categoryId === 1 ? 20 : 1))
})

it('按需补载分类后在内部定位，不触发全屏加载遮罩', async () => {
  const menu = useOrderingMenu()
  await menu.loadCategories(null, '0')
  expect(menu.sections.value).toHaveLength(1)
  await menu.selectCategory(2)
  await nextTick()
  expect(menu.sections.value.map(section => section.category.id)).toEqual([1, 2, 3])
  expect(menu.scrollIntoView.value).toBe('menu-cat-3')
  expect(uni.showLoading).not.toHaveBeenCalled()
})

it('快速切回已加载分类时，较早的迟到请求不会把列表拉回去', async () => {
  const menu = useOrderingMenu()
  await menu.loadCategories(null, '0')
  let resolveGoods!: (response: ReturnType<typeof goods>) => void
  api.goodsList.mockImplementationOnce(() => new Promise((resolve) => {
    resolveGoods = resolve
  }))
  const pending = menu.selectCategory(1)
  await nextTick()
  await menu.selectCategory(0)
  await nextTick()
  expect(menu.scrollIntoView.value).toBe('menu-cat-1')
  resolveGoods(goods(2))
  await pending
  await nextTick()
  expect(menu.activeIndex.value).toBe(0)
  expect(menu.scrollIntoView.value).toBe('menu-cat-1')
})

it('空分类不保留在导航，整店空菜单不生成商品分段', async () => {
  api.goodsList.mockResolvedValue({ result: [] })
  const menu = useOrderingMenu()
  await menu.loadCategories(null, '0')
  expect(menu.isEmpty.value).toBe(true)
  expect(menu.navigationCategories.value).toEqual([])
  expect(menu.sections.value).toEqual([])
  expect(menu.failed.value).toBe(false)
})

it('导航排除已确认空分类，点击仍定位正确的原始分类', async () => {
  api.goodsList.mockImplementation(async ({ categoryId }) => categoryId === 1 ? { result: [] } : goods(categoryId, 20))
  const menu = useOrderingMenu()
  await menu.loadCategories(null, '0')
  expect(menu.navigationCategories.value.map(item => item.id)).toEqual([2, 3])
  await menu.selectNavigationCategory(1)
  await nextTick()
  expect(menu.scrollIntoView.value).toBe('menu-cat-3')
  expect(menu.navigationActive.value).toBe(1)
})

it('商品请求失败展示失败而非空店，重新加载后可恢复', async () => {
  api.goodsList.mockRejectedValueOnce(new Error('offline'))
  const menu = useOrderingMenu()
  await menu.loadCategories(null, '0')
  expect(menu.failed.value).toBe(true)
  expect(menu.isEmpty.value).toBe(false)
  expect(menu.navigationCategories.value).toHaveLength(3)
  await menu.loadMore()
  expect(api.goodsList).toHaveBeenCalledTimes(1)
  await menu.loadCategories(null, '0')
  expect(menu.failed.value).toBe(false)
  expect(menu.sections.value).toHaveLength(1)
})
