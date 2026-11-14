import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRiderTaskReminders } from '../composables/use-reminders'
import { useRiderTaskStore } from '../composables/use-store'
import type { RiderOrder } from '../models/types'
import { useSessionState } from '@/pages/auth/session'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

vi.mock('../api/tasks.api', () => ({ fetchRiderTasks: vi.fn(), setRiderOnline: vi.fn(), submitRiderAction: vi.fn() }))
let end: () => void
let failure: () => void
let play: ReturnType<typeof vi.fn>
let destroy: ReturnType<typeof vi.fn>
function task(id: string, status = 'pending', version = 1) {
  return { id, shopName: '门店A', status, version, riderId: status === 'assigned' ? 'R1' : '' } as RiderOrder
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.mocked(uni.getStorageSync).mockReturnValue(null)
  play = vi.fn()
  destroy = vi.fn()
  Object.assign(uni, { vibrateShort: vi.fn(), createInnerAudioContext: vi.fn(() => ({ src: '', play, stop: vi.fn(), destroy, onEnded: (callback: () => void) => {
    end = callback
  }, onError: (callback: () => void) => {
    failure = callback
  } })) })
  seedSession({ userId: 1 }, 'rider')
  const pool = useRiderTaskStore()
  pool.riderId = 'R1'
  pool.online = true
  pool.orders = [task('old')]
})
afterEach(() => {
  useRiderTaskReminders().pause()
  vi.useRealTimers()
})
describe('骑手前台新单提醒', () => {
  it('只在上线时切换语音，下线后再次上线保留偏好', () => {
    const notices = useRiderTaskReminders()
    const pool = useRiderTaskStore()
    notices.resume()
    pool.online = false
    notices.toggle()
    expect(notices.enabled).toBe(false)
    expect(play).not.toHaveBeenCalled()

    pool.online = true
    notices.toggle()
    expect(notices.enabled).toBe(true)
    pool.online = false
    notices.toggle()
    pool.online = true
    expect(notices.enabled).toBe(true)
    expect(play).toHaveBeenCalledTimes(1)
  })

  it('提醒偏好重新登录可恢复，并且按骑手账号隔离', () => {
    const notices = useRiderTaskReminders()
    notices.resume()
    notices.toggle()
    notices.toggleVibrate()
    const session = useSessionState()
    session.clearSession()
    seedSession({ userId: 1 }, 'rider')
    expect(notices.enabled).toBe(true)
    expect(notices.vibrate).toBe(true)
    session.clearSession()
    seedSession({ userId: 2 }, 'rider')
    expect(notices.enabled).toBe(false)
    expect(notices.vibrate).toBe(false)
  })
  it('首次加载不播历史订单，新任务和新指派去重，页面隐藏释放声音', () => {
    const notices = useRiderTaskReminders()
    const pool = useRiderTaskStore()
    notices.resume()
    notices.inspect()
    expect(play).not.toHaveBeenCalled()
    notices.toggle()
    expect(play).toHaveBeenCalledTimes(1)
    end()
    notices.inspect()
    expect(play).toHaveBeenCalledTimes(1)
    pool.orders.push(task('new'))
    notices.inspect()
    expect(play).toHaveBeenCalledTimes(2)
    expect(notices.latest).toContain('配送订单')
    end()
    notices.inspect()
    expect(play).toHaveBeenCalledTimes(2)
    pool.online = false
    pool.orders.push(task('assigned', 'assigned', 2))
    notices.inspect()
    expect(play).toHaveBeenCalledTimes(2)
    expect(notices.latest).toBe('')
    pool.online = true
    notices.inspect()
    expect(play).toHaveBeenCalledTimes(3)
    expect(notices.latest).toContain('指派')
    notices.pause()
    expect(destroy).toHaveBeenCalledTimes(3)
    pool.orders.push(task('hidden', 'assigned', 2))
    notices.inspect()
    expect(play).toHaveBeenCalledTimes(3)
  })
  it('播放失败保留文字提示，退出清理提醒，新账号不会继承开关', () => {
    const notices = useRiderTaskReminders()
    notices.resume()
    notices.inspect()
    notices.toggle()
    failure()
    expect(notices.message).toContain('播放失败')
    useRiderTaskStore().orders.push(task('new'))
    notices.inspect()
    expect(notices.latest).toContain('门店A')
    useSessionState().clearSession()
    expect(notices.latest).toBe('')
    expect(notices.enabled).toBe(false)
    seedSession({ userId: 2 }, 'rider')
    expect(notices.enabled).toBe(false)
    notices.preview()
    expect(play).toHaveBeenCalledTimes(2)
  })
})
