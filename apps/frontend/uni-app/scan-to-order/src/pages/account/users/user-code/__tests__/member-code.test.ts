import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { computed, effectScope, reactive, ref } from 'vue'
import { parseMemberCode } from '../models/mappers'
import { useUserCodePage } from '../composables/use-page'

const mocks = vi.hoisted(() => ({
  session: { hasLogin: true, identity: 'customer', sessionRevision: 1 },
  available: true,
  dynamic: vi.fn(),
  refresh: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session) }))
vi.mock('../../member-center', () => ({
  useMemberCenterAccount: () => ({
    user: computed(() => reactive(mocks.session).hasLogin && reactive(mocks.session).identity === 'customer' ? { userId: 7 } : null),
    refresh: mocks.refresh,
    balance: ref('0.00'),
  }),
}))
vi.mock('../composables/use-requests', () => ({
  memberCodeApi: { get available() { return mocks.available }, dynamic: mocks.dynamic },
}))
beforeEach(() => {
  vi.useFakeTimers()
  mocks.session.hasLogin = true
  mocks.session.identity = 'customer'
  mocks.session.sessionRevision++
  mocks.available = true
  mocks.dynamic.mockReset()
})
afterEach(() => vi.useRealTimers())

it('边界拒绝无效、过期、过长有效期及未标记的码', () => {
  const good = { code: 'DEMO-1', expiresAt: 1500, demo: true }
  expect(parseMemberCode(good, 1000)).toEqual(good)
  for (const value of [null, [], { ...good, code: '' }, { ...good, expiresAt: 999 }, { ...good, expiresAt: 61001 }, { ...good, demo: false }])
    expect(() => parseMemberCode(value, 1000)).toThrow()
})

it('并发刷新只拉取一次，过期自动清码，允许重新刷新', async () => {
  mocks.dynamic.mockImplementation(async () => ({ code: 'DEMO-1', expiresAt: Date.now() + 1000, demo: true }))
  const scope = effectScope()
  const vm = scope.run(useUserCodePage)!
  try {
    await Promise.all([vm.refresh(), vm.refresh()])
    expect(mocks.dynamic).toHaveBeenCalledOnce()
    expect(vm.codeStatus.value).toBe('ready')
    vi.advanceTimersByTime(1000)
    expect(vm.memberCode.value).toBeNull()
    expect(vm.codeStatus.value).toBe('expired')
    await vm.refresh()
    expect(vm.codeStatus.value).toBe('ready')
  }
  finally { scope.stop() }
})

it('隐藏页面或切换账户后丢弃迟到响应', async () => {
  let finish!: (value: unknown) => void
  mocks.dynamic.mockImplementation(() => new Promise((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(useUserCodePage)!
  try {
    const hidden = vm.refresh()
    vm.suspend()
    finish({ code: 'DEMO-1', expiresAt: Date.now() + 1000, demo: true })
    await hidden
    expect(vm.memberCode.value).toBeNull()
    const switched = vm.refresh()
    reactive(mocks.session).sessionRevision++
    finish({ code: 'DEMO-2', expiresAt: Date.now() + 1000, demo: true })
    await switched
    expect(vm.memberCode.value).toBeNull()
    expect(vm.codeStatus.value).toBe('idle')
  }
  finally { scope.stop() }
})

it('接口错误可重试，游客及未开放环境不请求动态码', async () => {
  const scope = effectScope()
  const vm = scope.run(useUserCodePage)!
  try {
    mocks.dynamic.mockRejectedValueOnce(new Error('network'))
    await vm.refresh()
    expect(vm.codeStatus.value).toBe('error')
    mocks.dynamic.mockResolvedValue({ code: 'DEMO-1', expiresAt: Date.now() + 1000, demo: true })
    await vm.refresh()
    expect(vm.codeStatus.value).toBe('ready')
    mocks.available = false
    vm.suspend()
    await vm.refresh()
    expect(vm.codeStatus.value).toBe('unavailable')
    reactive(mocks.session).identity = 'shop'
    mocks.dynamic.mockClear()
    await vm.refresh()
    expect(mocks.dynamic).not.toHaveBeenCalled()
    expect(vm.memberCode.value).toBeNull()
  }
  finally { scope.stop() }
})
