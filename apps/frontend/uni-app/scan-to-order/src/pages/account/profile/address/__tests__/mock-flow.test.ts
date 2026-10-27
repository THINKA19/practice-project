import { afterEach, expect, it, vi } from 'vitest'

let authorization = 'Bearer wx-demo-session-profile-a'
vi.mock('@/pages/auth/session', () => ({ getAuthorizationHeaders: () => ({ Authorization: authorization }) }))
vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())

it('通过正式请求链完成地址增改、默认切换、账户隔离和删空', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { addressApi } = await import('../composables/use-requests')
  const { reset } = await import('../mock/entry.mock')
  reset()
  authorization = 'Bearer wx-demo-session-profile-a'
  expect(await addressApi.list()).toEqual([])
  const form = { linkMan: '测试顾客', mobile: '0912345678', phoneCountry: 'VN', countryCode: 'VN', regionText: '胡志明市', address: '测试路1号' }
  const first = await addressApi.add(form)
  const second = await addressApi.add({ ...form, linkMan: '第二地址' })
  expect((await addressApi.detail(first.id)).info.isDefault).toBe(true)
  await addressApi.update({ ...form, id: second.id, address: '测试路2号', isDefault: false })
  await addressApi.setDefault(second.id)
  expect((await addressApi.defaultAddress()).info.address).toBe('测试路2号')
  expect((await addressApi.detail(first.id)).info.isDefault).toBe(false)
  authorization = 'Bearer wx-demo-session-profile-b'
  expect(await addressApi.list()).toEqual([])
  await expect(addressApi.remove(first.id)).rejects.toThrow()
  authorization = 'Bearer wx-demo-session-profile-a'
  await addressApi.remove(first.id)
  await addressApi.remove(second.id)
  expect(await addressApi.list()).toEqual([])
  expect(uni.request).not.toHaveBeenCalled()
}, 15000)
