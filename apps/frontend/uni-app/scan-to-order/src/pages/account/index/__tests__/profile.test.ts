import { mount } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import i18n, { setLocale } from '@/locale'
import HomeCard from '@/pages/home/index/components/HomeUserCard/index.vue'
import MyCard from '../components/MyUserCard/index.vue'

const actions = vi.hoisted(() => ({ open: vi.fn() }))
vi.mock('../components/ProfileEditor/index.vue', () => ({ default: { template: '<view />', methods: { open: actions.open } } }))
vi.mock('@/pages/auth/login', () => ({ WechatAuthorizationPanel: { template: '<view />', methods: { open: actions.open } } }))
beforeEach(() => actions.open.mockClear())

it.each([['首页', HomeCard], ['我的', MyCard]] as const)('%s 头像和授权登录打开同一面板，登录后显示昵称', async (_, Card) => {
  setLocale('zh-Hans')
  const wrapper = mount(Card, {
    props: { hasLogin: false, nick: '旧账户', avatar: '/old.png', levelName: '金卡会员' },
    global: { plugins: [i18n], stubs: { 'LanguageSwitcher': true, 'wd-icon': true } },
  })
  try {
    expect(wrapper.text()).toContain('授权登录')
    expect(wrapper.text()).not.toContain('欢迎光临')
    expect(wrapper.text()).not.toContain('游客')
    expect(wrapper.text()).not.toContain('旧账户')
    expect(wrapper.text()).not.toContain('金卡会员')
    expect(wrapper.find('.profile-avatar').attributes('src')).toBe('/static/images/default-avatar.png')
    if (Card === MyCard) {
      await wrapper.find('.member-code-entry').trigger('tap')
      expect(wrapper.emitted('userCode')).toHaveLength(1)
    }
    await wrapper.find('.wechat-login').trigger('tap')
    await wrapper.find('.profile-avatar').trigger('tap')
    expect(actions.open).toHaveBeenCalledTimes(2)
    await wrapper.setProps({ hasLogin: true, nick: '顾客的微信昵称', avatar: '/wechat.png', levelName: '' })
    expect(wrapper.text()).toContain('顾客的微信昵称')
    expect(wrapper.find('.profile-avatar').attributes('src')).toBe('/wechat.png')
    expect(wrapper.find('.wechat-login').exists()).toBe(false)
    await wrapper.find('.profile-avatar').trigger('tap')
    expect(actions.open).toHaveBeenCalledTimes(3)
    expect(wrapper.find('.vip-badge').exists()).toBe(Card === MyCard)
    expect(wrapper.text()).not.toContain('用户编号')
    await wrapper.setProps({ levelName: '普通会员' })
    expect(wrapper.find('.vip-badge').text()).toBe('普通会员')
    await wrapper.find('.vip-badge').trigger('tap')
    expect(wrapper.emitted(Card === MyCard ? 'vip' : 'member')).toHaveLength(1)
    await wrapper.setProps({ hasLogin: false })
    expect(wrapper.find('.wechat-login').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('顾客的微信昵称')
    expect(wrapper.find('.vip-badge').exists()).toBe(false)
  }
  finally { wrapper.unmount() }
})
