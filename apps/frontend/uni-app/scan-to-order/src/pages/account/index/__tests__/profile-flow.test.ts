import { effectScope } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import { profileError } from '../domain/account.rules'

afterEach(() => vi.unstubAllEnvs())

it('登录后保存选填资料，退出清空草稿且重新登录保留身份头像', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { useLoginWechatAuthorization } = await import('@/pages/auth/login/composables/use-wechat-authorization')
  const { useProfileEditor } = await import('../components/ProfileEditor/use-profile-editor')
  const { profileApi } = await import('../composables/use-profile-requests')
  const { useSessionState } = await import('@/pages/auth/session')
  const scope = effectScope()
  try {
    const auth = scope.run(() => useLoginWechatAuthorization())!
    expect(await auth.authorize(true)).toBe(true)
    const session = useSessionState()
    expect(session.hasLogin).toBe(true)
    const panel = scope.run(() => useProfileEditor())!
    panel.visible.value = true
    await panel.load()
    expect(panel.ready.value).toBe(true)
    Object.assign(panel.form, { gender: 'female', birthday: '2000-06-15' })
    await panel.save()
    expect(panel.error.value).toBe('')
    expect(panel.visible.value).toBe(false)
    expect(session.userInfo.nickname).toBe('微信顾客')
    expect(session.userInfo.avatar).toBe('/static/images/avatar.jpg')
    expect(await profileApi.read()).toEqual({ gender: 'female', birthday: '2000-06-15' })
    panel.visible.value = true
    await panel.load()
    panel.logout()
    expect(panel.logoutConfirmVisible.value).toBe(true)
    panel.logoutConfirmVisible.value = false
    expect(session.hasLogin).toBe(true)
    panel.logout()
    await panel.confirmLogout()
    expect(session.hasLogin).toBe(false)
    expect(panel.visible.value).toBe(false)
    expect(panel.form.birthday).toBe('')
    await expect(profileApi.read()).rejects.toThrow()
    expect(await auth.authorize(true)).toBe(true)
    expect(session.userInfo.nickname).toBe('微信顾客')
    expect(session.userInfo.avatar).toBe('/static/images/avatar.jpg')
    await session.logout()
  }
  finally { scope.stop() }
}, 15000)

it('校验选填性别及真实生日', () => {
  const form = { gender: 'unknown' as const, birthday: '2000-06-15' }
  expect(profileError(form)).toBe('')
  expect(profileError({ ...form, birthday: '2001-02-29' })).not.toBe('')
  expect(profileError({ ...form, birthday: '2999-01-01' })).not.toBe('')
})
