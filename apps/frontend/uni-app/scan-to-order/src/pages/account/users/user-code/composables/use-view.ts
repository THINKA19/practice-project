import { onHide, onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'
import { useUserCodePage } from './use-page'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useUserCodeView() {
  function goBack() {
    uni.navigateBack({
      fail: () => {
        void navigate(ClientRoutes.Account.my)
      },
    })
  }
  const { user, demo, balance, score, loading, failed, memberCode, codeStatus, refresh, suspend, login } = useUserCodePage()
  onHide(suspend)
  onShow(() => {
    void refresh()
  })
  onPullDownRefresh(async () => {
    try {
      await refresh()
    }
    finally { uni.stopPullDownRefresh() }
  })
  return { goBack, user, demo, balance, score, loading, failed, memberCode, codeStatus, refresh, suspend, login }
}
