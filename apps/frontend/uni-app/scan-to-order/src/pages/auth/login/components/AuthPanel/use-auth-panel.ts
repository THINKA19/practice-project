import { ref, watch } from 'vue'
import { useLoginWechatAuthorization } from '../../composables/use-wechat-authorization'
import { useSessionState } from '@/pages/auth/session'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'

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
    agreed.value = false
    error.value = ''
    visible.value = true
  }
  async function authorize() {
    if (!agreed.value) {
      error.value = '请先阅读并同意用户协议和隐私政策'
      return
    }
    if (await submit(demo)) {
      visible.value = false
      uni.showToast({ title: '登录成功', icon: 'success' })
    }
  }
  function webLogin() {
    if (!agreed.value)
      return
    visible.value = false
    void navigate(ClientRoutes.Auth.login)
  }

  return { visible, agreed, loading, error, demo, open, authorize, webLogin }
}
