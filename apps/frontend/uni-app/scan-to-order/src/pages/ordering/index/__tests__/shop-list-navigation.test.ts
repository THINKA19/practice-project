import { beforeEach, expect, it, vi } from 'vitest'
import { clearShopSelectionTarget, openShopList, takeShopListFreshEntry, takeShopSelectionTarget } from '../navigation'

const mocks = vi.hoisted(() => ({ setScanDining: vi.fn(), setPeisongType: vi.fn(), navigate: vi.fn() }))
vi.mock('../store', () => ({ useShopStore: () => mocks }))
vi.mock('@/utils/project/navigation', () => ({ navigate: mocks.navigate }))
beforeEach(() => {
  vi.clearAllMocks()
  clearShopSelectionTarget()
  mocks.navigate.mockResolvedValue({ ok: true })
})
it('配送方式先写入业务状态，再切换底部列表，不传 URL 参数', async () => {
  await openShopList({ deliveryType: 'kd' })
  expect(mocks.setScanDining).toHaveBeenCalledWith(null)
  expect(mocks.setPeisongType).toHaveBeenCalledWith('kd')
  expect(mocks.navigate).toHaveBeenCalledWith('/pages/ordering/index/index')
  expect(mocks.setPeisongType.mock.invocationCallOrder[0]).toBeLessThan(mocks.navigate.mock.invocationCallOrder[0]!)
})
it('换店目标仅消费一次，普通入口、离开列表和导航失败均清除目标', async () => {
  await openShopList({ returnTo: '/pages/ordering/menu-pay/index' })
  expect(takeShopSelectionTarget()).toBe('/pages/ordering/menu-pay/index')
  expect(takeShopSelectionTarget()).toBeUndefined()
  await openShopList({ returnTo: '/pages/ordering/menu-pay/index' })
  clearShopSelectionTarget()
  expect(takeShopSelectionTarget()).toBeUndefined()
  await openShopList({ returnTo: '/pages/ordering/menu-pay/index' })
  await openShopList()
  expect(takeShopSelectionTarget()).toBeUndefined()
  mocks.navigate.mockResolvedValue({ ok: false })
  await openShopList({ returnTo: '/pages/ordering/menu-pay/index' })
  expect(takeShopSelectionTarget()).toBeUndefined()
})

it('程序入口只触发一次初始列表重置，失败不遗留重置标记', async () => {
  await openShopList()
  expect(takeShopListFreshEntry()).toBe(true)
  expect(takeShopListFreshEntry()).toBe(false)
  mocks.navigate.mockResolvedValue({ ok: false })
  await openShopList()
  expect(takeShopListFreshEntry()).toBe(false)
})

it('继续浏览优先返回栈中的原列表，不触发重置或重新导航', async () => {
  vi.stubGlobal('getCurrentPages', () => [
    { route: 'pages/ordering/index/index' },
    { route: 'pages/ordering/menu/index' },
  ])
  const navigateBack = vi.fn(({ success }) => success())
  vi.stubGlobal('uni', { navigateBack })
  try {
    await openShopList({ mode: 'resume' })
    expect(navigateBack).toHaveBeenCalledWith(expect.objectContaining({ delta: 1 }))
    expect(mocks.navigate).not.toHaveBeenCalled()
    expect(takeShopListFreshEntry()).toBe(false)
  }
  finally {
    vi.unstubAllGlobals()
  }
})

it('原列表不在页面栈或返回失败时切换到列表，继续浏览不设置重置标记', async () => {
  vi.stubGlobal('getCurrentPages', () => [{ route: 'pages/ordering/menu/index' }])
  try {
    await openShopList({ mode: 'resume' })
    expect(mocks.navigate).toHaveBeenCalledWith('/pages/ordering/index/index')
    expect(takeShopListFreshEntry()).toBe(false)
    vi.stubGlobal('getCurrentPages', () => [{ route: 'pages/ordering/index/index' }, { route: 'pages/ordering/menu/index' }])
    vi.stubGlobal('uni', { navigateBack: ({ fail }: { fail: () => void }) => fail() })
    await openShopList({ mode: 'resume' })
    expect(mocks.navigate).toHaveBeenCalledTimes(2)
    expect(takeShopListFreshEntry()).toBe(false)
  }
  finally {
    vi.unstubAllGlobals()
  }
})
