import { ref } from 'vue'
import { getWxCode } from './use-wechat-credential'
import { loginApi } from '../api/login.api'
import { AGREEMENT_VERSION, ensurePrivacyConsent } from '../../agreement'
import { useSessionState } from '@/pages/auth/session'

/** 微信登录票据提交，不获取手机号，服务端校验后建立唯一会话。 */
export function useLoginWechatAuthorization() {
  const loading = ref(false)
  const error = ref('')
  const session = useSessionState()

  async function authorize(demo = false) {
    if (loading.value)
      return false
    loading.value = true
    error.value = ''
    try {
      if (!await ensurePrivacyConsent())
        return false
      // 同意后可能恢复原有会话，无需重新申请微信凭证。
      if (session.hasLogin)
        return session.identity === 'customer'
      if (session.identity === 'customer')
        session.clearSession()
      const revision = session.sessionRevision
      if (demo && loginApi.demo) {
        const ticket = await loginApi.start('mini', AGREEMENT_VERSION)
        await loginApi.confirmDemo(ticket)
        if (revision !== session.sessionRevision)
          throw new Error('会话已变化，请重新登录')
        await session.authenticate('customer', () => loginApi.exchange({ ticket: ticket.id, pollToken: ticket.pollToken, channel: 'mini', agreementVersion: AGREEMENT_VERSION }))
      }
      else {
        const { code } = await getWxCode()
        if (revision !== session.sessionRevision)
          throw new Error('会话已变化，请重新登录')
        if (!code)
          throw new Error('微信登录凭证获取失败')
        await session.authenticate('customer', () => loginApi.exchange({ code, channel: 'mini', agreementVersion: AGREEMENT_VERSION }))
      }
      return true
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '授权登录失败，请重试'
      return false
    }
    finally {
      loading.value = false
    }
  }
  return { loading, error, demo: loginApi.demo, authorize }
}
