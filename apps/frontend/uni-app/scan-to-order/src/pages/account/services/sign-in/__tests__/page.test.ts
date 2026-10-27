import { effectScope, reactive } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useSignInCalendar } from '../composables/use-calendar'

const mocks = vi.hoisted(() => ({ session: { hasLogin: true, identity: 'customer', sessionRevision: 1, updateNowTime: vi.fn() }, logs: vi.fn(), sign: vi.fn(), login: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session), redirectToLogin: mocks.login }))
vi.mock('../composables/use-requests', () => ({ signApi: { sign: mocks.sign, signLogs: mocks.logs } }))
beforeEach(() => {
  mocks.session.hasLogin = true
  mocks.session.sessionRevision = 1
  mocks.logs.mockReset().mockResolvedValue([])
  mocks.sign.mockReset().mockResolvedValue({})
  vi.stubGlobal('uni', { ...uni, setNavigationBarTitle: vi.fn() })
})
it('游客点击签到引导登录且不提交', async () => {
  mocks.session.hasLogin = false
  const scope = effectScope()
  const vm = scope.run(useSignInCalendar)!
  await vm.sign()
  expect(mocks.sign).not.toHaveBeenCalled()
  expect(mocks.login).toHaveBeenCalledWith({ identity: 'customer' })
  scope.stop()
})
it('换号后旧日志不写回且状态清空', async () => {
  let finish!: (value: { id: number, dateAdd: string }[]) => void
  mocks.logs.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(useSignInCalendar)!
  const pending = vm.refresh()
  const state = reactive(mocks.session)
  state.sessionRevision++
  finish([{ id: 1, dateAdd: '2026-10-25' }])
  await pending
  expect(vm.scoreSignLogs.value).toEqual([])
  expect(vm.loading.value).toBe(false)
  scope.stop()
})
it('提交期间重复点击不会再次签到', async () => {
  let finish!: () => void
  mocks.sign.mockImplementationOnce(() => new Promise<void>((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(useSignInCalendar)!
  const first = vm.sign()
  await vm.sign()
  expect(mocks.sign).toHaveBeenCalledTimes(1)
  finish()
  await first
  expect(vm.signing.value).toBe(false)
  scope.stop()
})

it('签到已成功但刷新失败时仍禁止重复签到', async () => {
  mocks.logs.mockRejectedValue(new Error('network'))
  const scope = effectScope()
  const vm = scope.run(useSignInCalendar)!
  await vm.sign()
  expect(vm.signed.value).toBe(true)
  expect(vm.failed.value).toBe(true)
  await vm.sign()
  expect(mocks.sign).toHaveBeenCalledTimes(1)
  scope.stop()
})

it('提交超时后通过日志确认已签到，不再次提交', async () => {
  const now = new Date()
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  mocks.sign.mockRejectedValueOnce(new Error('timeout'))
  mocks.logs.mockResolvedValue([{ id: 1, dateAdd: day }])
  const scope = effectScope()
  const vm = scope.run(useSignInCalendar)!
  await vm.sign()
  expect(vm.signed.value).toBe(true)
  await vm.sign()
  expect(mocks.sign).toHaveBeenCalledTimes(1)
  scope.stop()
})

it('月历按当天和日志展示状态，不提供历史补签选择', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 25, 12))
  mocks.logs.mockResolvedValue([{ id: 1, dateAdd: '2026-10-18' }])
  const scope = effectScope()
  try {
    const vm = scope.run(useSignInCalendar)!
    await vm.refresh()
    const status = (day: number) => vm.calendarDays.value.find(item => item.day === day)?.status
    expect(status(18)).toBe('signed')
    expect(status(20)).toBe('missed')
    expect(status(25)).toBe('today')
    expect(status(26)).toBe('future')
    await vm.sign()
    expect(status(25)).toBe('signed')
    await vm.sign()
    expect(mocks.sign).toHaveBeenCalledTimes(1)
  }
  finally {
    scope.stop()
    vi.useRealTimers()
  }
})
