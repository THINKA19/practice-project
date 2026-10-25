import { ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import type { NavigationResult } from '@/utils/project/navigation'
import { useNavigation } from '../composables/useNavigation'

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
  const vm = useNavigation(user)
  await vm.editNick()
  expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/auth/login/index')
  user.value = { userId: 7 }
  await vm.editNick()
  expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/test/index', { title: '修改昵称' })
  await vm.navTo('意见反馈')
  expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/feedback/index', { title: '意见反馈' })
  await vm.navTo('会员码')
  expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/code/index', { title: '会员码' })
  for (const title of ['优惠券', '余额', '积分明细', '每日签到', '预约订座', '优惠买单', '会员中心', '我的订单', '收货地址', '关于我们', '联系客服', '清除缓存', '商家后台', '申请商家入驻', '骑手工作台']) {
    await vm.navTo(title)
    expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/test/index', { title })
  }
})

it('快速连续点击只跳转一次，完成后允许下次点击', async () => {
  let finish!: (result: NavigationResult) => void
  mocks.navigate.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const vm = useNavigation(ref(null))
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
  const vm = useNavigation(ref(null))
  await vm.navTo('优惠券')
  expect(mocks.toast).toHaveBeenCalledTimes(1)
  await vm.navTo('优惠券')
  expect(mocks.navigate).toHaveBeenCalledTimes(2)
})
