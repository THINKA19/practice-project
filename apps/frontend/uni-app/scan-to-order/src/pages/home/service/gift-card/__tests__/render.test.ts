import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import i18n, { setLocale } from '@/locale'

const mocks = vi.hoisted(() => ({ alert: vi.fn() }))
const cards = Array.from({ length: 4 }, (_, i) => ({ id: i + 1, name: `礼品卡${i + 1}`, price: 50, amount: 50, pic: '/static/images/gift-card/classic.png' }))
vi.mock('@dcloudio/uni-app', () => ({ onLoad: (fn: (query: object) => void) => fn({}), onShow: vi.fn() }))
vi.mock('../composables/use-requests', () => ({ cardApi: { list: async () => cards, my: async () => [{ id: 9, cardId: 1, cardInfo: { name: '已领取礼品卡' }, amount: 100, type: 1, status: 0 }] } }))
vi.mock('@/utils/project/interaction', () => ({ alert: mocks.alert, showError: vi.fn() }))

it('四张卡、两个顶部标签可切换，详情点击有反馈，缺图使用本地兜底', async () => {
  seedSession()
  setLocale('zh-Hans')
  vi.stubGlobal('definePage', vi.fn())
  Object.assign(uni, { setNavigationBarTitle: vi.fn() })
  const Page = (await import('../index.vue')).default
  const page = mount(Page, { global: { plugins: [i18n], stubs: { 'z-paging': { template: '<div><header><slot name="top" /></header><main><slot /></main></div>' } } } })
  try {
    await flushPromises()
    expect(page.findAll('header .gift-tab')).toHaveLength(2)
    expect(page.findAll('.gift-grid .gift-card-item')).toHaveLength(4)
    await page.find('.buy-btn').trigger('tap')
    expect(mocks.alert).toHaveBeenCalledWith(expect.stringContaining('在线购买暂未开放'))
    await page.findAll('.gift-tab')[1].trigger('tap')
    await flushPromises()
    expect(page.findAll('.my-gift-card')).toHaveLength(1)
    expect(page.find('.my-card-image-box image').attributes('src')).toBe('/static/images/gift-card/classic.png')
    expect(page.text()).toContain('已领取礼品卡')
    expect(page.findAll('.gift-tab')[1].attributes('aria-selected')).toBe('true')
    await page.findAll('.gift-tab')[0].trigger('tap')
    await flushPromises()
    expect(page.findAll('.gift-card-item')).toHaveLength(4)
  }
  finally {
    page.unmount()
    vi.unstubAllGlobals()
  }
}, 15000)
