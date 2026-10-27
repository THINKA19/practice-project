import { PageState } from '@/components/page-state'
import { toLoginPage } from '@/utils/toLoginPage'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'
import { ref, watch } from 'vue'
import { useOrderDoingList } from '../composables'
import { currentLocale, t } from '@/locale'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useOrderDoingView() {
  const { scene, scenes, selectScene, apiOk, orderList, logisticsMap, goodsMap, fetchOrderList, loading, failed, needsLogin } = useOrderDoingList()
  /** 导航栏标题：definePage 里的是编译期静态兜底，这里按当前语言覆盖 */
  function setTitle() {
    uni.setNavigationBarTitle({ title: t('orderDoing.title') })
  }
  const pageVisible = ref(false)
  watch(currentLocale, () => {
    if (pageVisible.value)
      setTitle()
  })
  onHide(() => {
    pageVisible.value = false
  })
  onLoad(setTitle)
  // 用 onShow 而不是 onLoad：从详情页返回、或刚下完单切过来，都要重新取一次
  onShow(() => {
    pageVisible.value = true
    setTitle()
    fetchOrderList()
  })
  return { PageState, toLoginPage, ClientRoutes, navigate, t, scene, scenes, selectScene, apiOk, orderList, logisticsMap, goodsMap, fetchOrderList, loading, failed, needsLogin, setTitle, pageVisible }
}
