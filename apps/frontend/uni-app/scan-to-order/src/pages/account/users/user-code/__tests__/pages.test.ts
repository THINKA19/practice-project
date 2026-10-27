import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ refresh: vi.fn().mockResolvedValue(undefined), suspend: vi.fn(), login: vi.fn(), onHide: vi.fn(), onShow: vi.fn(), onPullDownRefresh: vi.fn() }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
vi.mock('@/pages/routes', () => ({ ClientRoutes: { Account: { my: '/pages/account/index/index' } } }))
vi.mock('../composables/use-page', () => ({
  useUserCodePage: () => ({
    user: ref(null),
    demo: true,
    balance: ref('128.50'),
    score: ref(260),
    failed: ref(false),
    loading: ref(false),
    memberCode: ref(null),
    codeStatus: ref('idle'),
    ...mocks,
  }),
}))
afterEach(() => vi.unstubAllGlobals())

it('会员码不展示伪随机凭证，登录及下拉刷新可用，刷新结束关闭动画', async () => {
  const shows: Array<() => void> = []
  const pulls: Array<() => Promise<void>> = []
  vi.stubGlobal('definePage', vi.fn())
  mocks.onShow.mockImplementation((fn: () => void) => shows.push(fn))
  mocks.onPullDownRefresh.mockImplementation((fn: () => Promise<void>) => pulls.push(fn))
  vi.mock('@dcloudio/uni-app', () => ({
    onHide: mocks.onHide,
    onShow: mocks.onShow,
    onPullDownRefresh: mocks.onPullDownRefresh,
  }))
  const stop = vi.fn()
  const back = vi.fn()
  vi.stubGlobal('uni', { stopPullDownRefresh: stop, navigateBack: back })
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page, { global: { stubs: { 'wd-icon': true } } })
  try {
    expect(wrapper.text()).toContain('128.50')
    expect(wrapper.text()).toContain('260')
    expect(wrapper.text()).toContain('不能扫码核销')
    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(wrapper.find('.member-back').exists()).toBe(true)
    await wrapper.find('.member-back').trigger('tap')
    expect(back).toHaveBeenCalledOnce()
    await wrapper.find('.member-login').trigger('tap')
    expect(mocks.login).toHaveBeenCalled()
    expect(mocks.onHide).toHaveBeenCalledWith(mocks.suspend)
    shows.forEach(fn => fn())
    await pulls[0]()
    expect(mocks.refresh).toHaveBeenCalled()
    expect(stop).toHaveBeenCalledOnce()
  }
  finally { wrapper.unmount() }
})
