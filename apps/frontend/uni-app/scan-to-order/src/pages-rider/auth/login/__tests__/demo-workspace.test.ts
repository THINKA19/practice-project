import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'

vi.mock('@dcloudio/uni-app', () => ({ onLoad: vi.fn(), onShow: vi.fn() }))

it('开发环境使用现有公共 Mock 加载器完成骑手登录并读取工作台', async () => {
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  vi.stubEnv('VITE_MOCK_STRICT', 'true')
  const scope = effectScope()

  try {
    const { useRiderLoginPage } = await import('../composables/use-page')
    const { fetchRiderWorkspace } = await import('@/pages-rider/workspace/index/api/workspace.api')
    const { fetchRiderGrant } = await import('@/pages-rider/auth/permissions/api/permissions.api')
    const { fetchRiderTasks } = await import('@/pages-rider/delivery/task/api/tasks.api')
    const page = scope.run(useRiderLoginPage)!

    expect(page.serviceReady).toBe(true)
    expect(page.isDemo).toBe(true)
    page.username.value = 'rider'
    page.password.value = 'incorrect'
    await page.submit()
    expect(page.error.value).toContain('账号或密码错误')
    expect(page.session.hasLogin).toBe(false)
    expect(uni.redirectTo).not.toHaveBeenCalled()

    page.password.value = '123456'
    await page.submit()
    expect(page.error.value).toBe('')
    expect(page.session.identity).toBe('rider')
    expect(page.password.value).toBe('')
    expect(uni.redirectTo).toHaveBeenCalledWith({ url: '/pages-rider/workspace/index/index' })
    expect(await fetchRiderWorkspace()).toMatchObject({ incomeTarget: 120 })
    expect((await fetchRiderGrant()).permissions).toContain('task.grab')
    expect(await fetchRiderTasks()).toMatchObject({ tasks: expect.any(Array) })
    await page.logout()
    expect(page.session.hasLogin).toBe(false)
    expect(uni.request).not.toHaveBeenCalled()
  }
  finally {
    scope.stop()
    vi.unstubAllEnvs()
  }
}, 15000)
