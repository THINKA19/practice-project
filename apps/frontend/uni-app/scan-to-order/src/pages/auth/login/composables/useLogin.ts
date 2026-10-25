/**
 * 【文件概述】顾客微信登录页面编排：协议确认、授权票据、轮询和页面生命周期。
 * 【方法与导出清单】useLogin。
 * 【综合使用示例】const vm = useLogin(); await vm.start()
 */
import { getWxCode } from './useWechatCredential'
import type { WechatExchange, WechatTicket } from '../models/wechat'
import { onScopeDispose, ref } from 'vue'
import { resolveRedirect } from '../domain/redirect'
import { AGREEMENT_VERSION } from '../../agreement'
import { getWechatEnvironment } from './useWechatEnvironment'
import { browserCallback, clearPending, readPending, savePending } from '../storage/oauthPending'
import { loginApi } from '../api/login'
import { useSession } from '@/pages/auth/session'
import { USE_MOCK } from '@/mock/config'
import { getAllPages } from '@/utils'
import { ClientRoutes } from '@/pages/routes'
import { t } from '@/locale'

export function useLogin() {
  const session = useSession()

  const agreed = ref(false)

  const loading = ref(false)

  const error = ref('')

  const ticket = ref<WechatTicket | null>(null)

  const expired = ref(false)

  const redirect = ref(ClientRoutes.Home.home as string)

  const { channel, mobileBrowser } = getWechatEnvironment()

  let visible = false

  let disposed = false

  let revision = 0

  let timer: ReturnType<typeof setTimeout> | undefined

  function stop() {
    if (timer)
      clearTimeout(timer)

    timer = undefined
  }
  onScopeDispose(() => {
    disposed = true

    revision++

    stop()
  })

  function finish() {
    clearPending()

    return new Promise<void>((resolve, reject) => uni.reLaunch({ url: redirect.value, success: () => resolve(), fail: reject }))
  }
  async function authenticate(payload: WechatExchange) {
    if (loading.value || disposed)
      return

    loading.value = true

    error.value = ''

    stop()

    try {
      await session.authenticate('customer', () => loginApi.exchange(payload))

      if (!disposed && visible)
        await finish()
    }
    catch (e) {
      if (!disposed)
        error.value = e instanceof Error ? e.message : t('auth.loginFailed')
    }
    finally {
      if (!disposed)
        loading.value = false
    }
  }
  async function poll() {
    if (!visible || disposed || !ticket.value || loading.value || expired.value)
      return

    const current = ticket.value

    const request = revision

    try {
      const result = await loginApi.status(current)

      if (request !== revision || disposed || !visible)
        return

      if (result.status === 'expired' || result.status === 'used' || Date.now() >= current.expiresAt) {
        expired.value = true

        return
      }
      if (result.status === 'confirmed') {
        await authenticate({ ticket: current.id, pollToken: current.pollToken, channel, agreementVersion: AGREEMENT_VERSION })

        return
      }
      timer = setTimeout(poll, 1500)
    }
    catch (e) {
      if (!disposed && request === revision)
        error.value = e instanceof Error ? e.message : t('auth.loginFailed')
    }
  }
  function resume() {
    visible = true

    void poll()
  }
  function pause() {
    revision++

    visible = false

    stop()
  }
  async function init(query?: Record<string, unknown>) {
    redirect.value = resolveRedirect(query?.redirect, getAllPages().map(p => p.path), ClientRoutes.Home.home)

    if (!session.updateNowTime().hasLogin && session.identity === 'customer')
      session.clearSession()

    if (session.hasLogin && session.identity !== 'customer') {
      error.value = t('auth.wxDifferentRole')

      return
    }
    if (session.hasLogin) {
      try {
        await finish()
      }
      catch {
        error.value = t('common.navigationFailed')
      }
      return
    }
    const callback = browserCallback(query)

    if (callback.code || callback.state) {
      const pending = readPending()

      if (!pending || callback.state !== pending.id || !callback.code) {
        error.value = t('auth.wxInvalidCallback')

        return
      }
      agreed.value = true

      redirect.value = resolveRedirect(pending.redirect, getAllPages().map(p => p.path), ClientRoutes.Home.home)

      await authenticate({ code: callback.code, state: callback.state, channel: pending.channel, agreementVersion: AGREEMENT_VERSION })
    }
  }
  async function start() {
    if (loading.value)
      return

    error.value = ''

    session.updateNowTime()

    if (session.hasLogin && session.identity !== 'customer') {
      error.value = t('auth.wxDifferentRole')

      return
    }
    if (session.hasLogin) {
      try {
        await finish()
      }
      catch {
        error.value = t('common.navigationFailed')
      }
      return
    }
    if (!agreed.value) {
      error.value = t('auth.agreementRequired')

      return
    }
    if (mobileBrowser && !USE_MOCK) {
      error.value = t('auth.wxOpenWechat')

      return
    }
    stop()

    revision++

    ticket.value = null

    expired.value = false

    loading.value = true

    try {
      if (channel === 'mini' && !USE_MOCK) {
        const result = await getWxCode()

        const code = result.code

        if (!code)
          throw new Error('微信登录未返回 code')

        loading.value = false

        await authenticate({ code, channel, agreementVersion: AGREEMENT_VERSION })

        return
      }
      const current = await loginApi.start(channel, AGREEMENT_VERSION)

      if (disposed)
        return

      if (USE_MOCK) {
        ticket.value = current
      }
      else {
        if (!current.authorizationUrl)
          throw new Error(t('auth.wxUnavailable'))

        // #ifdef H5
        const url = new URL(current.authorizationUrl)

        if (url.origin !== 'https://open.weixin.qq.com')
          throw new Error(t('auth.wxUnavailable'))

        savePending(current, redirect.value, channel)

        window.location.assign(current.authorizationUrl)

        // #endif
      }
    }
    catch (e) {
      if (!disposed)
        error.value = e instanceof Error ? e.message : t('auth.loginFailed')
    }
    finally {
      if (!disposed) {
        loading.value = false

        void poll()
      }
    }
  }
  async function confirmDemo() {
    if (!USE_MOCK || !ticket.value || loading.value)
      return

    if (!agreed.value) {
      error.value = t('auth.agreementRequired')

      return
    }
    const current = ticket.value

    loading.value = true

    stop()

    try {
      await loginApi.confirmDemo(current)

      loading.value = false

      await authenticate({ ticket: current.id, pollToken: current.pollToken, channel, agreementVersion: AGREEMENT_VERSION })
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : t('auth.loginFailed')
    }
    finally {
      loading.value = false
    }
  }
  return { agreed, loading, error, ticket, expired, channel, mobileBrowser, demo: USE_MOCK, init, start, confirmDemo, resume, pause }
}
