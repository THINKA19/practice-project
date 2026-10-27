import { ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import type { NavigationResult } from '@/utils/project/navigation'
import { useAccountNavigation } from '../composables/use-navigation'

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), toast: vi.fn() }))
vi.mock('@/utils/project/navigation', () => ({ navigate: mocks.navigate }))
vi.mock('@/utils/project/feedback', () => ({ toast: mocks.toast }))
vi.mock('@/locale', () => ({ t: () => '页面打开失败' }))
beforeEach(() => {
  mocks.navigate.mockReset()
  mocks.navigate.mockResolvedValue({ ok: true })
  mocks.toast.mockClear()
})

it('我的各入口使用当前已实现页面，昵称根据登录状态跳转', async () => {
  const user = ref<{ userId: number } | null>(null)
  const vm = useAccountNavigation(user)
  await vm.editNick()
  expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/auth/login/index')
  user.value = { userId: 7 }
  mocks.navigate.mockClear()
  await vm.editNick()
  expect(mocks.navigate).not.toHaveBeenCalled()
  expect(mocks.toast).toHaveBeenLastCalledWith('该功能暂未开放')
  await vm.navTo('意见反馈')
  expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/profile/feedback/index', { title: '意见反馈' })
  await vm.navTo('会员码')
  expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/users/user-code/index', { title: '会员码' })
  for (const [title, path] of [['优惠券', '/pages/account/assets/coupons/index'], ['余额', '/pages/account/assets/asset/index'], ['积分明细', '/pages/account/assets/score/index']]) {
    await vm.navTo(title!)
    expect(mocks.navigate).toHaveBeenLastCalledWith(path)
  }
  for (const [title, path] of [['扫码核销', '/pages/account/services/scan-result/index'], ['每日签到', '/pages/account/services/sign-in/index'], ['预约订座', '/pages/account/services/booking/index'], ['优惠买单', '/pages/account/services/bill-pay/index']]) {
    await vm.navTo(title!)
    expect(mocks.navigate).toHaveBeenLastCalledWith(path)
  }
  for (const [title, path] of [['我的订单', '/pages/account/profile/order/index'], ['收货地址', '/pages/account/profile/address/index'], ['关于我们', '/pages/account/profile/about/index'], ['联系客服', '/pages/account/profile/contact/index']]) {
    await vm.navTo(title!)
    expect(mocks.navigate).toHaveBeenLastCalledWith(path)
  }
  await vm.navTo('会员中心')
  expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/users/member-center/index')
  for (const title of ['商家后台', '申请商家入驻', '骑手工作台']) {
    mocks.navigate.mockClear()
    await vm.navTo(title)
    expect(mocks.navigate).not.toHaveBeenCalled()
    expect(mocks.toast).toHaveBeenLastCalledWith('该功能暂未开放')
  }
})

it('快速连续点击只跳转一次，完成后允许下次点击', async () => {
  let finish!: (result: NavigationResult) => void
  mocks.navigate.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const vm = useAccountNavigation(ref(null))
  const first = vm.navTo('优惠券')
  const second = vm.navTo('优惠券')
  expect(first).toBe(second)
  expect(mocks.navigate).toHaveBeenCalledTimes(1)
  finish({ ok: true })
  await first
  await vm.navTo('余额')
  expect(mocks.navigate).toHaveBeenCalledTimes(2)
})

it('跳转失败显示一次提示并解除锁定，下一次点击可以成功', async () => {
  mocks.navigate.mockResolvedValueOnce({ ok: false, error: new Error('unavailable') })
  const vm = useAccountNavigation(ref(null))
  await vm.navTo('优惠券')
  expect(mocks.toast).toHaveBeenCalledTimes(1)
  await vm.navTo('优惠券')
  expect(mocks.navigate).toHaveBeenCalledTimes(2)
})
