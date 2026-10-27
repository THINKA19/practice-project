import { readPrivacyPolicy, readUserAgreement } from './use-agreement-navigation'
import { ref, watch } from 'vue'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'
import { useLoginFlow } from './use-flow'
import { currentLocale, t } from '@/locale'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useLoginView() {
  const { agreed, loading, error, ticket, expired, channel, mobileBrowser, demo, init, start, confirmDemo, resume, pause } = useLoginFlow()
  onLoad((query) => {
    void init(query)
  })
  function cancelLogin() {
    pause()
    if (getCurrentPages().length > 1)
      uni.navigateBack({ fail: () => { void navigate(ClientRoutes.Account.my) } })
    else
      void navigate(ClientRoutes.Account.my)
  }
  const pageVisible = ref(false)
  function setTitle() {
    uni.setNavigationBarTitle({ title: t('auth.wechatLogin') })
  }
  onShow(() => {
    pageVisible.value = true
    setTitle()
    resume()
  })
  onHide(() => {
    pageVisible.value = false
    pause()
  })
  watch(currentLocale, () => {
    if (pageVisible.value)
      setTitle()
  })
  return { readPrivacyPolicy, readUserAgreement, t, agreed, loading, error, ticket, expired, channel, mobileBrowser, demo, init, start, confirmDemo, resume, pause, cancelLogin, pageVisible, setTitle }
}
