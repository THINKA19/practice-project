import { effectScope, nextTick } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useShopSelectPage } from '../composables/use-select-page'
import type { Shop } from '../models/types'
import { shopRegions } from '../mock/fixtures/regions'

const api = vi.hoisted(() => ({ fetchShops: vi.fn(), regions: vi.fn(), favorites: vi.fn() }))
const auth = vi.hoisted(() => ({ session: { hasLogin: false, identity: '', sessionRevision: 0 }, login: vi.fn() }))
vi.mock('@/pages/auth/session', async () => {
  const { reactive } = await import('vue')
  auth.session = reactive(auth.session)
  return { useSessionState: () => auth.session, requireIdentity: auth.login }
})
const store = vi.hoisted(() => ({ current: null as Shop | null, setCurrent: vi.fn(), setPeisongType: vi.fn() }))
vi.mock('../api/shop.api', () => ({ shopApi: api }))
vi.mock('../store', () => ({ useShopStore: () => store }))
vi.mock('@/pages/ordering/menu', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))
vi.mock('@/utils/project/interaction', () => ({ back: vi.fn(), setTitle: vi.fn() }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
const scopes: ReturnType<typeof effectScope>[] = []
function setup() {
  const scope = effectScope()
  scopes.push(scope)
  const vm = scope.run(() => useShopSelectPage())!
  vm.regions.value = shopRegions
  vm.regionsReady.value = true
  const complete = vi.fn().mockResolvedValue(undefined)
  const reload = vi.fn().mockResolvedValue(undefined)
  const refresh = vi.fn().mockResolvedValue(undefined)
  vm.paging.value = { complete, reload, refresh }
  return { vm, complete, reload, refresh, scope }
}
beforeEach(() => {
  vi.clearAllMocks()
  auth.session.hasLogin = false
  auth.session.identity = ''
  auth.session.sessionRevision++
  api.favorites.mockResolvedValue([])
  api.regions.mockReset()
  store.current = null
  vi.useFakeTimers()
})

it('接口失败不回退静态目录，重试可恢复并清除失效地区', async () => {
  const { vm } = setup()
  vm.applyRegion({ countryCode: 'VN', cityCode: 'VN-SGN', districtCode: 'VN-SGN-1' })
  api.regions.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([shopRegions[1]])
  await vm.loadRegions()
  expect(vm.regions.value).toEqual([])
  expect(vm.regionsError.value).toContain('重试')
  expect(vm.regionsReady.value).toBe(false)
  await vm.loadRegions()
  expect(vm.regions.value.map(item => item.code)).toEqual(['TH'])
  expect(vm.countryCode.value).toBe('')
  expect(vm.cityCode.value).toBe('')
  expect(vm.regionsError.value).toBe('')
})

it('迟到地区响应不能覆盖新目录或卸载后的实例', async () => {
  const { vm, scope } = setup()
  let resolve!: (value: unknown) => void
  api.regions.mockImplementationOnce(() => new Promise((done) => {
    resolve = done
  })).mockResolvedValueOnce([])
  const old = vm.loadRegions()
  await vm.loadRegions()
  resolve(shopRegions)
  await old
  expect(vm.regions.value).toEqual([])
  api.regions.mockImplementationOnce(() => new Promise((done) => {
    resolve = done
  }))
  const pending = vm.loadRegions()
  scope.stop()
  resolve(shopRegions)
  await pending
  expect(vm.regions.value).toEqual([])
})
afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
  vi.useRealTimers()
})

it('请求下一页时传入六条分页参数，失败交给分页组件重试', async () => {
  const { vm, complete } = setup()
  api.fetchShops.mockResolvedValueOnce([{ id: 1, name: '中心店', distance: 1 }])
  await vm.query(2, 6)
  expect(api.fetchShops).toHaveBeenCalledWith(expect.objectContaining({ page: 2, pageSize: 6 }))
  expect(complete).toHaveBeenCalledWith([expect.objectContaining({ distance: '1.0' })])
  api.fetchShops.mockRejectedValueOnce(new Error('offline'))
  await vm.query(3, 6)
  expect(complete).toHaveBeenLastCalledWith(false)
})

it('连续输入只在停止四百毫秒后刷新，国家切换重置城市并保留关键词', async () => {
  const { vm, reload } = setup()
  vm.searchChange('胡')
  await vi.advanceTimersByTimeAsync(250)
  vm.searchChange('胡志明')
  await vi.advanceTimersByTimeAsync(399)
  expect(reload).not.toHaveBeenCalled()
  await vi.advanceTimersByTimeAsync(1)
  expect(reload).toHaveBeenCalledTimes(1)
  vm.applyRegion({ countryCode: 'VN', cityCode: 'VN-SGN', districtCode: 'VN-SGN-1' })
  expect(vm.cityCode.value).toBe('VN-SGN')
  vm.applyRegion({ countryCode: 'TH', cityCode: 'VN-SGN', districtCode: 'VN-SGN-1' })
  expect(vm.cityCode.value).toBe('')
  expect(vm.districtCode.value).toBe('')
  api.fetchShops.mockResolvedValueOnce([])
  await vm.query(1, 6)
  expect(api.fetchShops).toHaveBeenLastCalledWith(expect.objectContaining({ nameLike: '胡志明', countryCode: 'TH', cityCode: '', page: 1 }))
})

