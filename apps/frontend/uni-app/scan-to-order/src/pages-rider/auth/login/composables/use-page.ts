import type { IAuthLoginRes } from '@/pages/auth/session'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, onScopeDispose, ref } from 'vue'
import { t } from '@/locale'
import { useSessionState } from '@/pages/auth/session'
import { RiderRoutes } from '@/pages-rider/routes'
import { getAllPages } from '@/utils'
import { loginWithWechatPhone, riderWechatLoginAvailable } from '../api/login.api'
import { isDemo, login, serviceReady } from './use-actions'

/** 装配骑手登录和回跳，共享 Session 负责校验身份与提交凭证。 */
export function useRiderLoginPage() {
  const session = useSessionState()
  const username = ref('')
  const password = ref('')
  const loading = ref(false)
  const error = ref('')
  const authenticated = computed(() => session.hasLogin && session.identity === 'rider')
  let disposed = false
  let target = RiderRoutes.Workspace.workspace as string

  onScopeDispose(() => {
    disposed = true
    password.value = ''
  })

  onShow(() => {
    session.updateNowTime()
    if (session.identity === 'rider' && !session.hasLogin && !session.authenticating)
      session.clearSession()
  })

  onLoad((query) => {
    try {
      const value = decodeURIComponent(String(query?.redirect ?? ''))
      const pathname = value.split(/[?#]/)[0]

      if (pathname.startsWith('/pages-rider/') && !pathname.includes('/auth/login/') && getAllPages().some(page => page.path === pathname))
        target = value
    }
    catch {
      target = RiderRoutes.Workspace.workspace
    }
  })

  function enterWorkspace() {
    if (!disposed && authenticated.value)
      uni.redirectTo({ url: target })
  }

  async function authenticate(exchange: () => Promise<IAuthLoginRes>) {
    if (disposed || loading.value)
      return

    loading.value = true
    error.value = ''
    try {
      await session.authenticate('rider', exchange)
      password.value = ''
      enterWorkspace()
    }
    catch (reason) {
      if (!disposed)
        error.value = reason instanceof Error ? reason.message : t('rider.login.signInFailed')
    }
    finally {
      if (!disposed)
        loading.value = false
    }
  }

  async function submit() {
    if (serviceReady)
      await authenticate(() => login(username.value, password.value))
  }

  async function authorizeWechatPhone(event: { detail?: { code?: string } }) {
    if (disposed || loading.value || session.hasLogin || session.authenticating || !riderWechatLoginAvailable)
      return

    const phoneCode = event.detail?.code
    if (!phoneCode) {
      error.value = t('rider.login.phoneDenied')
      return
    }

    await authenticate(async () => {
      const loginCode = await new Promise<string>((resolve, reject) => {
        uni.login({
          provider: 'weixin',
          success: ({ code }) => {
            if (code)
              resolve(code)
            else
              reject(new Error(t('rider.login.wechatMissingCode')))
          },
          fail: () => reject(new Error(t('rider.login.wechatUnavailable'))),
        })
      })

      if (disposed)
        throw new Error('登录页面已关闭')

      return loginWithWechatPhone({ loginCode, phoneCode })
    })
  }

  async function logout() {
    if (disposed || loading.value)
      return

    loading.value = true
    error.value = ''
    try {
      await session.logout()
    }
    catch (reason) {
      if (!disposed)
        error.value = reason instanceof Error ? reason.message : t('rider.login.signOutFailed')
    }
    finally {
      if (!disposed)
        loading.value = false
    }
  }

  return { username, password, loading, error, authenticated, session, serviceReady, isDemo, riderWechatLoginAvailable, enterWorkspace, authorizeWechatPhone, submit, logout }
}
