/** 商品搜索流程迁移回归：验证查询、排序和详情导航仍连接原有业务能力。 */
import { effectScope } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import { useGoodsSearchPage } from '../composables/use-page'
import { catalogApi } from '@/pages/ordering/menu'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'

vi.mock('@/pages/ordering/menu', () => ({
  catalogApi: { goodsList: vi.fn().mockResolvedValue({ result: [], totalPage: 0 }) },
  toGoodsList: (value: unknown) => value,
  toGoodsDetail: (value: unknown) => value,
  useOrderingLocale: () => ({ t: (key: string) => key }),
  useOrderingSkuSelection: () => ({}),
  buildSkuPayload: vi.fn(),
  errorCode: vi.fn(),
  isApiError: vi.fn(),
  needsLogin: vi.fn(),
  showTabBar: vi.fn(),
}))
vi.mock('@/pages/ordering/index/index', () => ({
  orderingSettings: {},
  useShopStore: () => ({ goodsShopScope: 42 }),
}))
vi.mock('@/pages/ordering/menu-cart', () => ({ useCartStore: () => ({ add: vi.fn() }) }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
vi.mock('@/utils/project/interaction', () => ({
  hideLoading: vi.fn(),
  setTitle: vi.fn(),
  showError: vi.fn(),
  showLoading: vi.fn(),
  toast: vi.fn(),
}))

const scopes: ReturnType<typeof effectScope>[] = []
afterEach(() => scopes.splice(0).forEach(scope => scope.stop()))

it('解码搜索词并携带门店、分类查询，排序后从第一页重新请求', async () => {
  const scope = effectScope()
  scopes.push(scope)
  const vm = scope.run(() => useGoodsSearchPage())!
  vm.init({ name: encodeURIComponent('鲜奶'), categoryId: '7' })
  await vi.waitFor(() => expect(vm.loading.value).toBe(false))
  expect(catalogApi.goodsList).toHaveBeenLastCalledWith(expect.objectContaining({ shopId: 42, k: '鲜奶', categoryId: '7', page: 1 }))
  vm.filter('priceUp')
  await vi.waitFor(() => expect(vm.loading.value).toBe(false))
  expect(catalogApi.goodsList).toHaveBeenLastCalledWith(expect.objectContaining({ orderBy: 'priceUp', page: 1 }))
})

it('搜索入口使用 index，商品点击仍进入详情，优惠买单指向账户正式页', () => {
  const scope = effectScope()
  scopes.push(scope)
  const vm = scope.run(() => useGoodsSearchPage())!
  vm.openGoods({ id: 12 } as Parameters<typeof vm.openGoods>[0])
  expect(navigate).toHaveBeenCalledWith(ClientRoutes.Ordering.goodsDetails, { id: 12 })
  expect(ClientRoutes.Ordering.goodsList).toBe('/pages/ordering/menu-search/index')
  expect(ClientRoutes.Ordering.youhuiPay).toBe('/pages/account/services/bill-pay/index')
})
