/** 交易前刷新、非营业保留浏览，以及换店/账号后的迟到响应。 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope } from 'vue'
import { useShopCheckoutAvailability } from '../composables/use-checkout-availability'
import { useShopStore } from '../store'
import { shopBusinessState, shopCheckoutReason } from '../domain/shop.rules'

const m = vi.hoisted(() => ({ detail: vi.fn(), session: 0 }))
vi.mock('../api/shop.api', () => ({ shopApi: { detail: m.detail } }))
vi.mock('@/pages/auth/session', () => ({ getSessionRevision: () => m.session }))
const scopes: ReturnType<typeof effectScope>[] = []
function setup() {
  const scope = effectScope()
  scopes.push(scope)
  const store = useShopStore()
  store.setCurrent({ id: 1, name: '门店', businessState: 'open' })
  return { store, gate: scope.run(useShopCheckoutAvailability)! }
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-01T12:00:00+07:00'))
  setActivePinia(createPinia())
  m.detail.mockReset()
  m.session = 0
})
afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
  vi.useRealTimers()
})

it.each(['upcoming', 'suspended', 'resting'] as const)('服务端变为 %s 时阻断交易，保留门店供浏览', async (businessState) => {
  const { store, gate } = setup()
  m.detail.mockResolvedValue({ info: { id: 1, name: '门店', businessState } })
  await expect(gate.ensureAvailable()).rejects.toThrow('暂不可结算')
  expect(store.current?.id).toBe(1)
  expect(gate.reason.value).toContain('暂不可结算')
})

it('明确营业才允许结算；网络失败不沿用旧的营业快照', async () => {
  const { gate } = setup()
  m.detail.mockRejectedValueOnce(new Error('offline'))
  await expect(gate.ensureAvailable()).rejects.toThrow('无法确认')
  m.detail.mockResolvedValue({ info: { id: 1, name: '门店', businessState: 'open' } })
  await expect(gate.ensureAvailable()).resolves.toBeUndefined()
  expect(gate.reason.value).toBe('')
})

it.each(['shop', 'session'])('确认期间切换 %s 不回写旧门店，也不继续结算', async (change) => {
  const { store, gate } = setup()
  let finish!: (value: unknown) => void
  m.detail.mockReturnValue(new Promise((resolve) => {
    finish = resolve
  }))
  const pending = gate.ensureAvailable()
  const rejected = expect(pending).rejects.toThrow('已变更')
  if (change === 'shop')
    store.setCurrent({ id: 2, name: '另一家店', businessState: 'open' })
  else
    m.session++
  finish({ info: { id: 1, name: '旧快照', businessState: 'open' } })
  await rejected
  expect(store.current?.name).not.toBe('旧快照')
})

it('营业时段使用 UTC+7，包含开始、不包含结束，跨夜与时钟更新一致', async () => {
  expect(shopBusinessState({ openingHours: '09:00-18:00' }, Date.parse('2026-11-01T02:00:00Z'))).toBe('open')
  expect(shopBusinessState({ openingHours: '09:00-18:00' }, Date.parse('2026-11-01T11:00:00Z'))).toBe('resting')
  expect(shopBusinessState({ openingHours: '18:00-02:00' }, Date.parse('2026-11-01T18:00:00Z'))).toBe('open')
  expect(shopCheckoutReason({ openingHours: '99:00-24:00' })).toContain('待确认')
  const { store, gate } = setup()
  store.setCurrent({ id: 1, name: '门店', openingHours: '09:00-12:01' })
  expect(gate.reason.value).toBe('')
  await vi.advanceTimersByTimeAsync(60000)
  expect(gate.reason.value).toContain('休息中')
})
