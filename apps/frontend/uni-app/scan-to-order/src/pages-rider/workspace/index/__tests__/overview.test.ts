import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { useRiderWorkspaceOverview } from '../composables/use-overview'
import { fetchRiderWorkspace } from '../api/workspace.api'
import { toRiderWorkspace } from '../models/mappers'

vi.mock('../api/workspace.api', () => ({ fetchRiderWorkspace: vi.fn() }))
const sample = { announcement: '按实际配送状态操作', incomeTarget: 120 }
beforeEach(() => {
  seedSession({}, 'rider')
  vi.mocked(fetchRiderWorkspace).mockReset()
})
it('响应校验拒绝非法字段，失败后支持重试', async () => {
  expect(() => toRiderWorkspace({ announcement: '异常', incomeTarget: -1 })).toThrow()
  const scope = effectScope()
  const state = scope.run(useRiderWorkspaceOverview)!
  vi.mocked(fetchRiderWorkspace).mockRejectedValueOnce(new Error('离线')).mockResolvedValueOnce(sample)
  await state.refresh()
  expect(state.error.value).toBe('离线')
  await state.refresh()
  expect(state.overview.value).toEqual(sample)
  expect(state.error.value).toBe('')
  scope.stop()
})
it.each(['account', 'dispose'])('%s 变化不接受旧概览', async (kind) => {
  let resolve!: (value: typeof sample) => void
  vi.mocked(fetchRiderWorkspace).mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const scope = effectScope()
  const state = scope.run(useRiderWorkspaceOverview)!
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
