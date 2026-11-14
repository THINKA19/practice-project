import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import HomeUserCard from '../../components/HomeUserCard/index.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/components/language-switcher/index.vue', () => ({ default: { template: '<span />' } }))
vi.mock('@/pages/account/index', () => ({ CustomerProfile: { template: '<span />' } }))

it('首页始终显示会员中心文字入口，点击交由首页导航处理', async () => {
  const card = mount(HomeUserCard, {
    props: { hasLogin: false, avatar: '', nick: '', levelName: '' },
    global: { stubs: { 'wd-icon': true } },
  })
  try {
    const entry = card.find('button.member-entry')
    expect(entry.text()).toBe('market.member')
    await entry.trigger('tap')
    expect(card.emitted('member')).toHaveLength(1)
  }
  finally {
    card.unmount()
  }
})
