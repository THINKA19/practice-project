import { ref } from 'vue'
import { expect, it, vi } from 'vitest'
import { useHomePage } from '../use-page'

const actions = vi.hoisted(() => ({
  login: vi.fn(),
  openMemberCenter: vi.fn(),
  openCoupons: vi.fn(),
}))
const state = vi.hoisted(() => ({ loggedIn: false }))
vi.mock('../use-user', () => ({
  useHomeUser: () => ({ hasLogin: { get value() { return state.loggedIn } }, refresh: vi.fn() }),
}))
vi.mock('../use-banners', () => ({ useHomeBanners: () => ({ banners: ref([]), loadBanners: vi.fn(), tapBanner: vi.fn() }) }))
vi.mock('../use-navigation', () => ({ useHomeNavigation: () => actions }))
vi.mock('../use-share', () => ({ useHomeShare: () => ({ shareAppMessage: vi.fn(), shareTimeline: vi.fn() }) }))

it('首页游客点击会员和优惠券先登录，登录后使用正式业务入口', () => {
  const page = useHomePage()
  page.openMemberCenter()
  page.openCoupons()
  expect(actions.login).toHaveBeenCalledTimes(2)
  expect(actions.openMemberCenter).not.toHaveBeenCalled()
  expect(actions.openCoupons).not.toHaveBeenCalled()
  state.loggedIn = true
  page.openMemberCenter()
  page.openCoupons()
  expect(actions.openMemberCenter).toHaveBeenCalledOnce()
  expect(actions.openCoupons).toHaveBeenCalledOnce()
})
