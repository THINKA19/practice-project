import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import i18n, { setLocale } from '@/locale'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

vi.mock('@dcloudio/uni-app', () => ({ onLoad: (fn: (query: { id: string }) => void) => fn({ id: '1003' }), onShow: (fn: () => void) => fn() }))
vi.mock('@/pages/account/profile/order', async () => ({
  attachRefundGoods: (await import('../../order/domain/order.rules')).attachRefundGoods,
  uploadOrderFile: vi.fn(),
  orderApi: { detail: async () => ({ goods: [{ id: 1, goodsName: '测试商品', number: 1, amount: 10, amountSingle: 10, afterSale: '0,1', pic: '/test.png' }] }), refundApplyDetail: async () => [] },
}))

it('实际售后页面能加载商品和中文标题，不显示翻译键', async () => {
  seedSession()
  Object.assign(uni, { setNavigationBarTitle: vi.fn() })
  setLocale('zh-Hans')
  vi.stubGlobal('definePage', vi.fn())
  const Page = (await import('../index.vue')).default
  const page = mount(Page, { global: { plugins: [i18n], stubs: { WdPopup: { template: '<div><slot /></div>' }, WdIcon: true, WdInputNumber: true, WdButton: true } } })
  try {
    await flushPromises()
    expect(page.text()).toContain('选择商品')
    expect(page.text()).toContain('测试商品')
    await page.get('.goods-item').trigger('tap')
    expect(page.text()).toContain('售后类型')
    expect(page.text()).toContain('商品质量问题')
    expect(page.text()).not.toContain('refund.')
    expect(uni.setNavigationBarTitle).toHaveBeenCalledWith({ title: '申请售后' })
  }
  finally {
    page.unmount()
    vi.unstubAllGlobals()
  }
}, 15000)
