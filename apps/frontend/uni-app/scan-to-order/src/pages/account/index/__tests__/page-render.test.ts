import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import i18n, { setLocale } from '@/locale'

const actions = vi.hoisted(() => ({ init: vi.fn(), refresh: vi.fn(), navTo: vi.fn(), goCoupons: vi.fn(), goBalance: vi.fn(), goScorelog: vi.fn() }))
const PagingStub = defineComponent({
  props: ['fixed', 'usePageScroll', 'auto', 'hideEmptyView', 'refresherEnabled', 'loadingMoreEnabled'],
  template: '<div class="paging"><slot /></div>',
})
vi.mock('../composables/use-page', () => ({
  useAccountPage: () => ({
    ...actions,
    user: ref({ userId: 7, userLevel: { name: '普通会员' } }),
    nick: ref('测试顾客'),
    avatar: ref('/static/images/default-avatar.png'),
    uid: ref(7),
    canHX: false,
    couponCount: ref(3),
    balance: ref('128.50'),
    score: ref(260),
    assetStatus: ref('ready'),
    customerServiceType: 'QW',
  }),
}))
afterEach(() => vi.unstubAllGlobals())

it('整页渲染资产与菜单，不显示版本和演示说明，点击保留原入口', async () => {
  const show: Array<() => void> = []
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onShow', (fn: () => void) => show.push(fn))
  setLocale('zh-Hans')
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page, { global: {
    plugins: [i18n],
    stubs: { 'z-paging': PagingStub, 'wd-icon': true },
  } })
  try {
    const paging = wrapper.getComponent(PagingStub)
    expect(paging.props('usePageScroll')).toBe(false)
    expect(paging.props('auto')).toBe(false)
    expect(paging.props('refresherEnabled')).toBe(false)
    expect(paging.props('loadingMoreEnabled')).toBe(false)
    show.forEach(fn => fn())
    expect(actions.init).toHaveBeenCalled()
    expect(actions.refresh).toHaveBeenCalled()
    expect(wrapper.text()).not.toContain('礼品卡')
    for (const text of ['优惠券', '余额', '积分', '128.50', '260', '普通会员', '常用功能', '我的服务', '其他设置', '商家服务', '骑手管理'])
      expect(wrapper.text()).toContain(text)
    for (const text of ['测试版', '演示数据', '非真实资产', '暂无数据', '加载失败', 'account.'])
      expect(wrapper.text()).not.toContain(text)
    const cards = wrapper.findAll('.asset-card')
    expect(cards).toHaveLength(3)
    for (const card of cards)
      await card.trigger('tap')
    expect(actions.goCoupons).toHaveBeenCalledOnce()
    expect(actions.goBalance).toHaveBeenCalledOnce()
    expect(actions.goScorelog).toHaveBeenCalledOnce()
    const feedback = wrapper.findAll('.menu-list-item').find(item => item.text().includes('意见反馈'))!
    await feedback.trigger('tap')
    expect(actions.navTo).toHaveBeenCalledWith('意见反馈')

    setLocale('en')
    await nextTick()
    for (const text of ['Quick actions', 'My services', 'Other settings', 'Merchant services', 'For merchants', 'Open merchant dashboard', 'Apply as a merchant', 'Rider management', 'For riders', 'Open rider workspace'])
      expect(wrapper.text()).toContain(text)
    const merchant = wrapper.findAll('.menu-list-item').find(item => item.text().includes('Open merchant dashboard'))!
    await merchant.trigger('tap')
    expect(actions.navTo).toHaveBeenCalledWith('商家后台')

    setLocale('vi')
    await nextTick()
    for (const text of ['Tính năng thường dùng', 'Dịch vụ của tôi', 'Cài đặt khác', 'Dịch vụ cửa hàng', 'Dành cho cửa hàng', 'Vào trang quản lý cửa hàng', 'Đăng ký trở thành đối tác', 'Quản lý tài xế', 'Dành cho tài xế', 'Vào khu vực làm việc của tài xế'])
      expect(wrapper.text()).toContain(text)
    const rider = wrapper.findAll('.menu-list-item').find(item => item.text().includes('Vào khu vực làm việc của tài xế'))!
    await rider.trigger('tap')
    expect(actions.navTo).toHaveBeenCalledWith('骑手工作台')
  }
  finally {
    wrapper.unmount()
    setLocale('zh-Hans')
  }
}, 15000)
