import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { resetAllMocks } from '@/mock'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => {
  vi.unstubAllEnvs()
})
it('taking a number refreshes records and rejects duplicates or invalid types', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { queueApi } = await import('../../composables/use-requests')
  const types = await queueApi.types()
  expect(types).toHaveLength(4)
  expect(await queueApi.myRecords()).toEqual([])
  await queueApi.take(types[0].id)
  expect(await queueApi.myRecords()).toHaveLength(1)
  await expect(queueApi.take(types[0].id)).rejects.toThrow()
  await expect(queueApi.take(-1)).rejects.toThrow()
  expect(uni.request).not.toHaveBeenCalled()
})

it('runs the explicit guest demo through call, seated, and cancellation without customer credentials', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { queueApi } = await import('../../composables/use-requests')
  await queueApi.demoAction('take', 3)
  let snapshot = await queueApi.demo()
  const record = snapshot.records[0].queuingLog
  expect(snapshot.types.find(t => t.id === 3)?.numberWait).toBe(1)
  await expect(queueApi.demoAction('take', 1)).rejects.toThrow()
  await queueApi.demoAction('call', 3)
  expect((await queueApi.demo()).records[0].queuingLog.status).toBe(1)
  await queueApi.demoAction('seat', record.id)
  await queueApi.demoAction('take', 3)
  snapshot = await queueApi.demo()
  await queueApi.demoAction('cancel', snapshot.records[1].queuingLog.id)
  expect((await queueApi.demo()).records.map(r => r.queuingLog.status)).toEqual([2, 3])
  expect(await queueApi.myRecords()).toEqual([])
})

it('cancels the current customer ticket through the normal endpoint and allows taking a new number', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { queueApi } = await import('../../composables/use-requests')
  await queueApi.take(3)
  const record = (await queueApi.myRecords())[0].queuingLog
  await queueApi.cancel(record.id)
  expect((await queueApi.myRecords())[0].queuingLog.status).toBe(3)
  await expect(queueApi.cancel(record.id)).rejects.toThrow()
  await queueApi.take(3)
  const records = await queueApi.myRecords()
  expect(records[1].queuingLog.number).toBe(record.number + 1)
})

beforeEach(() => resetAllMocks())
