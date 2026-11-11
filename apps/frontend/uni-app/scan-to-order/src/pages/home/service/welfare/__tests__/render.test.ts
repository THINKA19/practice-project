import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { expect, it, vi } from 'vitest'
import Page from '../index.vue'

const state = vi.hoisted(() => ({ fetchId: { value: 1 } }))
vi.mock('../composables/use-page', () => ({ useWelfarePage: () => ({
  templates: ref([{ id: 1, name: '券一' }, { id: 2, name: '券二', pwd: true }, { id: 3, name: '券三' }]),
  loading: ref(false),
  failed: ref(false),
  finished: ref(true),
  refresh: vi.fn(),
  loadMore: vi.fn(),
  fetch: { fetching: ref(true), fetchingId: ref(state.fetchId.value), showPwdPop: ref(false), couponPwd: ref(''), isClaimed: () => false, claimCoupon: vi.fn() },
}) }))
vi.mock('../../../user/coupons', () => ({
  CouponCard: { name: 'CouponCard', props: ['disabled', 'actionText', 'badge'], template: '<button :disabled="disabled">{{ actionText }}</button>' },
  CouponPwdDialog: { template: '<div />' },
}))
it('领取一张福利券时只有该卡进入处理中，其他卡不变色', () => {
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onShow', vi.fn())
  vi.stubGlobal('onReachBottom', vi.fn())
  vi.stubGlobal('onPullDownRefresh', vi.fn())
  const page = mount(Page)
  try {
    const cards = page.findAllComponents({ name: 'CouponCard' })
    expect(cards[0].props('disabled')).toBe(true)
    expect(cards[0].props('actionText')).toBe('领取中…')
    expect(cards[1].props('disabled')).toBe(false)
    expect(cards[1].props('actionText')).toBe('输入口令')
    expect(cards[1].props('badge')).toBe('口令专享券')
    expect(cards[2].props('actionText')).toBe('立即领取')
    expect(page.text()).toContain('已经到底了')
  }
  finally {
    page.unmount()
    vi.unstubAllGlobals()
  }
})
