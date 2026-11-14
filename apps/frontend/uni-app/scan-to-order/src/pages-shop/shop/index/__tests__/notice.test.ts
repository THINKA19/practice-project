import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeStore } from '../notice'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { fetchMerchantEvents } from '../api/events'
import { fetchMerchantGrant, fetchMerchantShops } from '@/pages-shop/auth/permissions/composables/use-grants'
import type { MerchantShop } from '@/pages-shop/auth/permissions'

vi.mock('@/pages-shop/auth/permissions/composables/use-grants', () => ({ fetchMerchantShops: vi.fn(), fetchMerchantGrant: vi.fn() }))
vi.mock('../api/events', () => ({ fetchMerchantEvents: vi.fn() }))
const shop: MerchantShop = { id: 'A', name: 'A', merchantId: 'M1', roleTemplate: 'employee', soundNotify: true, grantVersion: 1, permissions: ['order.read'] }
let end: () => void
let failure: () => void
let play: ReturnType<typeof vi.fn>
let destroy: ReturnType<typeof vi.fn>
async function flush() {
  for (let n = 0; n < 12; n++)
    await Promise.resolve()
}
beforeEach(async () => {
  vi.useFakeTimers()
  play = vi.fn()
  destroy = vi.fn()
  Object.assign(uni, { createInnerAudioContext: vi.fn(() => ({ src: '', play, stop: vi.fn(), destroy, onEnded: (callback: () => void) => {
    end = callback
  }, onError: (callback: () => void) => {
    failure = callback
  } })) })
  seedSession({}, 'shop')
  useMerchantShopStore().shops = [shop]
  vi.mocked(fetchMerchantGrant).mockImplementation(async () => ({ ...shop }))
  vi.mocked(fetchMerchantShops).mockImplementation(async () => [{ ...shop }])
  vi.mocked(fetchMerchantEvents).mockResolvedValue({ cursor: 0, events: [] })
  await useMerchantShopStore().switchShop('A')
})
afterEach(() => {
  useMerchantNoticeStore().pause()
  vi.useRealTimers()
})
describe('门店语音实例', () => {
  it('首批历史订单不播报，新订单自动播放且去重，离开后停止轮询', async () => {
    const notices = useMerchantNoticeStore()
    notices.resume()
    await flush()
    expect(play).not.toHaveBeenCalled()
    vi.mocked(fetchMerchantEvents).mockResolvedValue({ cursor: 1, events: [{ id: 'event-1', sequence: 1, shopId: 'A', kind: 'new-order', orderId: 'order', tableNo: 'A1' }] })
    await vi.advanceTimersByTimeAsync(5000)
    expect(play).toHaveBeenCalledTimes(1)
    expect(vi.mocked(uni.createInnerAudioContext).mock.results[0].value.src).toBe('/static/audio/notifications/incoming.wav')
    expect(notices.latest).toContain('A1')
    end()
    await vi.advanceTimersByTimeAsync(5000)
    expect(play).toHaveBeenCalledTimes(1)
    notices.pause()
    const calls = vi.mocked(fetchMerchantEvents).mock.calls.length
    await vi.advanceTimersByTimeAsync(10000)
    expect(fetchMerchantEvents).toHaveBeenCalledTimes(calls)
    expect(destroy).toHaveBeenCalled()
  })
  it('门店关闭语音时仍同步前台订单并显示新单文字', async () => {
    const notices = useMerchantNoticeStore()
    const authorizationRequests = vi.mocked(fetchMerchantShops).mock.calls.length
    notices.resume()
    await flush()
    const initialSync = notices.syncVersion
    useMerchantShopStore().current!.soundNotify = false
    notices.preview()
    vi.mocked(fetchMerchantEvents).mockResolvedValue({ cursor: 1, events: [{ id: 'new', sequence: 1, shopId: 'A', kind: 'new-order', orderId: 'order', tableNo: 'A1' }] })

    await vi.advanceTimersByTimeAsync(5000)

    expect(notices.syncVersion).toBeGreaterThan(initialSync)
    expect(fetchMerchantShops).toHaveBeenCalledTimes(authorizationRequests)
    expect(notices.latest).toBe('A1 · 有新订单，请接单')
    expect(play).not.toHaveBeenCalled()
  })
  it('音频错误降级为文字提醒，撤销当前门店停止播放', async () => {
    const notices = useMerchantNoticeStore()
    notices.resume()
    await flush()
    notices.preview()
    failure()
    expect(notices.audioError).toContain('播放失败')
    notices.preview()
    const staleEnd = end
    useMerchantShopStore().clear()
    staleEnd()
    expect(notices.latest).toBe('')
    expect(destroy).toHaveBeenCalled()
  })
})
