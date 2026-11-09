import { effectScope, ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import type { Goods } from '../models/goods.types'
import { useOrderingCartBar } from '../composables/use-cart-bar'

vi.mock('@/pages/ordering/index', () => ({ useShopCheckoutAvailability: () => ({ reason: ref(''), ensureAvailable: () => Promise.resolve() }) }))

const mocks = vi.hoisted(() => ({ add: vi.fn(), toast: vi.fn(), showError: vi.fn(), showLoading: vi.fn() }))
vi.mock('@/pages/ordering/menu-cart', () => ({
  quickAddNumber: () => 1,
  useCartStore: () => ({ items: [], add: mocks.add }),
}))
vi.mock('../composables/use-locale', () => ({ useOrderingLocale: () => ({ t: () => '已加入购物车' }) }))
vi.mock('@/utils/project/interaction', () => ({
  showLoading: mocks.showLoading,
  hideLoading: vi.fn(),
  toast: mocks.toast,
  showError: mocks.showError,
}))
vi.mock('../adapters/errors.adapter', () => ({ needsLogin: (error: Error) => error.message === 'login' }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
vi.mock('@/pages/routes', () => ({ ClientRoutes: { Ordering: {} } }))

beforeEach(() => vi.resetAllMocks())

it('加购使用局部忙碌状态，成功不弹大提示，保留原来的加购参数', async () => {
  let finish!: () => void
  mocks.add.mockReturnValue(new Promise<void>((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const cart = scope.run(() => useOrderingCartBar({ isScanMode: () => false, onNeedLogin: vi.fn() }))!
  try {
    const pending = cart.quickAdd({ id: 1, minBuyNumber: 1 } as Goods)
    expect(mocks.toast).not.toHaveBeenCalled()
    expect(cart.addingGoods.value['1']).toBe(true)
    const duplicate = cart.quickAdd({ id: 1, minBuyNumber: 1 } as Goods)
    expect(mocks.add).toHaveBeenCalledTimes(1)
    finish()
    await duplicate
    expect(await pending).toBe('ok')
    expect(mocks.add).toHaveBeenCalledWith({ goodsId: 1, number: 1, sku: [] })
    expect(mocks.toast).not.toHaveBeenCalled()
    expect(mocks.showLoading).not.toHaveBeenCalled()
    expect(cart.addingGoods.value).toEqual({})
  }
  finally {
    scope.stop()
  }
})

it.each(['login', 'network'])('加购失败时不显示成功反馈：%s', async (message) => {
  mocks.add.mockRejectedValue(new Error(message))
  const onNeedLogin = vi.fn()
  const scope = effectScope()
  const cart = scope.run(() => useOrderingCartBar({ isScanMode: () => false, onNeedLogin }))!
  try {
    expect(await cart.quickAdd({ id: 1, minBuyNumber: 1 } as Goods)).toBe(message === 'login' ? 'needLogin' : 'failed')
    expect(mocks.toast).not.toHaveBeenCalled()
    expect(onNeedLogin).toHaveBeenCalledTimes(message === 'login' ? 1 : 0)
    expect(mocks.showError).toHaveBeenCalledTimes(message === 'network' ? 1 : 0)
  }
  finally {
    scope.stop()
  }
})
