import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { fetchRiderTasks, setRiderOnline, submitRiderAction } from '../api/tasks.api'
import type { RiderOrder } from '../models/types'

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), send: vi.fn(), headers: vi.fn(), mockEnabled: false }))
vi.mock('@/http/alova', () => ({ http: { Get: mocks.get, Post: mocks.post } }))
vi.mock('@/mock/config', () => ({
  get USE_MOCK() {
    return mocks.mockEnabled
  },
}))
vi.mock('@/pages/auth/session', () => ({ getAuthorizationHeaders: mocks.headers }))
beforeEach(() => {
  vi.stubGlobal('uni', { ...uni, getLocation: vi.fn().mockResolvedValue({ latitude: 21.032, longitude: 105.798, accuracy: 10 }) })
  mocks.mockEnabled = false
  vi.stubEnv('VITE_RIDER_BACKEND_ENABLED', 'true')
  mocks.headers.mockReturnValue({ Authorization: 'Bearer current-rider' })
  mocks.get.mockReturnValue({ send: mocks.send })
  mocks.post.mockReturnValue({ send: mocks.send })
  mocks.send.mockResolvedValue({ tasks: [], online: false, serviceArea: null, riderId: 'R1', maxConcurrent: 3 })
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

it('使用当前身份 Bearer 头、关闭请求缓存，写入携带版本而不把 token 放业务参数', async () => {
  await fetchRiderTasks()
  await setRiderOnline(true)
  await submitRiderAction({ id: 'task', version: 2 } as RiderOrder, 'pickup')
  expect(mocks.headers).toHaveBeenCalledWith('rider')
  expect(mocks.get).toHaveBeenCalledWith('/operator/rider/tasks', expect.objectContaining({ cacheFor: 0, headers: { Authorization: 'Bearer current-rider' } }))
  expect(mocks.post).toHaveBeenCalledWith('/operator/rider/online', { online: true, location: { latitude: 21.032, longitude: 105.798, accuracy: 10 } }, expect.any(Object))
  expect(mocks.post).toHaveBeenCalledWith('/operator/rider/task/action', { id: 'task', version: 2, action: 'pickup', reason: '' }, expect.any(Object))
})

it('未显式接通真实服务时不发请求；真实接口拒绝不合法任务快照', async () => {
  vi.stubEnv('VITE_RIDER_BACKEND_ENABLED', 'false')
  await expect(fetchRiderTasks()).rejects.toThrow('尚未接通')
  expect(mocks.get).not.toHaveBeenCalled()
  vi.stubEnv('VITE_RIDER_BACKEND_ENABLED', 'true')
  mocks.send.mockResolvedValue({ tasks: null })
  await expect(fetchRiderTasks()).rejects.toThrow('数据无效')
})

it('骑手演示拒绝无效凭证且不回退真实网络', async () => {
  vi.stubEnv('DEV', true)
  mocks.mockEnabled = true
  await expect(fetchRiderTasks()).rejects.toThrow('骑手登录已失效')
  expect(mocks.get).not.toHaveBeenCalled()
})
