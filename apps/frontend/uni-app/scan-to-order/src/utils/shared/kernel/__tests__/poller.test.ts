import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPoller } from '../poller'

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('前台轮询器', () => {
  it('立即执行一次，完成后按间隔调度，stop 后不再执行', async () => {
    const task = vi.fn(async () => {})
    const poller = createPoller(task, 1000)
    poller.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(task).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1000)
    expect(task).toHaveBeenCalledTimes(2)
    poller.stop()
    await vi.advanceTimersByTimeAsync(5000)
    expect(task).toHaveBeenCalledTimes(2)
    expect(poller.running).toBe(false)
  })

  it('重启后旧轮次 tick 失效，不会产生第二条调度链', async () => {
    const ticks: { active: boolean }[] = []
    let release!: () => void
    const poller = createPoller(tick => new Promise<void>((done) => {
      ticks.push(tick)
      release = done
    }), 1000)
    poller.start()
    const first = release
    poller.start()
    expect(ticks[0].active).toBe(false)
    expect(ticks[1].active).toBe(true)
    first()
    release()
    await vi.advanceTimersByTimeAsync(1000)
    expect(ticks).toHaveLength(3)
    poller.stop()
  })

  it('任务异常不终止轮询', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const task = vi.fn(async () => {
      throw new Error('boom')
    })
    const poller = createPoller(task, 1000)
    poller.start()
    await vi.advanceTimersByTimeAsync(2000)
    expect(task).toHaveBeenCalledTimes(3)
    poller.stop()
  })
})
