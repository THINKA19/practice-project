// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
import { afterEach, expect, it, vi } from 'vitest'
import { createCuePlayer } from '../cue-player'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

it('解绑原回调，stop 失败仍销毁，旧回调不影响新播放', () => {
  vi.useFakeTimers()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  const makeContext = () => ({
    onEnded: vi.fn(),
    onError: vi.fn(),
    offEnded: vi.fn(),
    offError: vi.fn(),
    play: vi.fn(),
    stop: vi.fn(),
    destroy: vi.fn(),
  })
  const first = makeContext()
  const second = makeContext()
  first.stop.mockImplementation(() => {
    throw new Error('stop failed')
  })
  vi.stubGlobal('uni', { createInnerAudioContext: vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second) })
  const ended = vi.fn()
  const player = createCuePlayer()
  player.play('first.wav', { onEnded: ended })
  const oldEnded = first.onEnded.mock.calls[0][0] as () => void
  player.play('second.wav')
  expect(first.offEnded).toHaveBeenCalledWith(oldEnded)
  expect(first.offError).toHaveBeenCalledWith(first.onError.mock.calls[0][0])
  expect(first.destroy).toHaveBeenCalledOnce()
  oldEnded()
  expect(ended).not.toHaveBeenCalled()
  expect(player.playing).toBe(true)
  player.stop()
  expect(second.destroy).toHaveBeenCalledOnce()
  expect(vi.getTimerCount()).toBe(0)
})
