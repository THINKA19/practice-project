import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import i18n from '@/locale'

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), login: vi.fn() }))
vi.mock('../composables/use-page', () => ({
  useMemberCenterPage: () => ({
    user: ref({ nickname: '测试顾客', userLevel: { name: '银卡会员' } }),
    demo: true,
    totalConsumed: ref(null),
    levelList: ref([{ id: 1, name: '银卡会员', rebate: 9.5, upgradeAmount: 500 }]),
    levelFailed: ref(false),
    levelLoading: ref(false),
    levelsAvailable: true,
    failed: ref(false),
    loading: ref(false),
    ...mocks,
  }),
}))
vi.mock('@dcloudio/uni-app', () => ({
  onShow: vi.fn(),
  onPullDownRefresh: vi.fn(),
}))
afterEach(() => vi.unstubAllGlobals())
it('会员中心使用正式资料模型，累计消费缺失显示横杠，等级仅标为演示', async () => {
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onShow', vi.fn())
  vi.stubGlobal('onPullDownRefresh', vi.fn())
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page, { global: { plugins: [i18n] } })
  try {
    expect(wrapper.text()).toContain('测试顾客')
    expect(wrapper.text()).toContain('银卡会员')
    expect(wrapper.text()).toContain('9.5折')
    expect(wrapper.text()).toContain('￥—')
    expect(wrapper.text()).toContain('开发演示')
  }
  finally { wrapper.unmount() }
})
