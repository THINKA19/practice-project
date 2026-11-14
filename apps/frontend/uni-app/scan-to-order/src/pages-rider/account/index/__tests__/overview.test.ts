import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { useRiderAccountOverview } from '../composables/use-overview'
import { fetchRiderAccount } from '../api/account.api'
import { toRiderAccount } from '../models/mappers'

vi.mock('../api/account.api', () => ({ fetchRiderAccount: vi.fn() }))
const sample = { level: '配送员', rating: null, completedCount: 2 }
beforeEach(() => {
  seedSession({}, 'rider')
  vi.mocked(fetchRiderAccount).mockReset()
})
it('响应校验拒绝非法字段，失败后支持重试', async () => {
  expect(() => toRiderAccount({ level: '配送员', rating: 6, completedCount: -1 })).toThrow()
  const scope = effectScope()
  const state = scope.run(useRiderAccountOverview)!
  vi.mocked(fetchRiderAccount).mockRejectedValueOnce(new Error('离线')).mockResolvedValueOnce(sample)
  await state.refresh()
  expect(state.error.value).toBe('离线')
  await state.refresh()
  expect(state.overview.value).toEqual(sample)
  expect(state.error.value).toBe('')
  scope.stop()
})
it.each(['account', 'dispose'])('%s 变化不接受旧概览', async (kind) => {
  let resolve!: (value: typeof sample) => void
  vi.mocked(fetchRiderAccount).mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const scope = effectScope()
  const state = scope.run(useRiderAccountOverview)!
  const pending = state.refresh()
  if (kind === 'account')
    seedSession({ userId: 2 }, 'rider')
  else scope.stop()
  resolve(sample)
  await pending
  expect(state.overview.value).toBeNull()
  expect(state.loading.value).toBe(false)
  scope.stop()
})
