import { ref, watch } from 'vue'
import { useLoginWechatAuthorization } from '../../composables/use-wechat-authorization'
import { redirectToLogin, useSessionState } from '@/pages/auth/session'
import { getWechatEnvironment } from '../../composables/use-wechat-environment'

/** One authorization panel instance; shared credential handling stays in login. */
export function usePanel() {
  const visible = ref(false)
  const agreed = ref(false)
  const session = useSessionState()
  const { loading, error, demo, authorize: submit } = useLoginWechatAuthorization()
  watch(() => session.hasLogin, (value) => {
    if (value)
      visible.value = false
  })
  function open() {
    if (demo || getWechatEnvironment().channel !== 'mini') {
      redirectToLogin({ identity: 'customer' })
      return
    }
    agreed.value = false
    error.value = ''
    visible.value = true
  }
  async function authorize() {
    if (!agreed.value) {
      error.value = '请先阅读并同意用户协议和隐私政策'
      return
    }
    if (await submit()) {
      visible.value = false
      uni.showToast({ title: '登录成功', icon: 'success' })
    }
  }
  return { visible, agreed, loading, error, open, authorize }
}
