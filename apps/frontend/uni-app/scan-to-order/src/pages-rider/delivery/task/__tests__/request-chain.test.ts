import { expect, it, vi } from 'vitest'

const mockMode = vi.hoisted(() => ({ enabled: true }))
vi.mock('@/mock/config', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/mock/config')>()
  return {
    ...original,
    get USE_MOCK() {
      return mockMode.enabled
    },
  }
})
// 测试中注册骑手路由，请求仍经过正式 Alova 客户端和正式响应解包。
vi.mock('@/mock/loader', async () => {
  const original = await vi.importActual<typeof import('@/mock/loader')>('@/mock/loader')
  return { ...original, discoverMockModules: () => import.meta.glob('/src/pages-rider/**/mock/entry.mock.ts', { eager: true }) }
})
it('七个模块使用正式请求链，任务变化联动账户概览且资料独立保存', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  vi.stubEnv('VITE_MOCK_STRICT', 'true')
  vi.stubEnv('VITE_RIDER_LOGIN_URL', '/operator/rider/login')
  vi.stubEnv('VITE_RIDER_BACKEND_ENABLED', 'true')
  // 先用 Mock 创建客户端，再允许骑手 API 向已登记路由发送请求。
  await import('@/http/alova')
  mockMode.enabled = false
  const { sessionState } = await import('@/pages/auth/session/mock')
  sessionState.reset()
  const { loginRequest } = await import('@/pages-rider/auth/login/api/login.api')
  const token = await loginRequest({ username: 'rider', password: '123456' })
  const { seedSession } = await import('@/pages/auth/session/__tests__/fixtures')
  const session = seedSession({ userId: 30001 }, 'rider')
  session.snapshot!.tokenInfo = token
  const tasks = await import('../api/tasks.api')
  const profile = await import('@/pages-rider/account/profile/api/profile.api')
  const account = await import('@/pages-rider/account/index/api/account.api')
  const workspace = await import('@/pages-rider/workspace/index/api/workspace.api')
  const rules = await import('@/pages-rider/account/settings/api/rules.api')
  const permissions = await import('@/pages-rider/auth/permissions/api/permissions.api')
  const { toRiderProfile } = await import('@/pages-rider/account/profile/models/mappers')
  const { validateRules } = await import('@/pages-rider/account/settings/models/mappers')
  const { validateSnapshot } = await import('../models/mappers')
  const grant = await permissions.fetchRiderGrant()
  expect(grant.riderId).toBe('30001')
  expect(grant.permissions).toContain('task.grab')
  expect((await workspace.fetchRiderWorkspace()).incomeTarget).toBe(120)
  expect(validateRules(await rules.fetchRiderRules()).maxConcurrent).toBe(3)
  const history = validateSnapshot(await tasks.fetchRiderTasks())
  expect(history.online).toBe(false)
  expect(history.tasks).toHaveLength(24)
  const completedCount = history.tasks.filter(task => task.status === 'done').length
  expect((await account.fetchRiderAccount()).completedCount).toBe(completedCount)
  const old = toRiderProfile(await profile.fetchRiderProfile())
  await profile.saveRiderProfile({ version: old.version, name: '新姓名', phone: '13900000000' })
  expect(toRiderProfile(await profile.fetchRiderProfile()).name).toBe('新姓名')
  vi.stubGlobal('uni', { ...uni, getLocation: vi.fn().mockResolvedValue({ latitude: 21.032, longitude: 105.798, accuracy: 10 }) })
  await tasks.setRiderOnline(true)
  let task = validateSnapshot(await tasks.fetchRiderTasks()).tasks.find(row => row.status === 'pending')!
  for (const action of ['grab', 'pickup', 'finish'] as const) {
    await tasks.submitRiderAction(task, action)
    task = validateSnapshot(await tasks.fetchRiderTasks()).tasks.find(row => row.id === task.id)!
  }
  expect(task.status).toBe('done')
  expect((await account.fetchRiderAccount()).completedCount).toBe(completedCount + 1)
  expect(uni.request).not.toHaveBeenCalled()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
}, 30000)
