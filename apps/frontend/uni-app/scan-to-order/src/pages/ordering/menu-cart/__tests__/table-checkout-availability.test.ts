/** 扫码桌台写入复用经营检查，拒绝时保留购物车。 */
import { computed, effectScope, ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useCartPage } from '../composables/use-page'

const m = vi.hoisted(() => ({ ensure: vi.fn(), add: vi.fn(), clear: vi.fn(), redirect: vi.fn(), showError: vi.fn() }))
const table = { shopId: '1', id: 'table', key: 'demo' }
vi.mock('@/pages/ordering/menu', () => ({ needsLogin: () => false, redirect: m.redirect, useOrderingLocale: () => ({ t: (key: string) => key }) }))
vi.mock('@/pages/ordering/index', () => ({
  useShopCheckoutAvailability: () => ({ reason: ref(''), ensureAvailable: m.ensure }),
  useShopStore: () => ({ current: { id: 1 }, scanDining: table }),
}))
vi.mock('../store', () => ({ useCartStore: () => ({ info: { items: [{ shopId: 1, goodsId: 101, number: 1, price: 10, sku: [] }] }, clear: m.clear }) }))
vi.mock('@/pages/auth/session', () => ({ requireIdentity: () => true }))
vi.mock('@/pages/account/profile/order', () => ({ orderApi: { cyTableAddOrder: m.add } }))
vi.mock('@/utils/project/interaction', () => ({ setTitle: vi.fn(), showError: m.showError, withLoading: (action: () => unknown) => action() }))
// 页面组合函数沿用项目 auto-import。
vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
beforeEach(() => {
  vi.resetAllMocks()
})

it('暂停营业时不提交桌台菜品，不清空或跳转，恢复营业可重新提交', async () => {
  const scope = effectScope()
  const page = scope.run(useCartPage)!
  try {
    m.ensure.mockRejectedValueOnce(new Error('暂停营业，暂不可结算'))
    await page.goCreateOrder()
    expect(m.ensure).toHaveBeenCalledWith(1)
    expect(m.add).not.toHaveBeenCalled()
    expect(m.clear).not.toHaveBeenCalled()
    expect(m.redirect).not.toHaveBeenCalled()
    await page.goCreateOrder()
    expect(m.add).toHaveBeenCalledTimes(1)
    expect(m.clear).toHaveBeenCalledTimes(1)
  }
  finally { scope.stop() }
})