it('搜索变化和卸载后，迟到的请求不能覆盖新结果，定时器被清理', async () => {
  const { vm, complete, reload, scope } = setup()
  let resolveOld!: (rows: Shop[]) => void
  api.fetchShops.mockReturnValueOnce(new Promise<Shop[]>((resolve) => {
    resolveOld = resolve
  }))
  const pending = vm.query(1, 6)
  vm.searchChange('河内')
  resolveOld([{ id: 1, name: '旧门店' }])
  await pending
  expect(complete).not.toHaveBeenCalled()
  scope.stop()
  await vi.advanceTimersByTimeAsync(500)
  expect(reload).not.toHaveBeenCalled()
})

it('自取与配送入口继续更新现有门店上下文', () => {
  const { vm } = setup()
  vm.init({ peisongType: 'kd' })
  expect(store.setPeisongType).toHaveBeenCalledWith('kd')
  vm.goShop({ id: 1, name: '中心店' })
  expect(store.setCurrent).toHaveBeenCalledWith({ id: 1, name: '中心店' })
})

it('返回列表恢复离开时的位置，当前门店取自唯一门店上下文', () => {
  store.current = { id: 2, name: '公园店' }
  const { vm } = setup()
  const scrollToY = vi.fn()
  vm.paging.value!.scrollToY = scrollToY
  expect(vm.selectedShopId.value).toBe(2)
  vm.rememberScroll(860)
  vm.goShop({ id: 2, name: '公园店' })
  vm.rememberScroll(0)
  vm.restorePosition()
  expect(scrollToY).toHaveBeenCalledWith(860, 0, false)
  vm.restorePosition()
  expect(scrollToY).toHaveBeenCalledTimes(1)
})

it('重新进入清空地区和搜索，旧请求不能重新写入空结果，取消搜索定时器', async () => {
  const { vm, complete, reload } = setup()
  vm.applyRegion({ countryCode: 'VN', cityCode: 'VN-SGN', districtCode: 'VN-SGN-1' })
  vm.searchChange('顺化')
  let finish!: (rows: Shop[]) => void
  api.fetchShops.mockReturnValueOnce(new Promise<Shop[]>((resolve) => {
    finish = resolve
  }))
  const oldRequest = vm.query(1, 6)
  vm.resetFilters()
  const reloads = reload.mock.calls.length
  finish([])
  await oldRequest
  expect(complete).not.toHaveBeenCalled()
  expect(vm.searchValue.value).toBe('')
  expect(vm.regionLabel.value).toBe('地区')
  api.fetchShops.mockResolvedValueOnce([{ id: 1, name: '中心店' }])
  await vm.query(1, 6)
  expect(api.fetchShops).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, nameLike: '', countryCode: '', cityCode: '', districtCode: '' }))
  await vi.advanceTimersByTimeAsync(500)
  expect(reload).toHaveBeenCalledTimes(reloads)
})

it('直接点餐默认自取，首页配送入口重置筛选时不覆盖配送方式', () => {
  const { vm } = setup()
  vm.resetFilters({ defaultPickup: true })
  expect(store.setPeisongType).toHaveBeenCalledWith('zq')
  store.setPeisongType.mockClear()
  vm.resetFilters()
  expect(store.setPeisongType).not.toHaveBeenCalled()
})

it('优惠分类在服务端分页前筛选，保留地区和关键词并忽略旧分类响应', async () => {
  const { vm, complete, reload } = setup()
  vm.searchValue.value = '套餐'
  vm.countryCode.value = 'VN'
  let finish!: (rows: Shop[]) => void
  api.fetchShops.mockReturnValueOnce(new Promise<Shop[]>((resolve) => {
    finish = resolve
  }))
  const old = vm.query(2, 6)
  vm.changeCategory('promotions')
  expect(reload).toHaveBeenCalled()
  finish([{ id: 1, name: '旧列表' }])
  await old
  expect(complete).not.toHaveBeenCalled()
  api.fetchShops.mockResolvedValueOnce([])
  await vm.query(1, 6)
  expect(api.fetchShops).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'promotions', countryCode: 'VN', nameLike: '套餐', page: 1, pageSize: 6 }))
  vm.resetFilters()
  expect(vm.category.value).toBe('all')
})

it('即将开业门店也进入商品浏览页面并更新当前门店', async () => {
  const { vm } = setup()
  const { navigate } = await import('@/utils/project/navigation')
  const { ClientRoutes } = await import('@/pages/routes')
  vm.goShop({ id: 102, name: '筹备店', openingState: 'upcoming' })
  expect(store.setCurrent).toHaveBeenCalledWith(expect.objectContaining({ id: 102 }))
  expect(navigate).toHaveBeenCalledWith(ClientRoutes.Ordering.order)
})

