import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, onMounted, ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const lifecycle = vi.hoisted(() => ({ show: [] as (() => void)[], hide: [] as (() => void)[] }))
vi.mock('@/pages/home/index/composables/use-page', () => ({
  useHomePage: () => ({
    banners: ref([]),
    hasLogin: ref(false),
    nick: ref(''),
    avatar: ref(''),
    levelName: ref(''),
    init: vi.fn(),
    refresh: vi.fn(),
    shareAppMessage: vi.fn(),
    shareTimeline: vi.fn(),
  }),
}))
vi.mock('@/tabbar/store', async () => ({
  tabbarList: ref((await import('@/tabbar/config')).tabbarList),
  tabbarStore: { curIdx: 0 },
  isPageTabbar: () => false,
}))
vi.mock('@/utils', () => ({ isCurrentPageTabbar: () => true }))
vi.mock('@/pages/home/index/composables/use-requests', () => ({ bannerApi: { banners: vi.fn() } }))

beforeEach(() => {
  lifecycle.show = []
  lifecycle.hide = []
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('onMounted', onMounted)
  vi.stubGlobal('onLoad', vi.fn())
  vi.stubGlobal('onShow', (fn: () => void) => lifecycle.show.push(fn))
  vi.stubGlobal('onHide', (fn: () => void) => lifecycle.hide.push(fn))
  vi.stubGlobal('onShareAppMessage', vi.fn())
  vi.stubGlobal('onShareTimeline', vi.fn())
  Object.assign(uni, { getLocale: () => 'zh-Hans', setLocale: vi.fn(), setTabBarItem: vi.fn(), hideTabBar: vi.fn(), setNavigationBarTitle: vi.fn() })
})
afterEach(() => vi.unstubAllGlobals())

it('updates the mounted home, login entry, picker and native tabs without navigating', async () => {
  const { default: i18n, setLocale } = await import('../index')
  const Home = (await import('@/pages/home/index/index.vue')).default
  const Tabbar = (await import('@/tabbar/index.vue')).default
  const slotStub = defineComponent({ setup: (_, { slots }) => () => h('div', slots.default?.()) })
  const wrapper = mount(Home, {
    global: { plugins: [i18n], components: {
      'z-paging': slotStub,
      'WdPopup': slotStub,
      'WdTag': slotStub,
      'WdIcon': slotStub,
      'WdSwiper': slotStub,
    } },
  })
  const tabs = mount(Tabbar)
  try {
    lifecycle.show.forEach(fn => fn())
    for (const [code, login, title, cancel, home] of [
      ['en', 'Authorize login', 'Delivery Method', 'Cancel', 'Home'],
      ['vi', 'Đăng nhập ủy quyền', 'Phương thức giao hàng', 'Hủy', 'Trang chủ'],
      ['zh-Hans', '授权登录', '配送方式', '取消', '首页'],
    ]) {
      setLocale(code)
      await nextTick()
      expect(wrapper.find('.wechat-login').text()).toBe(login)
      expect(wrapper.text()).toContain(title)
      expect(wrapper.text()).toContain(cancel)
      expect(uni.setTabBarItem).toHaveBeenCalledWith({ index: 0, text: home })
      if (code !== 'zh-Hans') {
        expect(wrapper.text()).not.toContain('游客')
        expect(wrapper.text()).not.toContain('更多服务')
      }
    }
    lifecycle.hide.forEach(fn => fn())
    vi.mocked(uni.setTabBarItem).mockClear()
    setLocale('en')
    await nextTick()
    expect(uni.setTabBarItem).not.toHaveBeenCalled()
    lifecycle.show.forEach(fn => fn())
    await nextTick()
    expect(uni.setTabBarItem).toHaveBeenCalledWith({ index: 0, text: 'Home' })
  }
  finally {
    wrapper.unmount()
    tabs.unmount()
  }
})

it('translates banner feedback at click time after switching language', async () => {
  const { setLocale, t } = await import('../index')
  const { useHomeBanners } = await import('@/pages/home/index/composables/use-banners')
  const banner = useHomeBanners()
  for (const code of ['zh-Hans', 'en', 'vi']) {
    setLocale(code)
    await banner.tapBanner('https://example.com')
    expect(uni.showToast).toHaveBeenLastCalledWith({ title: t('home.banner.unsupportedLink'), icon: 'none' })
    const pending = banner.tapBanner('/pages/missing/index')
    const options = vi.mocked(uni.navigateTo).mock.calls.at(-1)![0]
    options.fail?.({ errMsg: 'missing' })
    await pending
    expect(uni.showToast).toHaveBeenLastCalledWith({ title: t('common.navigationFailed'), icon: 'none' })
  }
})
