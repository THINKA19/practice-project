import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.mocked(uni.request).mockReset()
})

async function loadHttp(enabled: boolean, development = true) {
  vi.resetModules()
  vi.stubEnv('DEV', development)
  vi.stubEnv('VITE_USE_MOCK', String(enabled))
  return (await import('@/http/alova')).http
}

function respondFromNetwork() {
  vi.mocked(uni.request).mockImplementation((options: UniApp.RequestOptions) => {
    options.success?.({
      statusCode: 200,
      data: { code: 0, message: 'ok', data: { id: 2, name: '真实适配器响应' } },
      header: {},
      cookies: [],
      errMsg: 'request:ok',
    })
    return { abort: vi.fn() } as UniApp.RequestTask
  })
}

describe('现有 Alova 入口的 Mock 接入', () => {
  it('唯一示例经过 Mock 和现有 responded 解包，不访问网络', async () => {
    await loadHttp(true)
    const { foo } = await import('@/api/foo-alova')
    expect(await foo().send()).toEqual({ id: 1, name: 'Mock 示例' })
    expect(uni.request).not.toHaveBeenCalled()
  })

  it('未登记接口继续使用 uniapp 真实请求适配器', async () => {
    respondFromNetwork()
    const http = await loadHttp(true)
    expect(await http.Get('/unregistered').send()).toEqual({ id: 2, name: '真实适配器响应' })
    expect(uni.request).toHaveBeenCalledOnce()
  })

  it.each([
    [false, true],
    [true, false],
  ])('开关 %s，开发模式 %s 时示例走真实适配器', async (enabled, development) => {
    respondFromNetwork()
    const http = await loadHttp(enabled, development)
    expect(await http.Get('/foo').send()).toEqual({ id: 2, name: '真实适配器响应' })
    expect(uni.request).toHaveBeenCalledOnce()
  })
})
