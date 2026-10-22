import { afterEach, expect, it, vi } from 'vitest'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
vi.mock('@/utils', () => ({ isDoubleTokenMode: true }))

afterEach(() => vi.unstubAllEnvs())

async function setup(mode: 'single' | 'double') {
  vi.resetModules()
  vi.stubEnv('VITE_AUTH_MODE', mode)
  const { useTokenStore } = await import('@/store/token')
  const { httpGet } = await import('@/http/http')
  const store = useTokenStore()
  const requests: UniApp.RequestOptions[] = []
  vi.mocked(uni.request).mockImplementation((options: UniApp.RequestOptions) => {
    requests.push(options)
    return { abort: vi.fn() } as UniApp.RequestTask
  })
  return { store, requests, httpGet }
}
function respond(request: UniApp.RequestOptions, statusCode: number, data: unknown) {
  request.success?.({ statusCode, data, header: {}, cookies: [], errMsg: 'request:ok' })
}
const doubleToken = {
  accessToken: 'old',
  refreshToken: 'refresh',
  accessExpiresIn: 3600,
  refreshExpiresIn: 7200,
}

it('旧请求的 401 不清除后来登录的身份', async () => {
  const { store, requests, httpGet } = await setup('single')
  store.setTokenInfo({ token: 'old', expiresIn: 3600 })
  const promise = httpGet('/protected')
  const assertion = expect(promise).rejects.toMatchObject({ type: 'auth' })
  store.clearSession()
  store.setTokenInfo({ token: 'new', expiresIn: 3600 })
  store.identity = 'rider'
  respond(requests[0], 401, { code: 401 })
  await assertion
  expect(store.identity).toBe('rider')
  expect(requests).toHaveLength(1)
})

it('并发 401 共用一次刷新并重放，不提前拒绝原请求', async () => {
  const { store, requests, httpGet } = await setup('double')
  store.setTokenInfo(doubleToken)
  const first = httpGet('/one')
  const second = httpGet('/two')
  respond(requests[0], 401, { code: 401 })
  respond(requests[1], 401, { code: 401 })
  expect(requests.filter(r => r.url === '/auth/refreshToken')).toHaveLength(1)
  respond(requests[2], 200, { code: 0, data: { ...doubleToken, accessToken: 'new' } })
  await vi.waitFor(() => expect(requests).toHaveLength(5))
  respond(requests[3], 200, { code: 0, data: 'one' })
  respond(requests[4], 200, { code: 0, data: 'two' })
  await expect(Promise.all([first, second])).resolves.toEqual(['one', 'two'])
})

it('退出后旧刷新响应不恢复 token，也不清除新身份', async () => {
  const { store, requests, httpGet } = await setup('double')
  store.setTokenInfo(doubleToken)
  const promise = httpGet('/one')
  const assertion = expect(promise).rejects.toMatchObject({ type: 'auth' })
  respond(requests[0], 401, { code: 401 })
  store.clearSession()
  store.setTokenInfo({ ...doubleToken, accessToken: 'new-user' })
  store.identity = 'shop'
  respond(requests[1], 200, { code: 0, data: doubleToken })
  await assertion
  expect(store.identity).toBe('shop')
  expect(store.tokenInfo).toMatchObject({ accessToken: 'new-user' })
})
