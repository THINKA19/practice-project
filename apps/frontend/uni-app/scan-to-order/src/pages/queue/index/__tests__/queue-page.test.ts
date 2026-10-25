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

it('keeps available types when personal records fail and prevents duplicate tickets', async () => {
  state.myRecords.mockRejectedValueOnce(new Error('offline'))
  const scope = effectScope()
  const vm = scope.run(useQueuePage)!
  await vm.refresh()
  expect(vm.failed.value).toBe(false)
  expect(vm.recordsFailed.value).toBe(true)
  expect(vm.list.value).toHaveLength(1)
  await vm.queuingGet(vm.list.value[0])
  expect(state.take).not.toHaveBeenCalled()
  scope.stop()
})

it('keeps personal tickets when queue types fail', async () => {
  state.types.mockRejectedValueOnce(new Error('offline'))
  state.myRecords.mockResolvedValueOnce([{ queuingLog: { id: 1, typeId: 1, status: 0, number: 1 }, queuingUpType: { id: 1, name: 'A' } }])
  const scope = effectScope()
  const vm = scope.run(useQueuePage)!
  await vm.refresh()
  expect(vm.failed.value).toBe(true)
  expect(vm.mylist.value).toHaveLength(1)
  scope.stop()
})
