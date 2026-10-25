import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useQueuePage } from '../composables/useQueuePage'

const state = vi.hoisted(() => ({
  session: { hasLogin: true, identity: 'customer', sessionRevision: 1, updateNowTime: vi.fn() },
  types: vi.fn(),
  myRecords: vi.fn(),
  take: vi.fn(),
  toast: vi.fn(),
}))
vi.mock('@/pages/auth/session', () => ({ useSession: () => state.session, requireIdentity: () => true }))
vi.mock('../api/queue', () => ({ queueApi: state }))
vi.mock('@/utils/project/feedback', () => ({ toast: state.toast }))
vi.mock('@/locale', () => ({ t: (key: string) => key }))

beforeEach(() => {
  vi.clearAllMocks()
  state.types.mockResolvedValue([{ id: 1, name: 'A', status: 0 }])
  state.myRecords.mockResolvedValue([])
})

it('does not refresh or toast when taking a number completes after disposal', async () => {
  let finish!: () => void
  state.take.mockReturnValue(new Promise<void>((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(useQueuePage)!
  await vm.refresh()
  const pending = vm.queuingGet(vm.list.value[0])
  scope.stop()
  finish()
  await pending
  expect(state.toast).not.toHaveBeenCalled()
  expect(state.types).toHaveBeenCalledTimes(1)
  await vm.refresh()
  expect(state.types).toHaveBeenCalledTimes(1)
})
