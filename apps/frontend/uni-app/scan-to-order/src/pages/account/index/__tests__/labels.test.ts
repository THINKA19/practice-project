import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import i18n, { setLocale } from '@/locale'
import Card from '../components/MyUserCard/index.vue'
import Menu from '../components/MyMenuItem/index.vue'
import Assets from '../components/MyAssetCards/index.vue'

it('显示中文账户名称和菜单右侧箭头', () => {
  setLocale('zh-Hans')
  const global = { plugins: [i18n], stubs: { 'ProfileEditorPanel': true, 'WechatAuthorizationPanel': true, 'wd-icon': { props: ['name'], template: '<i :data-icon="name" />' } } }
  const card = mount(Card, { props: { nick: '', avatar: '' }, global })
  const menu = mount(Menu, { props: { icon: 'location', text: '收货地址', from: '#fff', to: '#fff', color: '#333' }, global })
  const assets = mount(Assets, { props: { couponCount: '—', balance: '—', score: '—' }, global })
  try {
    for (const text of ['授权登录', '会员码'])
      expect(card.text()).toContain(text)
    for (const text of ['欢迎光临', '微信登录', '游客'])
      expect(card.text()).not.toContain(text)
    expect(card.text()).not.toContain('用户编号')
    expect(card.text()).not.toContain('普通会员')
    expect(menu.text()).toContain('收货地址')
    expect(menu.find('.menu-chevron').exists()).toBe(true)
    for (const text of ['优惠券', '余额', '积分'])
      expect(assets.text()).toContain(text)
    expect(card.text()).not.toContain('account.')
    expect(assets.text()).not.toContain('account.')
  }
  finally {
    card.unmount()
    menu.unmount()
    assets.unmount()
  }
})
it('无数据时使用横杠占位，不展示错误文字或重试按钮，原卡片入口仍可点击', async () => {
  setLocale('zh-Hans')
  const wrapper = mount(Assets, {
    props: { couponCount: null, balance: null, score: null, status: 'error' },
    global: { plugins: [i18n], stubs: { 'wd-icon': true } },
  })
  try {
    expect(wrapper.text()).not.toContain('暂无数据')
    expect(wrapper.findAll('.asset-empty').map(item => item.text())).toEqual(['—', '—', '—'])
    expect(wrapper.findAll('.balance-card')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('加载失败')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.findAll('.asset-empty')).toHaveLength(3)
    await wrapper.find('.asset-card').trigger('tap')
    expect(wrapper.emitted('coupons')).toHaveLength(1)
    await wrapper.setProps({ status: 'loading' })
    expect(wrapper.findAll('.asset-skeleton')).toHaveLength(3)
    expect(wrapper.text()).not.toContain('加载中')
    await wrapper.setProps({ couponCount: 0, balance: '0.00', score: 0, status: 'ready' })
    expect(wrapper.findAll('.asset-empty')).toHaveLength(0)
    expect(wrapper.text()).toContain('0.00')
    await wrapper.setProps({ status: 'loading' })
    expect(wrapper.text()).toContain('0.00')
    expect(wrapper.findAll('.asset-skeleton')).toHaveLength(0)
  }
  finally {
    wrapper.unmount()
  }
})
