import { effectScope } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useRiderTaskRefresh } from '../composables/use-refresh'

const mocks = vi.hoisted(() => ({
  show: () => {},
  hide: () => {},
  unload: () => {},
  refresh: vi.fn(),
  inspect: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  guard: vi.fn(),
}))
vi.mock('@dcloudio/uni-app', () => ({
  onShow: (callback: () => void) => {
    mocks.show = callback
  },
  onHide: (callback: () => void) => {
    mocks.hide = callback
  },
  onUnload: (callback: () => void) => {
    mocks.unload = callback
  },
}))
vi.mock('../composables/use-store', () => ({ useRiderTaskStore: () => ({ refresh: mocks.refresh }) }))
vi.mock('../composables/use-reminders', () => ({ useRiderTaskReminders: () => mocks }))
vi.mock('@/pages-rider/auth/login', () => ({ useRiderLoginAuth: () => ({ ensureLogin: mocks.guard }) }))
beforeEach(() => {
  vi.useFakeTimers()
  mocks.refresh.mockReset().mockResolvedValue(true)
  mocks.guard.mockReturnValue(true)
})
afterEach(() => vi.useRealTimers())

it('请求未结束不叠加轮询，隐藏后迟到响应不提醒、不续定时器', async () => {
  let finish!: (result: boolean) => void
  mocks.refresh.mockReturnValueOnce(new Promise<boolean>((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  scope.run(useRiderTaskRefresh)
  mocks.show()
  await vi.advanceTimersByTimeAsync(20000)
  expect(mocks.refresh).toHaveBeenCalledTimes(1)
  mocks.hide()
  finish(true)
  await vi.advanceTimersByTimeAsync(20000)
  expect(mocks.inspect).not.toHaveBeenCalled()
  expect(mocks.refresh).toHaveBeenCalledTimes(1)
  mocks.show()
  await vi.advanceTimersByTimeAsync(0)
  expect(mocks.inspect).toHaveBeenCalledTimes(1)
  scope.stop()
  await vi.advanceTimersByTimeAsync(20000)
  expect(mocks.refresh).toHaveBeenCalledTimes(2)
})

it('未登录不请求任务，刷新失败不把旧投影作为新快照提醒', async () => {
  const scope = effectScope()
  scope.run(useRiderTaskRefresh)
  mocks.guard.mockReturnValue(false)
  mocks.show()
  expect(mocks.refresh).not.toHaveBeenCalled()
  mocks.guard.mockReturnValue(true)
  mocks.refresh.mockResolvedValue(false)
  mocks.show()
  await vi.advanceTimersByTimeAsync(0)
  expect(mocks.inspect).not.toHaveBeenCalled()
  mocks.unload()
  await vi.advanceTimersByTimeAsync(10000)
  expect(mocks.refresh).toHaveBeenCalledTimes(1)
  scope.stop()
})