it('游客切换收藏停留当前分类，不自动登录、不请求私人列表，按钮才触发登录', async () => {
  const { vm, complete } = setup()
  vm.changeCategory('promotions')
  expect(vm.category.value).toBe('promotions')
  vm.changeCategory('favorites')
  expect(vm.category.value).toBe('favorites')
  expect(vm.favoritesNeedLogin.value).toBe(true)
  expect(auth.login).not.toHaveBeenCalled()
  await vm.query(1, 6)
  expect(complete).toHaveBeenCalledWith([])
  expect(api.fetchShops).not.toHaveBeenCalled()
  expect(api.favorites).not.toHaveBeenCalled()
  vm.loginForFavorites()
  expect(auth.login).toHaveBeenCalledWith('customer')
  expect(vm.category.value).toBe('favorites')
})

it('登录返回保留收藏分类并刷新，退出后清除列表但不主动跳转登录', async () => {
  const { vm, reload } = setup()
  vm.changeCategory('favorites')
  reload.mockClear()
  auth.session.hasLogin = true
  auth.session.identity = 'customer'
  auth.session.sessionRevision++
  await nextTick()
  expect(vm.category.value).toBe('favorites')
  expect(vm.favoritesNeedLogin.value).toBe(false)
  expect(reload).toHaveBeenCalled()
  api.fetchShops.mockResolvedValueOnce([])
  await vm.query(1, 6)
  expect(api.fetchShops).toHaveBeenCalledWith(expect.objectContaining({ category: 'favorites' }))
  auth.session.hasLogin = false
  auth.session.sessionRevision++
  expect(vm.favoritesNeedLogin.value).toBe(true)
  expect(vm.shops.value).toEqual([])
  expect(auth.login).not.toHaveBeenCalled()
})

it('优惠列表到期保留分页刷新，页面隐藏和卸载后不再发起刷新', async () => {
  vi.setSystemTime(new Date('2026-11-01T23:59:59+07:00'))
  const { vm, refresh, scope } = setup()
  vm.changeCategory('promotions')
  const before = refresh.mock.calls.length
  api.fetchShops.mockResolvedValueOnce([{ id: 1, name: '活动门店', promotions: [{ endsAt: '2026-11-01' }] }])
  await vm.query(1, 6)
  await vi.advanceTimersByTimeAsync(1050)
  expect(refresh).toHaveBeenCalledTimes(before + 1)
  api.fetchShops.mockResolvedValueOnce([])
  await vm.query(1, 6)
  vm.setVisible(false)
  const hidden = refresh.mock.calls.length
  await vi.advanceTimersByTimeAsync(30000)
  expect(refresh).toHaveBeenCalledTimes(hidden)
  scope.stop()
  await vi.advanceTimersByTimeAsync(30000)
  expect(refresh).toHaveBeenCalledTimes(hidden)
})

it('优惠列表返回保留多页数据和筛选，刷新完成后才消费原位置', async () => {
  const { vm, refresh, reload } = setup()
  vm.changeCategory('promotions')
  vm.searchValue.value = '餐厅'
  vm.countryCode.value = 'TH'
  const rows = Array.from({ length: 18 }, (_, index) => ({ id: index + 1, name: `门店${index}` }))
  vm.shops.value = rows
  vm.rememberScroll(1860)
  vm.goShop(rows[12])
  vm.setVisible(false)
  vm.rememberScroll(0)
  let finish!: () => void
  refresh.mockImplementationOnce(() => new Promise<void>((resolve) => {
    finish = resolve
  }))
  const scrollToY = vi.fn()
  vm.paging.value!.scrollToY = scrollToY
  reload.mockClear()
  vm.setVisible(true)
  vm.restorePosition()
  expect(scrollToY).not.toHaveBeenCalled()
  expect(reload).not.toHaveBeenCalled()
  expect(vm.shops.value).toEqual(rows)
  expect(vm.searchValue.value).toBe('餐厅')
  expect(vm.countryCode.value).toBe('TH')
  finish()
  await vi.advanceTimersByTimeAsync(0)
  expect(scrollToY).toHaveBeenCalledWith(1860, 0, false)
  vm.restorePosition()
  expect(scrollToY).toHaveBeenCalledTimes(1)
})

it('滚动容器尚未就绪时保留位置，原列表返回后能继续请求第四页', async () => {
  const { vm, reload } = setup()
  vm.shops.value = Array.from({ length: 18 }, (_, index) => ({ id: index + 1, name: '门店' }))
  vm.rememberScroll(1200)
  vm.goShop(vm.shops.value[12])
  vm.restorePosition()
  const scrollToY = vi.fn()
  vm.paging.value!.scrollToY = scrollToY
  vm.restorePosition()
  expect(scrollToY).toHaveBeenCalledWith(1200, 0, false)
  expect(vm.shops.value).toHaveLength(18)
  expect(reload).not.toHaveBeenCalled()
  api.fetchShops.mockResolvedValueOnce([])
  await vm.query(4, 6)
  expect(api.fetchShops).toHaveBeenLastCalledWith(expect.objectContaining({ page: 4, pageSize: 6 }))
})
