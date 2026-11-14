import { beforeEach, expect, it, vi } from 'vitest'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { useSessionState } from '@/pages/auth/session'
import { useRiderPermissionsStore } from '../composables/use-store'
import { fetchRiderGrant } from '../api/permissions.api'
import { createGrant } from '../mock/fixtures'
import { toRiderGrant } from '../models/mappers'

vi.mock('../api/permissions.api', () => ({ fetchRiderGrant: vi.fn() }))
beforeEach(() => {
  seedSession({}, 'rider')
  vi.mocked(fetchRiderGrant).mockReset()
})
it('只有当前骑手具备资格及具体授权时才允许动作', async () => {
  const store = useRiderPermissionsStore()
  vi.mocked(fetchRiderGrant).mockResolvedValue(createGrant('1'))
  await expect(store.requirePermission('task.grab')).resolves.toBeUndefined()
  await expect(store.requirePermission('admin.write')).rejects.toThrow('权限')
  vi.mocked(fetchRiderGrant).mockResolvedValue({ ...createGrant('1'), qualified: false })
  await expect(store.requirePermission('task.grab')).rejects.toThrow('权限')
})
it('其他骑手的授权及网络失败都清除旧权限', async () => {
  const store = useRiderPermissionsStore()
  vi.mocked(fetchRiderGrant).mockResolvedValue(createGrant('2'))
  expect(await store.refresh()).toBe(false)
  expect(store.grant).toBeNull()
  vi.mocked(fetchRiderGrant).mockRejectedValue(new Error('离线'))
  await expect(store.requirePermission('task.grab')).rejects.toThrow('离线')
})
it('换号后的迟到授权不得回填', async () => {
  let resolve!: (value: ReturnType<typeof createGrant>) => void
  vi.mocked(fetchRiderGrant).mockReturnValue(new Promise((done) => {
    resolve = done
  }))
  const store = useRiderPermissionsStore()
  const pending = store.refresh()
  seedSession({ userId: 2 }, 'rider')
  resolve(createGrant('1'))
  expect(await pending).toBe(false)
  expect(store.grant).toBeNull()
  expect(store.loading).toBe(false)
})
it('未登录不请求，非法结构不转为权限', async () => {
  useSessionState().clearSession()
  expect(await useRiderPermissionsStore().refresh()).toBe(false)
  expect(fetchRiderGrant).not.toHaveBeenCalled()
  expect(() => toRiderGrant({ riderId: '1', qualified: true, permissions: [1] })).toThrow()
})
