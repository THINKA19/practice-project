import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { resetAllMocks } from '@/mock'
import { createServiceGallery } from '../data'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => {
  vi.unstubAllEnvs()
})
it('service samples are independent and the public API uses the registered mock', async () => {
  const first = createServiceGallery()
  expect(first).toHaveLength(6)
  expect(first.every(group => group.images.length === 16)).toBe(true)
  first[0].images[0].label = 'changed'
  expect(createServiceGallery()[0].images[0].label).not.toBe('changed')
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { serviceApi } = await import('../../index')
  expect(await serviceApi.gallery()).toEqual(createServiceGallery())
  expect(uni.request).not.toHaveBeenCalled()
})

beforeEach(() => resetAllMocks())
